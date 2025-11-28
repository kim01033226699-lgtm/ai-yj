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

// 현재 선택 경로로부터 답변 찾기
export function findAnswerByPath(
  category: Category,
  path: SelectionPath
): string | null {
  if (!category) return null

  // 동적으로 저장된 데이터 또는 기본값 사용
  let options: PresetOption[]
  if (typeof window !== 'undefined') {
    const { getPresetAnswers } = require('./presetAnswersStorage')
    const answers = getPresetAnswers()
    options = answers[category]
  } else {
    options = PRESET_ANSWERS[category]
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
    const { getPresetAnswers } = require('./presetAnswersStorage')
    const answers = getPresetAnswers()
    options = answers[category]
  } else {
    options = PRESET_ANSWERS[category]
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
  
  // 동적으로 저장된 데이터 또는 기본값 사용
  if (typeof window !== 'undefined') {
    const { getPresetAnswers } = require('./presetAnswersStorage')
    const answers = getPresetAnswers()
    return answers[category] || null
  }
  
  return PRESET_ANSWERS[category] || null
}

