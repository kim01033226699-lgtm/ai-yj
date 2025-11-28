import type { Category } from './types'
import type { PresetOption } from './presetAnswers'
import { PRESET_ANSWERS } from './presetAnswers'

const STORAGE_KEY = 'preset-answers-data'

// 로컬스토리지에서 프리셋 답변 데이터 로드
export function loadPresetAnswers(): Record<NonNullable<Category>, PresetOption[]> | null {
  if (typeof window === 'undefined') return null

  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      return JSON.parse(stored)
    }
  } catch (error) {
    console.error('프리셋 답변 로드 오류:', error)
  }

  return null
}

// 로컬스토리지에 프리셋 답변 데이터 저장
export function savePresetAnswers(
  data: Record<NonNullable<Category>, PresetOption[]>
): void {
  if (typeof window === 'undefined') return

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch (error) {
    console.error('프리셋 답변 저장 오류:', error)
  }
}

// 기본값으로 초기화
export function resetPresetAnswers(): void {
  if (typeof window === 'undefined') return
  savePresetAnswers(PRESET_ANSWERS)
}

// 현재 저장된 데이터 또는 기본값 반환
export function getPresetAnswers(): Record<NonNullable<Category>, PresetOption[]> {
  const stored = loadPresetAnswers()
  return stored || PRESET_ANSWERS
}


