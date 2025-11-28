import type { Category } from './types'
import type { PresetOption } from './presetAnswers'
import { PRESET_ANSWERS } from './presetAnswers'

const STORAGE_KEY = 'preset-answers-data'

// 서버에서 프리셋 답변 데이터 로드 (파일 기반)
export async function loadPresetAnswersFromFile(): Promise<Record<NonNullable<Category>, PresetOption[]> | null> {
  if (typeof window === 'undefined') return null

  try {
    const response = await fetch('/api/preset-answers')
    if (response.ok) {
      const data = await response.json()
      return data
    }
  } catch (error) {
    console.error('프리셋 답변 파일 로드 오류:', error)
  }

  return null
}

// 서버에 프리셋 답변 데이터 저장 (파일 기반)
export async function savePresetAnswersToFile(
  data: Record<NonNullable<Category>, PresetOption[]>
): Promise<boolean> {
  if (typeof window === 'undefined') return false

  try {
    // 모든 카테고리가 포함되어 있는지 확인
    const hasAllCategories = data.support && data.campus && data.appointment
    if (!hasAllCategories) {
      console.warn('파일 저장 시도: 일부 카테고리가 누락되었습니다:', {
        support: !!data.support,
        campus: !!data.campus,
        appointment: !!data.appointment,
      })
    }
    
    const response = await fetch('/api/preset-answers', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('프리셋 답변 파일 저장 실패:', response.status, errorData)
      return false
    }
    
    console.log('프리셋 답변 파일 저장 성공:', {
      support: data.support?.length || 0,
      campus: data.campus?.length || 0,
      appointment: data.appointment?.length || 0,
    })
    return true
  } catch (error) {
    console.error('프리셋 답변 파일 저장 오류:', error)
    return false
  }
}

// 로컬스토리지에서 프리셋 답변 데이터 로드 (폴백용)
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

// 로컬스토리지에 프리셋 답변 데이터 저장 (폴백용)
export function savePresetAnswers(
  data: Record<NonNullable<Category>, PresetOption[]>
): void {
  if (typeof window === 'undefined') return

  try {
    // 모든 카테고리가 포함되어 있는지 확인
    const hasAllCategories = data.support && data.campus && data.appointment
    if (!hasAllCategories) {
      console.warn('일부 카테고리가 누락되었습니다:', {
        support: !!data.support,
        campus: !!data.campus,
        appointment: !!data.appointment,
      })
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    console.log('프리셋 답변 로컬스토리지 저장 완료:', {
      support: data.support?.length || 0,
      campus: data.campus?.length || 0,
      appointment: data.appointment?.length || 0,
    })
    
    // 파일에도 저장 시도
    savePresetAnswersToFile(data).then((success) => {
      if (success) {
        console.log('프리셋 답변 파일 저장 완료')
      } else {
        console.warn('프리셋 답변 파일 저장 실패')
      }
    }).catch((error) => {
      console.error('프리셋 답변 파일 저장 오류:', error)
    })
  } catch (error) {
    console.error('프리셋 답변 저장 오류:', error)
  }
}

// 기본값으로 초기화
export function resetPresetAnswers(): void {
  if (typeof window === 'undefined') return
  savePresetAnswers(PRESET_ANSWERS)
}

// 현재 저장된 데이터 또는 기본값 반환 (파일 우선, 없으면 로컬스토리지, 없으면 기본값)
export async function getPresetAnswers(): Promise<Record<NonNullable<Category>, PresetOption[]>> {
  // 파일에서 로드 시도
  const fileData = await loadPresetAnswersFromFile()
  if (fileData) {
    // 파일 데이터를 로컬스토리지에도 동기화
    try {
      localStorage.setItem('preset-answers-data', JSON.stringify(fileData))
    } catch (e) {
      // 로컬스토리지 저장 실패는 무시
    }
    return fileData
  }
  
  // 로컬스토리지에서 로드 시도
  const stored = loadPresetAnswers()
  if (stored) {
    return stored
  }
  
  // 기본값 반환
  return PRESET_ANSWERS
}

// 동기 버전 (기존 코드 호환성용) - 로컬스토리지에서 읽기
export function getPresetAnswersSync(): Record<NonNullable<Category>, PresetOption[]> {
  const stored = loadPresetAnswers()
  return stored || PRESET_ANSWERS
}

// 파일에서 데이터를 로컬스토리지로 동기화 (초기 로드 시 호출)
export async function syncPresetAnswersFromFile(): Promise<void> {
  if (typeof window === 'undefined') return
  
  try {
    const fileData = await loadPresetAnswersFromFile()
    if (fileData) {
      // 모든 카테고리 데이터가 있는지 확인
      const hasAllCategories = fileData.support && fileData.campus && fileData.appointment
      if (hasAllCategories) {
        localStorage.setItem('preset-answers-data', JSON.stringify(fileData))
        console.log('프리셋 답변 파일에서 로컬스토리지로 동기화 완료')
      } else {
        console.warn('프리셋 답변 파일에 일부 카테고리가 없습니다:', fileData)
      }
    } else {
      console.log('프리셋 답변 파일이 없습니다. 로컬스토리지 데이터를 사용합니다.')
    }
  } catch (error) {
    console.error('프리셋 답변 동기화 오류:', error)
  }
}


