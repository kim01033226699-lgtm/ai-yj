import type { Category } from './types'
import { CATEGORIES } from './categories'

const STORAGE_KEY = 'categories-list'

export interface CategoryData {
  id: string
  label: string
  emoji: string
  description: string
}

// 기본 카테고리 목록
const DEFAULT_CATEGORIES: CategoryData[] = [
  {
    id: 'support',
    label: '지원금',
    emoji: '💰',
    description: '지원금 관련 문의',
  },
  {
    id: 'campus',
    label: '금융캠퍼스',
    emoji: '🏫',
    description: '금융캠퍼스 관련 문의',
  },
  {
    id: 'appointment',
    label: '위촉',
    emoji: '📋',
    description: '위촉 관련 문의',
  },
]

// 파일에서 카테고리 데이터 로드 (public/categories.json)
export async function loadCategoriesFromFile(): Promise<CategoryData[] | null> {
  if (typeof window === 'undefined') return null

  try {
    const basePath = process.env.NODE_ENV === 'production' ? '/ai-yj' : ''
    const filePath = `${basePath}/categories.json`
    
    const response = await fetch(filePath, {
      cache: 'no-store', // 항상 최신 파일을 가져오기
    })
    
    if (response.ok) {
      const data = await response.json()
      if (Array.isArray(data) && data.length > 0) {
        return data
      }
    } else if (response.status === 404) {
      console.log('카테고리 파일이 없습니다. 기본값을 사용합니다.')
      return null
    }
  } catch (error) {
    console.error('카테고리 파일 로드 오류:', error)
  }

  return null
}

// 카테고리 목록 로드 (로컬스토리지 우선, 없으면 파일, 없으면 기본값)
export function loadCategories(): CategoryData[] {
  if (typeof window === 'undefined') return DEFAULT_CATEGORIES

  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      // 저장된 카테고리가 있으면 사용, 없으면 기본값
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed
      }
    }
  } catch (error) {
    console.error('카테고리 로드 오류:', error)
  }

  // 기본값 반환 (초기 로드 시)
  return DEFAULT_CATEGORIES
}

// 비동기 버전: 구글시트, 파일에서도 로드 시도
export async function loadCategoriesAsync(): Promise<CategoryData[]> {
  if (typeof window === 'undefined') return DEFAULT_CATEGORIES

  // 1. 구글 시트에서 로드 시도 (환경 변수에 시트 ID가 있는 경우, 우선순위 최상)
  // 카테고리 시트 ID가 없으면 프리셋 시트 ID 사용 (같은 시트에서 카테고리도 가져옴)
  const googleSheetId = process.env.NEXT_PUBLIC_GOOGLE_CATEGORIES_SHEET_ID || process.env.NEXT_PUBLIC_GOOGLE_SHEET_ID
  const googleSheetGid = process.env.NEXT_PUBLIC_GOOGLE_SHEET_GID || '0'
  if (googleSheetId) {
    try {
      const { loadCategoriesFromGoogleSheets } = await import('./googleSheetsLoader')
      const sheetData = await loadCategoriesFromGoogleSheets(googleSheetId, googleSheetGid)
      if (sheetData && sheetData.length > 0) {
        console.log('구글 시트에서 카테고리 로드 성공:', sheetData.length, '개')
        // 구글 시트 데이터를 로컬스토리지에도 동기화
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(sheetData))
        } catch (e) {
          // 로컬스토리지 저장 실패는 무시
        }
        return sheetData
      } else {
        console.log('구글 시트에서 카테고리를 찾을 수 없습니다.')
      }
    } catch (error) {
      console.error('구글 시트 카테고리 로드 실패:', error)
    }
  }

  // 2. 로컬스토리지에서 확인 (구글 시트가 없을 때만)
  const stored = loadCategories()
  if (stored && stored.length > 0 && stored !== DEFAULT_CATEGORIES) {
    return stored
  }

  // 3. 로컬스토리지에 없으면 파일에서 로드 시도
  const fileData = await loadCategoriesFromFile()
  if (fileData) {
    // 파일 데이터를 로컬스토리지에도 동기화 (로컬스토리지가 비어있을 때만)
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(fileData))
    } catch (e) {
      // 로컬스토리지 저장 실패는 무시
    }
    return fileData
  }

  // 4. 기본값 반환
  return DEFAULT_CATEGORIES
}

// 카테고리 목록 저장
export function saveCategories(categories: CategoryData[]): void {
  if (typeof window === 'undefined') return

  try {
    // 모든 카테고리 저장
    localStorage.setItem(STORAGE_KEY, JSON.stringify(categories))
  } catch (error) {
    console.error('카테고리 저장 오류:', error)
  }
}

// 카테고리 데이터를 JSON 파일로 다운로드
export function downloadCategoriesAsFile(categories: CategoryData[]): void {
  if (typeof window === 'undefined') return

  try {
    const jsonString = JSON.stringify(categories, null, 2)
    const blob = new Blob([jsonString], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'categories.json'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    console.log('카테고리 파일 다운로드 완료')
  } catch (error) {
    console.error('카테고리 파일 다운로드 오류:', error)
  }
}

// 카테고리 추가
export function addCategory(category: Omit<CategoryData, 'id'>): CategoryData {
  const newCategory: CategoryData = {
    ...category,
    id: `custom-${Date.now()}`,
  }
  const categories = loadCategories()
  categories.push(newCategory)
  saveCategories(categories)
  
  // 카테고리 업데이트 이벤트 발생
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('categoriesUpdated'))
  }
  
  return newCategory
}

// 카테고리 삭제
export function deleteCategory(categoryId: string): boolean {
  const categories = loadCategories()
  const filtered = categories.filter((cat) => cat.id !== categoryId)
  
  // 모든 카테고리 저장 (기본 카테고리 포함)
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered))
    } catch (error) {
      console.error('카테고리 저장 오류:', error)
      return false
    }
  }
  
  // 카테고리 업데이트 이벤트 발생
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('categoriesUpdated'))
  }
  
  return true
}

// 카테고리 업데이트
export function updateCategory(categoryId: string, updates: Partial<CategoryData>): boolean {
  const categories = loadCategories()
  const index = categories.findIndex((cat) => cat.id === categoryId)
  
  if (index === -1) return false

  categories[index] = { ...categories[index], ...updates }
  saveCategories(categories)
  
  // 카테고리 업데이트 이벤트 발생
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('categoriesUpdated'))
  }
  
  return true
}

// 카테고리 ID로 찾기
export function getCategoryById(categoryId: string): CategoryData | null {
  const categories = loadCategories()
  return categories.find((cat) => cat.id === categoryId) || null
}

