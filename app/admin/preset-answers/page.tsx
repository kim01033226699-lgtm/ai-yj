'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Plus, Trash2, Edit2, Save, X } from 'lucide-react'
import { getPresetAnswers, savePresetAnswers, resetPresetAnswers } from '../../lib/presetAnswersStorage'
import { CATEGORIES } from '../../lib/categories'
import type { Category } from '../../lib/types'
import type { PresetOption } from '../../lib/presetAnswers'

export default function PresetAnswersAdminPage() {
  const router = useRouter()
  const [selectedCategory, setSelectedCategory] = useState<NonNullable<Category>>('support')
  const [data, setData] = useState<Record<NonNullable<Category>, PresetOption[]>>(
    getPresetAnswers()
  )
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingCategory, setEditingCategory] = useState<NonNullable<Category> | null>(null)
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set())
  const [categoryLabels, setCategoryLabels] = useState<Record<NonNullable<Category>, string>>({
    support: CATEGORIES.support.label,
    campus: CATEGORIES.campus.label,
    appointment: CATEGORIES.appointment.label,
  })

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

  // 데이터 변경 시 저장
  useEffect(() => {
    savePresetAnswers(data)
  }, [data])

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

  // 옵션 업데이트
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

  // 트리 렌더링
  const renderOption = (option: PresetOption, path: string[], level: number = 0) => {
    const pathKey = path.join('/')
    const isExpanded = expandedPaths.has(pathKey)
    const isEditing = editingId === option.id
    const hasChildren = option.children && option.children.length > 0
    const hasAnswer = !!option.answer

    return (
      <div key={option.id} className="mb-2">
        <div
          className={`flex items-center gap-2 p-2 rounded-lg ${
            level === 0
              ? 'bg-blue-50 border border-blue-200'
              : level === 1
              ? 'bg-green-50 border border-green-200'
              : 'bg-gray-50 border border-gray-200'
          }`}
          style={{ marginLeft: `${level * 20}px` }}
        >
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
          <button
            onClick={() => {
              if (confirm('모든 설정을 기본값으로 초기화하시겠습니까?')) {
                resetPresetAnswers()
                setData(getPresetAnswers())
              }
            }}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-sm font-medium"
          >
            기본값으로 초기화
          </button>
        </div>

        {/* 카테고리 선택 */}
        <div className="mb-6 bg-white rounded-lg p-4 shadow-sm">
          <p className="text-sm font-medium text-gray-700 mb-3">카테고리 선택 및 편집</p>
          <div className="flex gap-2">
            {(['support', 'campus', 'appointment'] as NonNullable<Category>[]).map((cat) => {
              const isEditing = editingCategory === cat
              const displayLabel = categoryLabels[cat] || CATEGORIES[cat].label
              
              return (
                <div key={cat} className="flex items-center gap-2">
                  {isEditing ? (
                    <input
                      type="text"
                      defaultValue={displayLabel}
                      onBlur={(e) => {
                        if (e.target.value.trim()) {
                          setCategoryLabels((prev) => ({
                            ...prev,
                            [cat]: e.target.value.trim(),
                          }))
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
                          setSelectedCategory(cat)
                          setEditingId(null)
                          setExpandedPaths(new Set())
                        }}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                          selectedCategory === cat
                            ? 'bg-blue-600 text-white shadow-md'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {displayLabel}
                      </button>
                      <button
                        onClick={() => setEditingCategory(cat)}
                        className="p-2 hover:bg-gray-100 rounded-lg"
                        title="카테고리 이름 편집"
                      >
                        <Edit2 className="w-4 h-4 text-gray-600" />
                      </button>
                    </>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* 옵션 트리 */}
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">
              {CATEGORIES[selectedCategory].label} 옵션 설정
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
              data[selectedCategory]?.map((option) =>
                renderOption(option, [option.id], 0)
              )
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

