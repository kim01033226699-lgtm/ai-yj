'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Plus, Trash2, Edit2, Save, X } from 'lucide-react'
import { getPresetAnswers, getPresetAnswersSync, savePresetAnswers, resetPresetAnswers, downloadPresetAnswersAsFile } from '../../lib/presetAnswersStorage'
import { CATEGORIES } from '../../lib/categories'
import { loadCategories, saveCategories, addCategory, deleteCategory, updateCategory, type CategoryData } from '../../lib/categoryStorage'
import type { Category } from '../../lib/types'
import type { PresetOption } from '../../lib/presetAnswers'

export default function PresetAnswersAdminPage() {
  const router = useRouter()
  const [selectedCategory, setSelectedCategory] = useState<string>('support')
  const [data, setData] = useState<Record<string, PresetOption[]>>(
    getPresetAnswersSync()
  )
  const [isLoading, setIsLoading] = useState(true)

  // 초기 데이터 로드 (로컬스토리지 우선, 없으면 파일에서)
  useEffect(() => {
    async function loadData() {
      try {
        // 1. 먼저 로컬스토리지에서 확인 (사용자가 입력한 데이터 우선)
        const localData = getPresetAnswersSync()
        
        // 로컬스토리지에 데이터가 있는지 확인 (기본값이 아닌 실제 데이터인지 확인)
        const isRealData = localData && (
          JSON.stringify(localData) !== JSON.stringify(getPresetAnswersSync()) ||
          (localData.support?.length > 0 || localData.campus?.length > 0 || localData.appointment?.length > 0)
        )
        
        if (isRealData) {
          console.log('로컬스토리지에서 데이터 로드:', {
            support: localData.support?.length || 0,
            campus: localData.campus?.length || 0,
            appointment: localData.appointment?.length || 0,
          })
          setData(localData)
          setIsLoading(false)
          return
        }
        
        // 2. 로컬스토리지에 없으면 파일에서 로드
        const fileData = await getPresetAnswers()
        if (fileData) {
          console.log('파일에서 데이터 로드:', {
            support: fileData.support?.length || 0,
            campus: fileData.campus?.length || 0,
            appointment: fileData.appointment?.length || 0,
          })
          setData(fileData)
        }
      } catch (error) {
        console.error('데이터 로드 오류:', error)
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingCategory, setEditingCategory] = useState<NonNullable<Category> | null>(null)
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set())
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)
  const [categoryLabels, setCategoryLabels] = useState<Record<NonNullable<Category>, string>>({
    support: CATEGORIES.support.label,
    campus: CATEGORIES.campus.label,
    appointment: CATEGORIES.appointment.label,
  })
  const [categories, setCategories] = useState<CategoryData[]>([])
  const [isAddingCategory, setIsAddingCategory] = useState(false)
  const [newCategoryLabel, setNewCategoryLabel] = useState('')
  const [newCategoryEmoji, setNewCategoryEmoji] = useState('📁')

  // 카테고리 라벨 로드
  useEffect(() => {
    const stored = localStorage.getItem('category-labels')
    if (stored) {
      try {
        setCategoryLabels(JSON.parse(stored))
      } catch (e) {
        console.error('카테고리 라벨 로드 오류:', e)
      }
    }
  }, [])

  // 카테고리 목록 로드
  useEffect(() => {
    const loadedCategories = loadCategories()
    setCategories(loadedCategories)
  }, [])

  // 카테고리명에서 이모지 제거하는 함수
  const removeEmojiFromLabel = (label: string): string => {
    // 이모지 정규식: 유니코드 이모지 범위
    return label.replace(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F600}-\u{1F64F}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{1F900}-\u{1F9FF}]|[\u{1FA00}-\u{1FA6F}]|[\u{1FA70}-\u{1FAFF}]|[\u{2190}-\u{21FF}]|[\u{2300}-\u{23FF}]|[\u{2B50}-\u{2B55}]|[\u{3030}-\u{303F}]|[\u{FE00}-\u{FE0F}]|[\u{1F018}-\u{1F270}]/gu, '').trim()
  }

  // 카테고리 추가
  const handleAddCategory = () => {
    if (!newCategoryLabel.trim()) {
      alert('카테고리 이름을 입력해주세요.')
      return
    }

    const cleanedLabel = removeEmojiFromLabel(newCategoryLabel.trim())
    if (!cleanedLabel) {
      alert('카테고리 이름을 입력해주세요.')
      return
    }

    const newCategory = addCategory({
      label: cleanedLabel,
      emoji: newCategoryEmoji || '',
      description: '',
    })

    // 프리셋 답변 데이터에 빈 배열 추가
    setData((prev) => ({
      ...prev,
      [newCategory.id]: [],
    }))

    setCategories(loadCategories())
    setNewCategoryLabel('')
    setNewCategoryEmoji('📁')
    setIsAddingCategory(false)
    setSelectedCategory(newCategory.id)
  }

  // 카테고리 삭제
  const handleDeleteCategory = (categoryId: string) => {
    if (confirm('이 카테고리를 삭제하시겠습니까? 카테고리에 포함된 모든 프리셋 답변도 삭제됩니다.')) {
      deleteCategory(categoryId)
      setCategories(loadCategories())
      // 프리셋 답변 데이터에서도 제거
      setData((prev) => {
        const newData = { ...prev }
        delete newData[categoryId]
        return newData
      })
      // 현재 선택된 카테고리가 삭제된 경우 첫 번째 카테고리로 변경
      if (selectedCategory === categoryId) {
        const remainingCategories = loadCategories()
        if (remainingCategories.length > 0) {
          setSelectedCategory(remainingCategories[0].id)
        }
      }
    }
  }

  // 수동 저장 함수
  const handleSave = () => {
    savePresetAnswers(data)
    alert('저장이 완료되었습니다! 채팅창에 반영되었습니다.')
  }

  // 카테고리 라벨 변경 시 저장
  useEffect(() => {
    localStorage.setItem('category-labels', JSON.stringify(categoryLabels))
  }, [categoryLabels])

  // 옵션 추가
  const addOption = (parentPath: string[] = []) => {
    const newId = `new-${Date.now()}`
    const newOption: PresetOption = {
      id: newId,
      label: '새 옵션',
      children: [],
    }

    setData((prev) => {
      const newData = { ...prev }
      if (parentPath.length === 0) {
        // 최상위 레벨에 추가
        newData[selectedCategory] = [...(newData[selectedCategory] || []), newOption]
      } else {
        // 하위 레벨에 추가
        const updated = addOptionToPath(
          newData[selectedCategory] || [],
          parentPath,
          newOption
        )
        newData[selectedCategory] = updated
      }
      return newData
    })

    setEditingId(newId)
    if (parentPath.length > 0) {
      setExpandedPaths((prev) => new Set([...prev, parentPath.join('/')]))
    }
  }

  // 경로에 옵션 추가 헬퍼 함수
  const addOptionToPath = (
    options: PresetOption[],
    path: string[],
    newOption: PresetOption
  ): PresetOption[] => {
    if (path.length === 0) {
      return [...options, newOption]
    }

    const [first, ...rest] = path
    return options.map((opt) => {
      if (opt.id === first) {
        return {
          ...opt,
          children: opt.children
            ? addOptionToPath(opt.children, rest, newOption)
            : [newOption],
        }
      }
      return opt
    })
  }

  // 옵션 삭제
  const deleteOption = (path: string[]) => {
    setData((prev) => {
      const newData = { ...prev }
      if (path.length === 1) {
        // 최상위 레벨에서 삭제
        newData[selectedCategory] = (newData[selectedCategory] || []).filter(
          (opt) => opt.id !== path[0]
        )
      } else {
        // 하위 레벨에서 삭제
        const updated = deleteOptionFromPath(
          newData[selectedCategory] || [],
          path
        )
        newData[selectedCategory] = updated
      }
      return newData
    })
  }

  // 경로에서 옵션 삭제 헬퍼 함수
  const deleteOptionFromPath = (
    options: PresetOption[],
    path: string[]
  ): PresetOption[] => {
    if (path.length === 1) {
      return options.filter((opt) => opt.id !== path[0])
    }

    const [first, ...rest] = path
    return options.map((opt) => {
      if (opt.id === first) {
        return {
          ...opt,
          children: opt.children ? deleteOptionFromPath(opt.children, rest) : undefined,
        }
      }
      return opt
    })
  }

  // 옵션 업데이트 (저장하지 않고 메모리에서만 업데이트)
  const updateOption = (path: string[], updates: Partial<PresetOption>, keepEditing: boolean = false) => {
    setData((prev) => {
      const newData = { ...prev }
      const updated = updateOptionInPath(
        newData[selectedCategory] || [],
        path,
        updates
      )
      newData[selectedCategory] = updated
      return newData
    })
    // keepEditing이 true이면 편집 모드 유지
    if (!keepEditing) {
      setEditingId(null)
    }
  }

  // 경로에서 옵션 업데이트 헬퍼 함수
  const updateOptionInPath = (
    options: PresetOption[],
    path: string[],
    updates: Partial<PresetOption>
  ): PresetOption[] => {
    if (path.length === 1) {
      return options.map((opt) =>
        opt.id === path[0] ? { ...opt, ...updates } : opt
      )
    }

    const [first, ...rest] = path
    return options.map((opt) => {
      if (opt.id === first) {
        return {
          ...opt,
          children: opt.children
            ? updateOptionInPath(opt.children, rest, updates)
            : undefined,
        }
      }
      return opt
    })
  }

  // 경로에서 옵션 찾기
  const findOptionByPath = (
    options: PresetOption[],
    path: string[]
  ): PresetOption | null => {
    if (path.length === 0) return null
    if (path.length === 1) {
      return options.find((opt) => opt.id === path[0]) || null
    }

    const [first, ...rest] = path
    const option = options.find((opt) => opt.id === first)
    if (!option || !option.children) return null

    return findOptionByPath(option.children, rest)
  }

  // 최상위 옵션 순서 변경
  const reorderTopLevelOptions = (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return

    setData((prev) => {
      const newData = { ...prev }
      const options = [...(newData[selectedCategory] || [])]
      const [moved] = options.splice(fromIndex, 1)
      options.splice(toIndex, 0, moved)
      newData[selectedCategory] = options
      return newData
    })
  }

  // 드래그 시작
  const handleDragStart = (index: number, option: PresetOption) => {
    // 편집 중이거나 하위 메뉴가 펼쳐진 상태면 드래그 금지
    const pathKey = option.id
    const isExpanded = expandedPaths.has(pathKey)
    const isEditing = editingId === option.id || editingId !== null
    
    if (isEditing || isExpanded) {
      return
    }
    
    setDraggedIndex(index)
  }

  // 드래그 오버
  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    setDragOverIndex(index)
  }

  // 드래그 리브
  const handleDragLeave = () => {
    setDragOverIndex(null)
  }

  // 드롭
  const handleDrop = (e: React.DragEvent, toIndex: number) => {
    e.preventDefault()
    if (draggedIndex !== null && draggedIndex !== toIndex) {
      reorderTopLevelOptions(draggedIndex, toIndex)
    }
    setDraggedIndex(null)
    setDragOverIndex(null)
  }

  // 드래그 종료
  const handleDragEnd = () => {
    setDraggedIndex(null)
    setDragOverIndex(null)
  }

  // 트리 렌더링
  const renderOption = (option: PresetOption, path: string[], level: number = 0) => {
    const pathKey = path.join('/')
    const isExpanded = expandedPaths.has(pathKey)
    const isEditing = editingId === option.id
    const hasChildren = option.children && option.children.length > 0
    const hasAnswer = !!option.answer
    const isTopLevel = level === 0
    const canDrag = isTopLevel && !isEditing && !isExpanded

    return (
      <div key={option.id} className="mb-2">
        <div
          className={`flex items-center gap-2 p-2 rounded-lg ${
            level === 0
              ? 'bg-blue-50 border border-blue-200'
              : level === 1
              ? 'bg-green-50 border border-green-200'
              : 'bg-gray-50 border border-gray-200'
          } ${canDrag ? 'cursor-move' : ''}`}
          style={{ marginLeft: `${level * 20}px` }}
        >
          {/* 드래그 핸들 (최상위 옵션만, 편집 중이거나 펼쳐진 상태가 아닐 때만) */}
          {canDrag && (
            <div className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 flex-shrink-0">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <circle cx="4" cy="4" r="1.5" />
                <circle cx="12" cy="4" r="1.5" />
                <circle cx="4" cy="8" r="1.5" />
                <circle cx="12" cy="8" r="1.5" />
                <circle cx="4" cy="12" r="1.5" />
                <circle cx="12" cy="12" r="1.5" />
              </svg>
            </div>
          )}
          {/* 확장/축소 버튼 */}
          {hasChildren && (
            <button
              onClick={() => {
                setExpandedPaths((prev) => {
                  const newSet = new Set(prev)
                  if (isExpanded) {
                    newSet.delete(pathKey)
                  } else {
                    newSet.add(pathKey)
                  }
                  return newSet
                })
              }}
              className="w-6 h-6 flex items-center justify-center text-gray-600 hover:bg-white rounded"
            >
              {isExpanded ? '▼' : '▶'}
            </button>
          )}
          {!hasChildren && <div className="w-6" />}

          {/* 편집 모드 */}
          {isEditing ? (
            <div className="flex-1 flex flex-col gap-2" 
                 onBlur={(e) => {
                   // 같은 편집 영역 내의 다른 요소로 포커스가 이동하는 경우 무시
                   const currentTarget = e.currentTarget
                   const relatedTarget = e.relatedTarget as Node | null
                   if (relatedTarget && currentTarget.contains(relatedTarget)) {
                     return
                   }
                   // 편집 영역 밖으로 포커스가 이동하면 편집 모드 종료
                   setTimeout(() => {
                     if (!currentTarget.contains(document.activeElement)) {
                       setEditingId(null)
                     }
                   }, 200)
                 }}>
              <input
                type="text"
                defaultValue={option.label}
                onChange={(e) => {
                  // 실시간으로 라벨 업데이트 (편집 모드 유지)
                  updateOption(path, { label: e.target.value.trim() }, true)
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    // Enter 키를 누르면 textarea로 포커스 이동 (편집 모드 유지)
                    if (!hasChildren) {
                      e.preventDefault()
                      const textarea = e.currentTarget.parentElement?.querySelector('textarea')
                      textarea?.focus()
                    } else {
                      setEditingId(null)
                    }
                  }
                  if (e.key === 'Escape') {
                    setEditingId(null)
                  }
                }}
                className="px-2 py-1 border border-gray-300 rounded text-sm"
                autoFocus
              />
              {/* 답변이 없고 children도 없으면 답변 입력 필드 표시 */}
              {!hasChildren && (
                <textarea
                  defaultValue={option.answer || ''}
                  onChange={(e) => {
                    // 실시간으로 답변 업데이트 (편집 모드 유지)
                    updateOption(path, { answer: e.target.value }, true)
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') {
                      setEditingId(null)
                    }
                  }}
                  placeholder="답변 내용을 입력하세요 (비워두면 하위 옵션을 추가할 수 있습니다)"
                  className="px-2 py-1 border border-gray-300 rounded text-sm min-h-[100px]"
                />
              )}
              {/* 답변이 있지만 children도 있으면 둘 다 가능 */}
              {hasChildren && (
                <div className="text-xs text-gray-500 mb-2">
                  하위 옵션이 있습니다. 답변을 추가하려면 하위 옵션을 모두 삭제하거나, 하위 옵션 중 하나에 답변을 추가하세요.
                </div>
              )}
              <div className="flex gap-2">
                <button
                  onClick={() => setEditingId(null)}
                  className="px-2 py-1 bg-gray-200 hover:bg-gray-300 rounded text-xs"
                >
                  완료
                </button>
                <button
                  onClick={() => {
                    setEditingId(null)
                    // 취소 시 변경사항 되돌리기 (선택사항)
                  }}
                  className="px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded text-xs"
                >
                  취소
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* 표시 모드 */}
              <div className="flex-1">
                <div className="font-medium text-sm text-gray-800">{option.label}</div>
                {hasAnswer && (
                  <div className="text-xs text-gray-600 mt-1 line-clamp-2">
                    {option.answer}
                  </div>
                )}
              </div>

              {/* 액션 버튼 */}
              <div className="flex gap-1">
                <button
                  onClick={() => setEditingId(option.id)}
                  className="p-1 hover:bg-white rounded"
                  title="편집"
                >
                  <Edit2 className="w-4 h-4 text-blue-600" />
                </button>
                <button
                  onClick={() => addOption(path)}
                  className="p-1 hover:bg-white rounded"
                  title="하위 옵션 추가"
                >
                  <Plus className="w-4 h-4 text-green-600" />
                </button>
                <button
                  onClick={() => {
                    if (confirm('이 옵션을 삭제하시겠습니까?')) {
                      deleteOption(path)
                    }
                  }}
                  className="p-1 hover:bg-white rounded"
                  title="삭제"
                >
                  <Trash2 className="w-4 h-4 text-red-600" />
                </button>
              </div>
            </>
          )}
        </div>

        {/* 하위 옵션들 */}
        {hasChildren && isExpanded && (
          <div className="mt-1">
            {option.children!.map((child) =>
              renderOption(child, [...path, child.id], level + 1)
            )}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* 헤더 */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/')}
              className="p-2 hover:bg-gray-200 rounded-lg"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">프리셋 답변 관리</h1>
              <p className="text-sm text-gray-600 mt-1">
                카테고리별 단계별 선택 키워드와 답변을 설정할 수 있습니다.
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              저장
            </button>
            <button
              onClick={() => {
                if (confirm('모든 설정을 기본값으로 초기화하시겠습니까?')) {
                  resetPresetAnswers()
                  setData(getPresetAnswersSync())
                }
              }}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-sm font-medium"
            >
              기본값으로 초기화
            </button>
            <button
              onClick={async () => {
                // 1. 로컬스토리지에서 직접 확인
                try {
                  const stored = localStorage.getItem('preset-answers-data')
                  if (stored) {
                    const parsed = JSON.parse(stored)
                    console.log('로컬스토리지 원본 데이터:', parsed)
                    
                    // 기본값과 다른지 확인
                    const { getPresetAnswersSync } = await import('../../lib/presetAnswersStorage')
                    const defaultData = getPresetAnswersSync()
                    const isDifferent = JSON.stringify(parsed) !== JSON.stringify(defaultData)
                    
                    if (isDifferent) {
                      setData(parsed)
                      alert('로컬스토리지에서 데이터를 복구했습니다!')
                      return
                    }
                  }
                } catch (e) {
                  console.error('로컬스토리지 복구 오류:', e)
                }
                
                // 2. 파일에서 복구 시도
                try {
                  const fileData = await getPresetAnswers()
                  if (fileData) {
                    setData(fileData)
                    alert('파일에서 데이터를 복구했습니다!')
                  } else {
                    alert('복구할 데이터가 없습니다.\n\n브라우저 콘솔(F12)을 열고 다음 명령어를 실행해보세요:\nlocalStorage.getItem("preset-answers-data")')
                  }
                } catch (e) {
                  alert('복구 중 오류가 발생했습니다.\n\n브라우저 콘솔(F12)을 열고 다음 명령어를 실행해보세요:\nlocalStorage.getItem("preset-answers-data")')
                }
              }}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium"
            >
              데이터 복구
            </button>
            <button
              onClick={() => {
                downloadPresetAnswersAsFile(data)
                alert('프리셋 답변 파일이 다운로드되었습니다.\n이 파일을 public/preset-answers.json에 저장하면 배포 시 반영됩니다.')
              }}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium"
            >
              파일로 내보내기
            </button>
          </div>
        </div>

        {/* 카테고리 선택 */}
        <div className="mb-6 bg-white rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-gray-700">카테고리 선택 및 편집</p>
            <button
              onClick={() => setIsAddingCategory(true)}
              className="flex items-center gap-1 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-medium"
            >
              <Plus className="w-3 h-3" />
              카테고리 추가
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => {
              const isEditing = editingCategory === cat.id
              const rawLabel = categoryLabels[cat.id as NonNullable<Category>] || cat.label
              const displayLabel = removeEmojiFromLabel(rawLabel) || rawLabel
              const isDefault = ['support', 'campus', 'appointment'].includes(cat.id)
              
              return (
                <div key={cat.id} className="flex items-center gap-2">
                  {isEditing ? (
                    <input
                      type="text"
                      defaultValue={displayLabel}
                      onBlur={(e) => {
                        const cleanedValue = removeEmojiFromLabel(e.target.value.trim())
                        if (cleanedValue) {
                          updateCategory(cat.id, { label: cleanedValue })
                          setCategoryLabels((prev) => ({
                            ...prev,
                            [cat.id]: cleanedValue,
                          }))
                          setCategories(loadCategories())
                        }
                        setEditingCategory(null)
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.currentTarget.blur()
                        }
                        if (e.key === 'Escape') {
                          setEditingCategory(null)
                        }
                      }}
                      className="px-4 py-2 border border-blue-500 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                      autoFocus
                    />
                  ) : (
                    <>
                      <button
                        onClick={() => {
                          setSelectedCategory(cat.id as NonNullable<Category>)
                          setEditingId(null)
                          setExpandedPaths(new Set())
                        }}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                          selectedCategory === cat.id
                            ? 'bg-blue-600 text-white shadow-md'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        <span>{cat.emoji}</span>
                        {displayLabel}
                      </button>
                      <button
                        onClick={() => setEditingCategory(cat.id)}
                        className="p-2 hover:bg-gray-100 rounded-lg"
                        title="카테고리 이름 편집"
                      >
                        <Edit2 className="w-4 h-4 text-gray-600" />
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(cat.id)}
                        className="p-2 hover:bg-red-100 rounded-lg"
                        title="카테고리 삭제"
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </button>
                    </>
                  )}
                </div>
              )
            })}
          </div>
          
          {/* 카테고리 추가 폼 */}
          {isAddingCategory && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center gap-2 mb-3">
                <input
                  type="text"
                  placeholder="이모지 (예: 📁)"
                  value={newCategoryEmoji}
                  onChange={(e) => setNewCategoryEmoji(e.target.value)}
                  className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                  maxLength={2}
                />
                <input
                  type="text"
                  placeholder="카테고리 이름"
                  value={newCategoryLabel}
                  onChange={(e) => setNewCategoryLabel(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleAddCategory()
                    }
                    if (e.key === 'Escape') {
                      setIsAddingCategory(false)
                      setNewCategoryLabel('')
                      setNewCategoryEmoji('📁')
                    }
                  }}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                />
                <button
                  onClick={handleAddCategory}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium"
                >
                  추가
                </button>
                <button
                  onClick={() => {
                    setIsAddingCategory(false)
                    setNewCategoryLabel('')
                    setNewCategoryEmoji('📁')
                  }}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-sm font-medium"
                >
                  취소
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 옵션 트리 */}
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">
              {(() => {
                const rawLabel = categoryLabels[selectedCategory] || categories.find(c => c.id === selectedCategory)?.label || '옵션 설정'
                return removeEmojiFromLabel(rawLabel) || rawLabel
              })()} 옵션 설정
            </h2>
            <button
              onClick={() => addOption()}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium"
            >
              <Plus className="w-4 h-4" />
              최상위 옵션 추가
            </button>
          </div>

          <div className="space-y-2">
            {data[selectedCategory]?.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <p>옵션이 없습니다. "최상위 옵션 추가" 버튼을 클릭하여 추가하세요.</p>
              </div>
            ) : (
              data[selectedCategory]?.map((option, index) => {
                const pathKey = option.id
                const isExpanded = expandedPaths.has(pathKey)
                const isEditing = editingId === option.id || editingId !== null
                const canDrag = !isEditing && !isExpanded
                
                return (
                  <div
                    key={option.id}
                    draggable={canDrag}
                    onDragStart={(e) => {
                      if (!canDrag) {
                        e.preventDefault()
                        return false
                      }
                      handleDragStart(index, option)
                    }}
                    onDragOver={(e) => {
                      if (canDrag) {
                        handleDragOver(e, index)
                      } else {
                        e.preventDefault()
                      }
                    }}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => {
                      if (canDrag) {
                        handleDrop(e, index)
                      } else {
                        e.preventDefault()
                      }
                    }}
                    onDragEnd={handleDragEnd}
                    className={`transition-all ${
                      draggedIndex === index ? 'opacity-50' : ''
                    } ${
                      dragOverIndex === index && draggedIndex !== index
                        ? 'transform translate-y-1 border-t-2 border-t-blue-400'
                        : ''
                    } ${!canDrag ? 'cursor-default' : ''}`}
                  >
                    {renderOption(option, [option.id], 0)}
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* 안내 */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-800 mb-2">사용 방법</h3>
          <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
            <li>각 카테고리별로 최상위 옵션(A, B, C 등)을 추가할 수 있습니다.</li>
            <li>최상위 옵션에 하위 옵션(가, 나, 다 등)을 추가할 수 있습니다.</li>
            <li>하위 옵션에 답변 내용을 입력하면 사용자가 선택 시 해당 답변이 표시됩니다.</li>
            <li>편집 버튼을 클릭하여 옵션 이름과 답변을 수정할 수 있습니다.</li>
            <li>변경사항은 자동으로 저장됩니다.</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

