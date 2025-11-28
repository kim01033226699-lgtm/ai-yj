import { CATEGORIES } from './categories'
import type { Category } from './types'

const STORAGE_KEY = 'category-labels'

// 카테고리 라벨 로드
export function getCategoryLabel(category: NonNullable<Category>): string {
  if (typeof window === 'undefined') {
    return CATEGORIES[category].label
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const labels = JSON.parse(stored)
      return labels[category] || CATEGORIES[category].label
    }
  } catch (error) {
    console.error('카테고리 라벨 로드 오류:', error)
  }

  return CATEGORIES[category].label
}

// 모든 카테고리 라벨 가져오기
export function getAllCategoryLabels(): Record<NonNullable<Category>, string> {
  const defaultLabels = {
    support: CATEGORIES.support.label,
    campus: CATEGORIES.campus.label,
    appointment: CATEGORIES.appointment.label,
  }

  if (typeof window === 'undefined') {
    return defaultLabels
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const labels = JSON.parse(stored)
      return {
        support: labels.support || defaultLabels.support,
        campus: labels.campus || defaultLabels.campus,
        appointment: labels.appointment || defaultLabels.appointment,
      }
    }
  } catch (error) {
    console.error('카테고리 라벨 로드 오류:', error)
  }

  return defaultLabels
}


