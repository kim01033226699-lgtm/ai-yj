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

// 카테고리 목록 로드
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

