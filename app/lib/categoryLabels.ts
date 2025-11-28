import { CATEGORIES } from './categories'
import type { Category } from './types'
import { getCategoryById } from './categoryStorage'

const STORAGE_KEY = 'category-labels'

// 카테고리 라벨 로드 (커스텀 카테고리 지원)
export function getCategoryLabel(category: NonNullable<Category> | string): string {
  // 먼저 categoryStorage에서 커스텀 카테고리 확인
  if (typeof window !== 'undefined') {
    const customCategory = getCategoryById(category)
    if (customCategory) {
      // 커스텀 카테고리 라벨이 저장되어 있으면 사용
      try {
        const stored = localStorage.getItem(STORAGE_KEY)
        if (stored) {
          const labels = JSON.parse(stored)
          if (labels[category]) {
            return labels[category]
          }
        }
      } catch (error) {
        console.error('카테고리 라벨 로드 오류:', error)
      }
      return customCategory.label
    }
  }

  // 기본 카테고리인 경우
  if (category === 'support' || category === 'campus' || category === 'appointment') {
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

  // 알 수 없는 카테고리인 경우 빈 문자열 반환
  return ''
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


