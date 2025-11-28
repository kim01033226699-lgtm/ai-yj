import type { PresetOption } from './presetAnswers'
import type { CategoryData } from './categoryStorage'

// 구글 시트에서 프리셋 답변 데이터 로드
// 시트를 공개로 설정하고 CSV 형식으로 가져오기
export async function loadPresetAnswersFromGoogleSheets(
  sheetId: string,
  gid: string = '0'
): Promise<Record<string, PresetOption[]> | null> {
  if (typeof window === 'undefined') return null

  try {
    // 구글 시트 CSV URL 형식: https://docs.google.com/spreadsheets/d/{SHEET_ID}/export?format=csv&gid={GID}
    const csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${gid}`
    
    const response = await fetch(csvUrl, {
      cache: 'no-store',
    })

    if (!response.ok) {
      console.error('구글 시트 로드 실패:', response.status)
      return null
    }

    const csvText = await response.text()
    const data = parseCSVToPresetAnswers(csvText)
    
    // 디버깅: 파싱된 데이터 구조 확인
    if (data && Object.keys(data).length > 0) {
      console.log('파싱된 프리셋 답변 데이터 구조:')
      Object.keys(data).forEach(category => {
        console.log(`카테고리 "${category}": ${data[category].length}개 최상위 옵션`)
        data[category].forEach((opt, idx) => {
          console.log(`  [${idx + 1}] ${opt.label}${opt.answer ? ' (답변 있음)' : ''}${opt.children ? ` (하위 옵션 ${opt.children.length}개)` : ''}`)
          // 하위 옵션이 있으면 하위 옵션도 출력
          if (opt.children && opt.children.length > 0) {
            opt.children.forEach((child, childIdx) => {
              console.log(`    └─ [${childIdx + 1}] ${child.label}${child.answer ? ' (답변 있음)' : ''}`)
            })
          }
        })
      })
    }
    
    return data
  } catch (error) {
    console.error('구글 시트 로드 오류:', error)
    return null
  }
}

// 구글 시트에서 카테고리 데이터 로드
export async function loadCategoriesFromGoogleSheets(
  sheetId: string,
  gid: string = '0'
): Promise<CategoryData[] | null> {
  if (typeof window === 'undefined') return null

  try {
    const csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${gid}`
    
    const response = await fetch(csvUrl, {
      cache: 'no-store',
    })

    if (!response.ok) {
      console.error('구글 시트 로드 실패:', response.status)
      return null
    }

    const csvText = await response.text()
    const data = parseCSVToCategories(csvText)
    
    return data
  } catch (error) {
    console.error('구글 시트 로드 오류:', error)
    return null
  }
}

// CSV를 프리셋 답변 형식으로 파싱
// 구글 시트 구조:
// A,B열: 카테고리 ID/label (무시, 별도로 처리)
// D열: 카테고리 ID
// E열: 최상위옵션 (레벨1 라벨)
// F열: 상세내용 (레벨1 답변 - 있으면 하위 옵션 무시)
// G열: 옵션1 (레벨2-1 라벨) - F열이 비어있을 때만 사용
// H열: 상세내용 (레벨2-1 답변)
// I열: 옵션2 (레벨2-2 라벨)
// J열: 상세내용 (레벨2-2 답변)
// K열: 옵션3 (레벨2-3 라벨)
// L열: 상세내용 (레벨2-3 답변)
// M열: 옵션4 (레벨2-4 라벨)
// N열: 상세내용 (레벨2-4 답변)
function parseCSVToPresetAnswers(csvText: string): Record<string, PresetOption[]> {
  // 따옴표 안의 줄바꿈을 고려한 CSV 라인 분리
  const lines = splitCSVLines(csvText).filter(line => line.trim())
  if (lines.length < 3) return {} // 헤더 2줄 + 데이터 최소 1줄

  const result: Record<string, PresetOption[]> = {}
  
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
    const level1Option: PresetOption = {
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
      const children: PresetOption[] = []
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

// CSV를 카테고리 형식으로 파싱
// 구글 시트 구조:
// A열: 카테고리 ID
// B열: 카테고리 label
// C열 이후: 프리셋 설정 (무시)
function parseCSVToCategories(csvText: string): CategoryData[] {
  // 따옴표 안의 줄바꿈을 고려한 CSV 라인 분리
  const lines = splitCSVLines(csvText).filter(line => line.trim())
  if (lines.length < 3) return [] // 헤더 2줄 + 데이터 최소 1줄

  const result: CategoryData[] = []
  const seenIds = new Set<string>()

  // 헤더는 2줄 (1행: 카테고리설정/프리셋설정, 2행: 실제 컬럼명)
  // 데이터는 3행부터 시작
  for (let i = 2; i < lines.length; i++) {
    const values = parseCSVLine(lines[i])
    if (values.length < 2) continue // 최소 A, B열 필요

    // A열: 카테고리 ID (인덱스 0)
    const id = values[0]?.trim()
    // B열: 카테고리 label (인덱스 1)
    const label = values[1]?.trim()

    if (!id || !label) continue
    
    // 중복 제거
    if (seenIds.has(id)) continue
    seenIds.add(id)

    // 이모지는 기본값으로 설정 (나중에 시트에 추가 가능)
    const emojiMap: Record<string, string> = {
      'appoint': '📋',
      'guarantee': '💼',
      'grant': '💰',
      'gfe': '🏫',
      'support': '💰',
      'campus': '🏫',
      'appointment': '📋',
    }

    result.push({
      id: id,
      label: label,
      emoji: emojiMap[id.toLowerCase()] || '📁',
      description: `${label} 관련 문의`,
    })
  }

  return result
}

// CSV 텍스트를 라인별로 분리 (따옴표 안의 줄바꿈은 무시)
function splitCSVLines(csvText: string): string[] {
  const lines: string[] = []
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
function parseCSVLine(line: string): string[] {
  const result: string[] = []
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

