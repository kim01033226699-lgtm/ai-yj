import type { Category } from './types'

// 프리셋 답변 옵션 타입
export interface PresetOption {
  id: string
  label: string
  children?: PresetOption[] // 하위 옵션이 있으면 children, 없으면 답변이 있음
  answer?: string // 최종 답변
}

// 카테고리별 프리셋 답변 구조 (기본값)
export const PRESET_ANSWERS: Record<NonNullable<Category>, PresetOption[]> = {
  support: [
    {
      id: 'A',
      label: 'A 옵션',
      children: [
        {
          id: 'A-가',
          label: '가',
          answer: '지원금 A 옵션의 "가"에 대한 답변입니다.\n\n상세 내용:\n- 항목 1\n- 항목 2\n- 항목 3',
        },
        {
          id: 'A-나',
          label: '나',
          answer: '지원금 A 옵션의 "나"에 대한 답변입니다.\n\n상세 내용:\n- 항목 1\n- 항목 2',
        },
        {
          id: 'A-다',
          label: '다',
          answer: '지원금 A 옵션의 "다"에 대한 답변입니다.\n\n상세 내용:\n- 항목 1\n- 항목 2\n- 항목 3',
        },
      ],
    },
    {
      id: 'B',
      label: 'B 옵션',
      children: [
        {
          id: 'B-가',
          label: '가',
          answer: '지원금 B 옵션의 "가"에 대한 답변입니다.\n\n상세 내용:\n- 항목 1\n- 항목 2',
        },
        {
          id: 'B-나',
          label: '나',
          answer: '지원금 B 옵션의 "나"에 대한 답변입니다.\n\n상세 내용:\n- 항목 1\n- 항목 2\n- 항목 3',
        },
        {
          id: 'B-다',
          label: '다',
          answer: '지원금 B 옵션의 "다"에 대한 답변입니다.\n\n상세 내용:\n- 항목 1',
        },
      ],
    },
    {
      id: 'C',
      label: 'C 옵션',
      children: [
        {
          id: 'C-가',
          label: '가',
          answer: '지원금 C 옵션의 "가"에 대한 답변입니다.\n\n상세 내용:\n- 항목 1\n- 항목 2\n- 항목 3',
        },
        {
          id: 'C-나',
          label: '나',
          answer: '지원금 C 옵션의 "나"에 대한 답변입니다.\n\n상세 내용:\n- 항목 1\n- 항목 2',
        },
        {
          id: 'C-다',
          label: '다',
          answer: '지원금 C 옵션의 "다"에 대한 답변입니다.\n\n상세 내용:\n- 항목 1\n- 항목 2\n- 항목 3',
        },
      ],
    },
  ],
  campus: [
    {
      id: 'A',
      label: 'A 옵션',
      children: [
        {
          id: 'A-가',
          label: '가',
          answer: '금융캠퍼스 A 옵션의 "가"에 대한 답변입니다.\n\n상세 내용:\n- 항목 1\n- 항목 2',
        },
        {
          id: 'A-나',
          label: '나',
          answer: '금융캠퍼스 A 옵션의 "나"에 대한 답변입니다.\n\n상세 내용:\n- 항목 1\n- 항목 2\n- 항목 3',
        },
        {
          id: 'A-다',
          label: '다',
          answer: '금융캠퍼스 A 옵션의 "다"에 대한 답변입니다.\n\n상세 내용:\n- 항목 1',
        },
      ],
    },
    {
      id: 'B',
      label: 'B 옵션',
      children: [
        {
          id: 'B-가',
          label: '가',
          answer: '금융캠퍼스 B 옵션의 "가"에 대한 답변입니다.\n\n상세 내용:\n- 항목 1\n- 항목 2\n- 항목 3',
        },
        {
          id: 'B-나',
          label: '나',
          answer: '금융캠퍼스 B 옵션의 "나"에 대한 답변입니다.\n\n상세 내용:\n- 항목 1\n- 항목 2',
        },
        {
          id: 'B-다',
          label: '다',
          answer: '금융캠퍼스 B 옵션의 "다"에 대한 답변입니다.\n\n상세 내용:\n- 항목 1\n- 항목 2\n- 항목 3',
        },
      ],
    },
    {
      id: 'C',
      label: 'C 옵션',
      children: [
        {
          id: 'C-가',
          label: '가',
          answer: '금융캠퍼스 C 옵션의 "가"에 대한 답변입니다.\n\n상세 내용:\n- 항목 1',
        },
        {
          id: 'C-나',
          label: '나',
          answer: '금융캠퍼스 C 옵션의 "나"에 대한 답변입니다.\n\n상세 내용:\n- 항목 1\n- 항목 2\n- 항목 3',
        },
        {
          id: 'C-다',
          label: '다',
          answer: '금융캠퍼스 C 옵션의 "다"에 대한 답변입니다.\n\n상세 내용:\n- 항목 1\n- 항목 2',
        },
      ],
    },
  ],
  appointment: [
    {
      id: 'A',
      label: 'A 옵션',
      children: [
        {
          id: 'A-가',
          label: '가',
          answer: '위촉 A 옵션의 "가"에 대한 답변입니다.\n\n상세 내용:\n- 항목 1\n- 항목 2\n- 항목 3',
        },
        {
          id: 'A-나',
          label: '나',
          answer: '위촉 A 옵션의 "나"에 대한 답변입니다.\n\n상세 내용:\n- 항목 1\n- 항목 2',
        },
        {
          id: 'A-다',
          label: '다',
          answer: '위촉 A 옵션의 "다"에 대한 답변입니다.\n\n상세 내용:\n- 항목 1\n- 항목 2\n- 항목 3',
        },
      ],
    },
    {
      id: 'B',
      label: 'B 옵션',
      children: [
        {
          id: 'B-가',
          label: '가',
          answer: '위촉 B 옵션의 "가"에 대한 답변입니다.\n\n상세 내용:\n- 항목 1',
        },
        {
          id: 'B-나',
          label: '나',
          answer: '위촉 B 옵션의 "나"에 대한 답변입니다.\n\n상세 내용:\n- 항목 1\n- 항목 2\n- 항목 3',
        },
        {
          id: 'B-다',
          label: '다',
          answer: '위촉 B 옵션의 "다"에 대한 답변입니다.\n\n상세 내용:\n- 항목 1\n- 항목 2',
        },
      ],
    },
    {
      id: 'C',
      label: 'C 옵션',
      children: [
        {
          id: 'C-가',
          label: '가',
          answer: '위촉 C 옵션의 "가"에 대한 답변입니다.\n\n상세 내용:\n- 항목 1\n- 항목 2\n- 항목 3',
        },
        {
          id: 'C-나',
          label: '나',
          answer: '위촉 C 옵션의 "나"에 대한 답변입니다.\n\n상세 내용:\n- 항목 1',
        },
        {
          id: 'C-다',
          label: '다',
          answer: '위촉 C 옵션의 "다"에 대한 답변입니다.\n\n상세 내용:\n- 항목 1\n- 항목 2\n- 항목 3',
        },
      ],
    },
  ],
}

// 선택 경로 타입 (선택한 옵션들의 ID를 순서대로 저장)
export type SelectionPath = string[]

// 카테고리 ID 매핑 (UI 카테고리 ID → 구글 시트 카테고리 ID)
// 구글 시트의 카테고리 ID와 UI의 카테고리 ID가 다를 수 있으므로 매핑 필요
function mapCategoryIdToSheetId(category: Category): string | null {
  if (!category) return null

  // 카테고리 ID 매핑 테이블 (확장됨)
  const categoryMapping: Record<string, string[]> = {
    'appointment': ['appointment', 'appoint'], // UI: appointment → 시트: appointment 또는 appoint
    'appoint': ['appoint', 'appointment'], // UI: appoint → 시트: appoint 또는 appointment
    'grant': ['grant', 'guarantee'], // UI: grant → 시트: grant 또는 guarantee
    'guarantee': ['guarantee', 'grant'], // UI: guarantee → 시트: guarantee 또는 grant
    'support': ['support', 'grant', 'guarantee'], // UI: support → 시트: support, grant 또는 guarantee
    'campus': ['campus', 'gfe'], // UI: campus → 시트: campus 또는 gfe
    'gfe': ['gfe', 'campus'], // UI: gfe → 시트: gfe 또는 campus
  }

  const possibleIds = categoryMapping[category] || [category]
  return possibleIds[0] // 첫 번째 매핑된 ID 반환
}

// 구글 시트의 카테고리 ID를 UI 카테고리 ID로 역매핑
function findSheetCategoryId(uiCategoryId: Category, availableSheetIds: string[]): string | null {
  if (!uiCategoryId) return null

  // 카테고리 ID 매핑 테이블 (확장됨)
  const categoryMapping: Record<string, string[]> = {
    'appointment': ['appointment', 'appoint'],
    'appoint': ['appoint', 'appointment'],
    'grant': ['grant', 'guarantee'],
    'guarantee': ['guarantee', 'grant'],
    'support': ['support', 'grant', 'guarantee'],
    'campus': ['campus', 'gfe'],
    'gfe': ['gfe', 'campus'],
  }

  const possibleIds = categoryMapping[uiCategoryId] || [uiCategoryId]

  // 가능한 ID 중에서 사용 가능한 첫 번째 ID 찾기
  for (const possibleId of possibleIds) {
    if (availableSheetIds.includes(possibleId)) {
      return possibleId
    }
  }

  // 대소문자 무시 매칭 시도
  const matchedKey = availableSheetIds.find(key =>
    possibleIds.some(pid => key.toLowerCase() === pid.toLowerCase())
  )

  return matchedKey || null
}

// 현재 선택 경로로부터 답변 찾기
export function findAnswerByPath(
  category: Category,
  path: SelectionPath
): string | null {
  if (!category) return null

  // 동적으로 저장된 데이터 또는 기본값 사용
  let options: PresetOption[]
  if (typeof window !== 'undefined') {
    try {
      const { getPresetAnswersSync } = require('./presetAnswersStorage')
      const answers = getPresetAnswersSync()
      const categoryId = category || ''
      
      // 카테고리 ID 매칭
      if (answers) {
        const availableCategories = Object.keys(answers)
        
        // 정확한 매칭 시도
        if (answers[categoryId] && Array.isArray(answers[categoryId])) {
          options = answers[categoryId]
        } else {
          // 카테고리 ID 매핑을 통한 매칭 시도
          const mappedSheetId = findSheetCategoryId(category, availableCategories)
          if (mappedSheetId && answers[mappedSheetId] && Array.isArray(answers[mappedSheetId])) {
            options = answers[mappedSheetId]
          } else {
            // 대소문자 무시 매칭 시도
            const matchedKey = availableCategories.find(key => key.toLowerCase() === categoryId.toLowerCase())
            if (matchedKey && Array.isArray(answers[matchedKey])) {
              options = answers[matchedKey]
            } else if (category && PRESET_ANSWERS[category]) {
              options = PRESET_ANSWERS[category]
            } else {
              options = []
            }
          }
        }
      } else if (category && PRESET_ANSWERS[category]) {
        options = PRESET_ANSWERS[category]
      } else {
        options = []
      }
    } catch (error) {
      console.error('프리셋 답변 로드 오류:', error)
      options = category && PRESET_ANSWERS[category] ? PRESET_ANSWERS[category] : []
    }
  } else {
    options = category && PRESET_ANSWERS[category] ? PRESET_ANSWERS[category] : []
  }
  
  // options가 없거나 배열이 아니면 빈 배열 사용
  if (!options || !Array.isArray(options)) {
    options = []
  }

  let current: PresetOption[] | PresetOption | undefined = options

  for (const id of path) {
    if (Array.isArray(current)) {
      current = current.find((opt) => opt.id === id)
    } else if (current && 'children' in current) {
      current = current.children?.find((opt) => opt.id === id)
    } else {
      return null
    }

    if (!current) return null
  }

  // 최종 선택이 답변을 가지고 있는지 확인
  // children이 없고 answer가 있으면 답변 반환
  if (current) {
    // children이 있는지 확인
    const hasChildren = 'children' in current && current.children && current.children.length > 0
    
    // children이 없고 answer가 있으면 답변 반환
    if (!hasChildren && 'answer' in current && current.answer) {
      return current.answer
    }
  }

  return null
}

// 현재 경로의 다음 단계 옵션들 가져오기
export function getNextOptions(
  category: Category,
  path: SelectionPath
): PresetOption[] | null {
  if (!category) return null

  // 동적으로 저장된 데이터 또는 기본값 사용
  let options: PresetOption[]
  if (typeof window !== 'undefined') {
    try {
      const { getPresetAnswersSync } = require('./presetAnswersStorage')
      const answers = getPresetAnswersSync()
      const categoryId = category || ''
      
      // 디버깅: 카테고리 ID와 사용 가능한 카테고리 확인
      if (answers) {
        const availableCategories = Object.keys(answers)
        
        // 정확한 매칭 시도
        if (answers[categoryId] && Array.isArray(answers[categoryId])) {
          options = answers[categoryId]
        } else {
          // 카테고리 ID 매핑을 통한 매칭 시도
          const mappedSheetId = findSheetCategoryId(category, availableCategories)
          if (mappedSheetId && answers[mappedSheetId] && Array.isArray(answers[mappedSheetId])) {
            options = answers[mappedSheetId]
          } else {
            // 대소문자 무시 매칭 시도
            const matchedKey = availableCategories.find(key => key.toLowerCase() === categoryId.toLowerCase())
            if (matchedKey && Array.isArray(answers[matchedKey])) {
              options = answers[matchedKey]
            } else if (category && PRESET_ANSWERS[category]) {
              options = PRESET_ANSWERS[category]
            } else {
              options = []
            }
          }
        }
      } else if (category && PRESET_ANSWERS[category]) {
        options = PRESET_ANSWERS[category]
      } else {
        options = []
      }
    } catch (error) {
      console.error('프리셋 답변 로드 오류:', error)
      options = category && PRESET_ANSWERS[category] ? PRESET_ANSWERS[category] : []
    }
  } else {
    options = category && PRESET_ANSWERS[category] ? PRESET_ANSWERS[category] : []
  }
  
  // options가 없거나 배열이 아니면 빈 배열 사용
  if (!options || !Array.isArray(options)) {
    options = []
  }

  let current: PresetOption[] | PresetOption | undefined = options

  for (const id of path) {
    if (Array.isArray(current)) {
      current = current.find((opt) => opt.id === id)
    } else if (current && 'children' in current) {
      current = current.children?.find((opt) => opt.id === id)
    } else {
      return null
    }

    if (!current) return null
  }

  // 현재 선택의 children 반환 (children이 있으면 우선 표시)
  if (current && 'children' in current && current.children && current.children.length > 0) {
    return current.children
  }

  // children이 없으면 null 반환 (답변 또는 제목 표시로 넘어감)
  return null
}

// 첫 번째 단계 옵션들 가져오기
export function getFirstLevelOptions(category: Category): PresetOption[] | null {
  if (!category) return null

  // category가 유효한 카테고리 ID인지 확인 (옵션 제목이 아닌지)
  // 유효한 카테고리 ID: 'support', 'campus', 'appointment', 'grant' 등 (짧고 특정 패턴)
  const validCategoryIds = [
    'support', 'campus', 'appointment', 'grant',
    'appoint', 'guarantee', 'gfe'
  ]

  // 카테고리 ID가 너무 길거나 유효하지 않은 경우 에러
  if (typeof category === 'string' && category.length > 20 && !validCategoryIds.includes(category.toLowerCase())) {
    console.error(`[getFirstLevelOptions] 잘못된 category 값 (옵션 제목으로 보임): "${category}"`)
    return null
  }
  
  // 동적으로 저장된 데이터 또는 기본값 사용
  if (typeof window !== 'undefined') {
    try {
      const { getPresetAnswersSync } = require('./presetAnswersStorage')
      const answers = getPresetAnswersSync()
      
      // 디버깅: 카테고리 ID와 사용 가능한 카테고리 확인
      if (answers && Object.keys(answers).length > 0) {
        const availableCategories = Object.keys(answers)
        console.log(`[getFirstLevelOptions] 카테고리 "${category}" 요청, 사용 가능한 카테고리:`, availableCategories)
        
        // 정확한 매칭 시도
        if (answers[category] && Array.isArray(answers[category])) {
          console.log(`[getFirstLevelOptions] 카테고리 "${category}"의 옵션 ${answers[category].length}개 반환`)
          return answers[category]
        }
        
        // 카테고리 ID 매핑을 통한 매칭 시도
        const mappedSheetId = findSheetCategoryId(category, availableCategories)
        if (mappedSheetId && answers[mappedSheetId] && Array.isArray(answers[mappedSheetId])) {
          console.log(`[getFirstLevelOptions] 카테고리 "${category}"를 "${mappedSheetId}"로 매칭하여 옵션 ${answers[mappedSheetId].length}개 반환`)
          return answers[mappedSheetId]
        }
        
        // 대소문자 무시 매칭 시도
        const matchedKey = availableCategories.find(key => key.toLowerCase() === category.toLowerCase())
        if (matchedKey && answers[matchedKey] && Array.isArray(answers[matchedKey])) {
          console.log(`[getFirstLevelOptions] 카테고리 "${category}"를 "${matchedKey}"로 매칭하여 옵션 ${answers[matchedKey].length}개 반환`)
          return answers[matchedKey]
        }
        
        console.warn(`[getFirstLevelOptions] 카테고리 "${category}"를 구글 시트에서 찾을 수 없습니다. 기본값을 사용합니다. 사용 가능한 카테고리:`, availableCategories)
      }
    } catch (error) {
      console.error('프리셋 답변 로드 오류:', error)
    }
  }
  
  // 구글 시트에서 찾지 못했거나 에러가 발생한 경우 기본값 반환
  const defaultOptions = PRESET_ANSWERS[category]
  if (defaultOptions) {
    console.log(`[getFirstLevelOptions] 카테고리 "${category}"의 기본값 ${defaultOptions.length}개 반환`)
    return defaultOptions
  }
  
  return null
}

