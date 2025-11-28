'use client'

import { CATEGORIES } from '../lib/categories'
import { getCategoryLabel } from '../lib/categoryLabels'
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
  const categories: ('support' | 'campus' | 'appointment')[] = ['support', 'campus', 'appointment']

  return (
    <div className="p-4 bg-white border-b border-gray-200">
      <p className="text-xs text-gray-600 mb-3 font-medium">카테고리를 선택해주세요</p>
      <div className="flex gap-2">
        {categories.map((category) => {
          const categoryInfo = CATEGORIES[category]
          const categoryLabel = getCategoryLabel(category)
          const isSelected = selectedCategory === category

          return (
            <button
              key={category}
              onClick={() => !disabled && onSelectCategory(category)}
              disabled={disabled}
              className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
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

