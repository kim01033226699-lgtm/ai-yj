// 구글 시트에서 문서 데이터를 가져와서 public/documents.json으로 저장
const fs = require('fs')
const path = require('path')
const https = require('https')

// .env.local 파일 로드
require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') })

const GOOGLE_SHEET_ID = process.env.NEXT_PUBLIC_GOOGLE_SHEET_ID
const DOCUMENTS_SHEET_GID = process.env.NEXT_PUBLIC_DOCUMENTS_SHEET_GID

if (!GOOGLE_SHEET_ID || !DOCUMENTS_SHEET_GID) {
  console.warn('⚠️  환경 변수가 설정되지 않았습니다. 빈 문서 목록으로 저장합니다.')
  const outputPath = path.resolve(__dirname, '../public/documents.json')
  fs.writeFileSync(outputPath, JSON.stringify([], null, 2), 'utf-8')
  console.log('💾 빈 파일 저장 완료:', outputPath)
  process.exit(0)
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

// CSV를 문서 형식으로 파싱
// 구글 시트 구조 (질문답변 탭):
// A열(인덱스 0): 카테고리
// B열(인덱스 1): Q:질문?A:답변 형식
function parseCSVToDocuments(csvText) {
  const lines = splitCSVLines(csvText).filter(line => line.trim())
  if (lines.length < 2) return [] // 헤더 1줄 + 데이터 최소 1줄

  const result = []

  // 헤더는 1줄
  // 데이터는 2행부터 시작
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i])
    if (values.length < 2) continue // 최소 A, B열 필요

    // A열: 카테고리 (인덱스 0)
    const category = values[0]?.trim()
    // B열: Q:질문?A:답변 (인덱스 1)
    const qaText = values[1]?.trim() || ''

    if (!category || !qaText) continue

    // Q:와 A: 분리
    const qMatch = qaText.match(/Q:\s*(.+?)\s*A:/i)
    const aMatch = qaText.match(/A:\s*(.+)/i)

    if (!qMatch || !aMatch) {
      console.warn(`⚠️  "${category}" 카테고리의 Q&A 형식이 올바르지 않습니다: ${qaText.substring(0, 50)}...`)
      continue
    }

    const question = qMatch[1].trim()
    const answer = aMatch[1].trim()

    if (!question || !answer) continue

    // 문서명: 카테고리 - 질문
    const name = `[${category}] ${question}`
    // 문서내용: 질문과 답변을 명확하게 구분
    const content = `질문: ${question}\n\n답변: ${answer}`

    result.push({
      name: name,
      content: content,
      type: 'md',
      path: `sheet:${category}:${Date.now() + i}`,
    })
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
    console.log('📥 구글 시트에서 문서 데이터 가져오는 중...')
    console.log(`   Sheet ID: ${GOOGLE_SHEET_ID}`)
    console.log(`   Documents GID: ${DOCUMENTS_SHEET_GID}`)

    const csvText = await fetchGoogleSheetCSV(GOOGLE_SHEET_ID, DOCUMENTS_SHEET_GID)
    const documents = parseCSVToDocuments(csvText)

    if (!documents || documents.length === 0) {
      console.log('⚠️  문서 데이터가 없습니다. 빈 배열로 저장합니다.')
    } else {
      console.log('✅ 문서 데이터 파싱 완료:')
      documents.forEach((doc, index) => {
        console.log(`   [${index + 1}] ${doc.name} (${doc.type}, ${doc.content.length}자)`)
      })
    }

    const outputPath = path.resolve(__dirname, '../public/documents.json')
    fs.writeFileSync(outputPath, JSON.stringify(documents, null, 2), 'utf-8')
    console.log(`💾 파일 저장 완료: ${outputPath}`)
  } catch (error) {
    console.error('❌ 오류 발생:', error.message)
    // 오류 시 빈 배열로 저장 (빌드 실패 방지)
    const outputPath = path.resolve(__dirname, '../public/documents.json')
    fs.writeFileSync(outputPath, JSON.stringify([], null, 2), 'utf-8')
    console.log('⚠️  오류로 인해 빈 문서 목록으로 저장됨')
  }
}

main()
