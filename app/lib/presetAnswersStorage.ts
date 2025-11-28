import type { Category } from './types'
import type { PresetOption } from './presetAnswers'
import { PRESET_ANSWERS } from './presetAnswers'
import { loadCategories } from './categoryStorage'

const STORAGE_KEY = 'preset-answers-data'

// 정적 파일에서 프리셋 답변 데이터 로드 (public/preset-answers.json)
export async function loadPresetAnswersFromFile(): Promise<Record<string, PresetOption[]> | null> {
  if (typeof window === 'undefined') return null

  try {
    // basePath를 고려한 경로 생성
    const basePath = process.env.NODE_ENV === 'production' ? '/ai-yj' : ''
    const filePath = `${basePath}/preset-answers.json`
    
    const response = await fetch(filePath, {
      cache: 'no-store', // 항상 최신 파일을 가져오기
    })
    
    if (response.ok) {
      const data = await response.json()
      return data
    } else if (response.status === 404) {
      // 파일이 없으면 null 반환 (기본값 사용)
      console.log('프리셋 답변 파일이 없습니다. 기본값을 사용합니다.')
      return null
    }
  } catch (error) {
    console.error('프리셋 답변 파일 로드 오류:', error)
  }

  return null
}

// 프리셋 답변 데이터를 JSON 파일로 다운로드
export function downloadPresetAnswersAsFile(
  data: Record<string, PresetOption[]>
): void {
  if (typeof window === 'undefined') return

  try {
    const jsonString = JSON.stringify(data, null, 2)
    const blob = new Blob([jsonString], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'preset-answers.json'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    console.log('프리셋 답변 파일 다운로드 완료')
  } catch (error) {
    console.error('프리셋 답변 파일 다운로드 오류:', error)
  }
}

// 로컬스토리지에서 프리셋 답변 데이터 로드 (폴백용)
export function loadPresetAnswers(): Record<string, PresetOption[]> | null {
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
  data: Record<string, PresetOption[]>
): void {
  if (typeof window === 'undefined') return

  try {
    // 현재 카테고리 목록 확인
    const categories = loadCategories()
    const categoryIds = categories.map(c => c.id)
    
    // 모든 카테고리가 포함되어 있는지 확인
    const missingCategories = categoryIds.filter(id => !data[id])
    if (missingCategories.length > 0) {
      console.warn('일부 카테고리가 누락되었습니다:', missingCategories)
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    const categoryCounts = categories.reduce((acc, cat) => {
      acc[cat.label] = data[cat.id]?.length || 0
      return acc
    }, {} as Record<string, number>)
    console.log('프리셋 답변 로컬스토리지 저장 완료:', categoryCounts)
    
    // 저장 완료 이벤트 발생 (채팅창에서 데이터 갱신을 위해)
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('presetAnswersUpdated'))
    }
  } catch (error) {
    console.error('프리셋 답변 저장 오류:', error)
  }
}

// 기본값으로 초기화
export function resetPresetAnswers(): void {
  if (typeof window === 'undefined') return
  // 기본 카테고리만 초기화
  const defaultData: Record<string, PresetOption[]> = {
    support: PRESET_ANSWERS.support,
    campus: PRESET_ANSWERS.campus,
    appointment: PRESET_ANSWERS.appointment,
  }
  savePresetAnswers(defaultData)
}

// 현재 저장된 데이터 또는 기본값 반환 (로컬스토리지 우선, 없으면 파일, 없으면 기본값)
export async function getPresetAnswers(): Promise<Record<string, PresetOption[]>> {
  // 1. 먼저 로컬스토리지에서 확인 (관리자가 수정한 데이터 우선)
  const stored = loadPresetAnswers()
  if (stored) {
    return stored
  }
  
  // 2. 로컬스토리지에 없으면 파일에서 로드 시도
  const fileData = await loadPresetAnswersFromFile()
  if (fileData) {
    // 파일 데이터를 로컬스토리지에도 동기화 (로컬스토리지가 비어있을 때만)
    try {
      localStorage.setItem('preset-answers-data', JSON.stringify(fileData))
    } catch (e) {
      // 로컬스토리지 저장 실패는 무시
    }
    return fileData
  }
  
  // 3. 기본값 반환
  return {
    support: PRESET_ANSWERS.support,
    campus: PRESET_ANSWERS.campus,
    appointment: PRESET_ANSWERS.appointment,
  }
}

// 동기 버전 (기존 코드 호환성용) - 로컬스토리지에서 읽기
export function getPresetAnswersSync(): Record<string, PresetOption[]> {
  const stored = loadPresetAnswers()
  if (stored) {
    return stored
  }
  // 기본값 반환
  return {
    support: PRESET_ANSWERS.support,
    campus: PRESET_ANSWERS.campus,
    appointment: PRESET_ANSWERS.appointment,
  }
}

// 파일에서 데이터를 로컬스토리지로 동기화 (초기 로드 시 호출)
// 단, localStorage에 이미 데이터가 있으면 덮어쓰지 않음 (관리자가 수정한 데이터 보호)
export async function syncPresetAnswersFromFile(): Promise<void> {
  if (typeof window === 'undefined') return
  
  try {
    // 먼저 localStorage에 데이터가 있는지 확인
    const existingData = loadPresetAnswers()
    if (existingData) {
      // localStorage에 데이터가 있으면 파일로 덮어쓰지 않음 (관리자가 수정한 데이터 보호)
      console.log('로컬스토리지에 데이터가 있어 파일 동기화를 건너뜁니다. 관리자가 수정한 데이터를 보호합니다.')
      return
    }
    
    // localStorage에 데이터가 없을 때만 파일에서 로드
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
      console.log('프리셋 답변 파일이 없습니다. 기본값을 사용합니다.')
    }
  } catch (error) {
    console.error('프리셋 답변 동기화 오류:', error)
  }
}


