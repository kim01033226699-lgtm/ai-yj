// 구글 시트에서 프리셋 답변 데이터를 가져와서 public/preset-answers.json으로 저장
const fs = require('fs')
const path = require('path')
const https = require('https')

// .env.local 파일 로드
require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') })

const GOOGLE_SHEET_ID = process.env.NEXT_PUBLIC_GOOGLE_SHEET_ID
const GOOGLE_SHEET_GID = process.env.NEXT_PUBLIC_GOOGLE_SHEET_GID || '0'

if (!GOOGLE_SHEET_ID) {
  console.error('❌ NEXT_PUBLIC_GOOGLE_SHEET_ID가 .env.local에 설정되지 않았습니다.')
  process.exit(1)
}

// CSV 텍스트를 라인별로 분리 (따옴표 안의 줄바꿈은 무시)
function splitCSVLines(csvText) {
  const lines = []
  let currentLine = ''
  let inQuotes = false

  for (let i = 0; i < csvText.length; i++) {
    const char = csvText[i]
    const nextChar = csvText[i + 1]

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // 이스케이프된 따옴표
        currentLine += '""'
        i++
      } else {
        // 따옴표 시작/끝
        inQuotes = !inQuotes
        currentLine += char
      }
    } else if (char === '\n' && !inQuotes) {
      // 따옴표 밖의 줄바꿈 = 라인 구분자
      if (currentLine) {
        lines.push(currentLine)
      }
      currentLine = ''
    } else if (char === '\r') {
      // \r은 무시 (Windows 줄바꿈 처리)
      if (!inQuotes && nextChar === '\n') {
        continue
      }
      currentLine += char
    } else {
      currentLine += char
    }
  }

  // 마지막 라인 추가
  if (currentLine) {
    lines.push(currentLine)
  }

  return lines
}

// CSV 라인 파싱 (쉼표와 따옴표 처리)
function parseCSVLine(line) {
  const result = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    const nextChar = line[i + 1]

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // 이스케이프된 따옴표
        current += '"'
        i++
      } else {
        // 따옴표 시작/끝
        inQuotes = !inQuotes
      }
    } else if (char === ',' && !inQuotes) {
      // 필드 구분자
      result.push(current)
      current = ''
    } else {
      current += char
    }
  }

  // 마지막 필드 추가
  result.push(current)
  return result
}

// CSV를 프리셋 답변 형식으로 파싱
function parseCSVToPresetAnswers(csvText) {
  const lines = splitCSVLines(csvText).filter(line => line.trim())
  if (lines.length < 3) return {} // 헤더 2줄 + 데이터 최소 1줄

  const result = {}

  // 헤더는 2줄 (1행: 카테고리설정/프리셋설정, 2행: 실제 컬럼명)
  // 데이터는 3행부터 시작
  for (let i = 2; i < lines.length; i++) {
    const values = parseCSVLine(lines[i])
    if (values.length < 6) continue // 최소 D, E, F열 필요

    // D열: 카테고리 ID (인덱스 3)
    const category = values[3]?.trim()
    // E열: 최상위옵션 (인덱스 4)
    const level1Label = values[4]?.trim()
    // F열: 상세내용 (인덱스 5)
    const level1Answer = values[5]?.trim() || ''

    if (!category || !level1Label) continue

    // 카테고리 초기화
    if (!result[category]) {
      result[category] = []
    }

    // 레벨1 옵션 ID 생성 (순서 보장을 위해 현재 배열 길이 + 1 사용)
    const level1Id = `level1-${result[category].length + 1}`

    // 레벨1 옵션 생성
    const level1Option = {
      id: level1Id,
      label: level1Label,
    }

    // F열에 상세내용이 있으면 → F열의 상세내용을 답변으로 설정 (하위 옵션 무시)
    // F열에 상세내용이 없으면 → G열부터 하위 옵션 수집
    if (level1Answer) {
      // F열에 상세내용이 있으면 답변으로 설정
      level1Option.answer = level1Answer
    } else {
      // F열에 상세내용이 없으면 G열부터 하위 옵션 수집
      const children = []
      let optionIndex = 1

      // G열부터 시작하여 옵션-답변 쌍 처리 (G=6, H=7, I=8, J=9, K=10, L=11, M=12, N=13...)
      for (let colIndex = 6; colIndex < values.length; colIndex += 2) {
        const optionLabel = values[colIndex]?.trim()
        const optionAnswer = values[colIndex + 1]?.trim() || ''

        if (optionLabel) {
          const optionId = `${level1Id}-${optionIndex}`
          children.push({
            id: optionId,
            label: optionLabel,
            answer: optionAnswer || undefined,
          })
          optionIndex++
        }
      }

      // 하위 옵션이 있으면 children 추가
      if (children.length > 0) {
        level1Option.children = children
      }
    }

    // 순서대로 추가 (중복 체크 없이, 시트의 순서대로)
    result[category].push(level1Option)
  }

  return result
}

// 구글 시트에서 CSV 가져오기
function fetchGoogleSheetCSV(sheetId, gid) {
  return new Promise((resolve, reject) => {
    const csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${gid}`

    const makeRequest = (url) => {
      https.get(url, (res) => {
        // 리다이렉트 처리 (301, 302, 307, 308)
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          console.log(`   리다이렉트: ${res.statusCode} -> ${res.headers.location}`)
          makeRequest(res.headers.location)
          return
        }

        if (res.statusCode !== 200) {
          reject(new Error(`HTTP ${res.statusCode}: ${res.statusMessage}`))
          return
        }

        let data = ''
        res.on('data', chunk => data += chunk)
        res.on('end', () => resolve(data))
      }).on('error', reject)
    }

    makeRequest(csvUrl)
  })
}

async function main() {
  try {
    console.log('📥 구글 시트에서 프리셋 답변 데이터 가져오는 중...')
    console.log(`   Sheet ID: ${GOOGLE_SHEET_ID}`)
    console.log(`   GID: ${GOOGLE_SHEET_GID}`)

    const csvText = await fetchGoogleSheetCSV(GOOGLE_SHEET_ID, GOOGLE_SHEET_GID)
    const presetAnswers = parseCSVToPresetAnswers(csvText)

    if (!presetAnswers || Object.keys(presetAnswers).length === 0) {
      console.error('❌ 프리셋 답변 데이터를 파싱하지 못했습니다.')
      process.exit(1)
    }

    console.log('✅ 프리셋 답변 데이터 파싱 완료:')
    Object.entries(presetAnswers).forEach(([category, options]) => {
      console.log(`   ${category}: ${options.length}개 옵션`)
    })

    const outputPath = path.resolve(__dirname, '../public/preset-answers.json')
    fs.writeFileSync(outputPath, JSON.stringify(presetAnswers, null, 2), 'utf-8')
    console.log(`💾 파일 저장 완료: ${outputPath}`)
  } catch (error) {
    console.error('❌ 오류 발생:', error.message)
    process.exit(1)
  }
}

main()
