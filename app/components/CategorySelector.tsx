'use client'

import { useEffect, useState } from 'react'
import { CATEGORIES } from '../lib/categories'
import { getCategoryLabel } from '../lib/categoryLabels'
import { loadCategories, loadCategoriesAsync, type CategoryData } from '../lib/categoryStorage'
import type { Category } from '../lib/types'

interface CategorySelectorProps {
  selectedCategory: Category
  onSelectCategory: (category: Category) => void
  disabled?: boolean
}

export function CategorySelector({
  selectedCategory,
  onSelectCategory,
  disabled = false,
}: CategorySelectorProps) {
  const [categories, setCategories] = useState<CategoryData[]>([])

  useEffect(() => {
    // 초기 로드: 파일에서도 로드 시도
    const loadInitialCategories = async () => {
      const loadedCategories = await loadCategoriesAsync()
      setCategories(loadedCategories)
    }
    loadInitialCategories()
    
    // 카테고리 업데이트 이벤트 리스너
    const handleUpdate = () => {
      setCategories(loadCategories())
    }
    
    window.addEventListener('categoriesUpdated', handleUpdate)
    return () => {
      window.removeEventListener('categoriesUpdated', handleUpdate)
    }
  }, [])

  return (
    <div className="p-4 bg-white border-b border-gray-200">
      <div className="flex gap-2 flex-wrap">
        {categories.map((category) => {
          const rawLabel = getCategoryLabel(category.id) || category.label
          // 카테고리명에서 이모지 제거
          const removeEmojiFromLabel = (label: string): string => {
            return label.replace(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F600}-\u{1F64F}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{1F900}-\u{1F9FF}]|[\u{1FA00}-\u{1FA6F}]|[\u{1FA70}-\u{1FAFF}]|[\u{2190}-\u{21FF}]|[\u{2300}-\u{23FF}]|[\u{2B50}-\u{2B55}]|[\u{3030}-\u{303F}]|[\u{FE00}-\u{FE0F}]|[\u{1F018}-\u{1F270}]/gu, '').trim()
          }
          const categoryLabel = removeEmojiFromLabel(rawLabel) || rawLabel
          const isSelected = selectedCategory === category.id

          return (
            <button
              key={category.id}
              onClick={() => !disabled && onSelectCategory(category.id as Category)}
              disabled={disabled}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                isSelected
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              {categoryLabel}
            </button>
          )
        })}
      </div>
    </div>
  )
}

