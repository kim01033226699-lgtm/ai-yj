'use client'

import { useEffect, useRef, useState } from 'react'
import { ArrowLeft, ChevronDown } from 'lucide-react'
import type { Category } from '../lib/types'
import { getFirstLevelOptions, getNextOptions, findAnswerByPath, type SelectionPath } from '../lib/presetAnswers'
import type { PresetOption } from '../lib/presetAnswers'

interface PresetAnswerSelectorProps {
  category: Category
  selectionPath: SelectionPath
  onSelect: (optionId: string) => void
  onBack: () => void
  onAnswer: (answer: string) => void
  onClose: () => void
}

export function PresetAnswerSelector({
  category,
  selectionPath,
  onSelect,
  onBack,
  onAnswer,
  onClose,
}: PresetAnswerSelectorProps) {
  const hasAutoAddedRef = useRef<string>('')
  const [refreshKey, setRefreshKey] = useState(0)
  const [expandedOptionId, setExpandedOptionId] = useState<string | null>(null)

  // 관리자 페이지에서 데이터가 업데이트되면 자동으로 새로고침
  useEffect(() => {
    const handleUpdate = () => {
      setRefreshKey((prev) => prev + 1)
    }

    window.addEventListener('presetAnswersUpdated', handleUpdate)
    return () => {
      window.removeEventListener('presetAnswersUpdated', handleUpdate)
    }
  }, [])

  // 카테고리 유효성 검사
  if (!category) {
    return null
  }

  // 카테고리가 유효한 ID인지 확인 (긴 텍스트가 전달되는 버그 방지)
  if (typeof category === 'string' && category.length > 50) {
    console.error('[PresetAnswerSelector] 잘못된 category 값:', category)
    return null
  }

  // 현재 단계의 옵션들 가져오기 (refreshKey가 변경되면 다시 로드)
  // refreshKey를 의존성으로 사용하여 관리자 페이지에서 데이터가 업데이트되면 자동으로 새로고침
  useEffect(() => {
    // refreshKey가 변경되면 컴포넌트가 리렌더링되어 최신 데이터를 가져옴
  }, [refreshKey, category, selectionPath])

  const currentOptions = selectionPath.length === 0
    ? getFirstLevelOptions(category)
    : getNextOptions(category, selectionPath)

  // 답변 확인
  const answer = findAnswerByPath(category, selectionPath)

  // 선택 경로의 모든 제목 가져오기 (경로 표시용)
  const getSelectionPathLabels = (): string[] => {
    if (selectionPath.length === 0) return []
    
    // category가 유효한 카테고리 ID인지 확인 (옵션 제목이 아닌지)
    if (!category || typeof category !== 'string' || category.length > 50) {
      console.warn('[getSelectionPathLabels] 잘못된 category 값:', category)
      return []
    }
    
    try {
      const options = getFirstLevelOptions(category)
      if (!options || !Array.isArray(options)) return []

      const labels: string[] = []
      let current: PresetOption[] | PresetOption | undefined = options
      
      for (const id of selectionPath) {
        if (Array.isArray(current)) {
          const option: PresetOption | undefined = current.find((opt) => opt.id === id)
          if (option) {
            labels.push(option.label)
            current = option
          } else {
            return labels
          }
        } else if (current && 'children' in current && current.children) {
          const option: PresetOption | undefined = current.children.find((opt) => opt.id === id)
          if (option) {
            labels.push(option.label)
            current = option
          } else {
            return labels
          }
        } else {
          return labels
        }
      }

      return labels
    } catch (error) {
      console.error('[getSelectionPathLabels] 오류:', error)
      return []
    }
  }

  const pathLabels = getSelectionPathLabels()
  const currentLabel = pathLabels.length > 0 ? pathLabels[pathLabels.length - 1] : null

  // 제목만 있고 내용이 없는 경우는 옵션 클릭 시 바로 처리되므로 여기서는 제거

  // 1. 답변이 있으면 답변 표시
  if (answer) {
    return (
      <div className="h-full flex flex-col p-4 bg-gray-50">
        {/* 뒤로가기 화살표와 선택한 항목 제목 */}
        {pathLabels.length > 0 && selectionPath.length > 0 && (
          <div className="mb-3 flex items-center gap-2 flex-shrink-0">
            <button
              onClick={onBack}
              className="p-1 hover:bg-blue-100 rounded transition-colors flex-shrink-0"
              aria-label="뒤로가기"
            >
              <ArrowLeft className="w-4 h-4 text-blue-600" />
            </button>
            <div className="bg-white/50 rounded-lg px-3 py-2 border border-blue-100/50 flex-1">
              <p className="text-sm font-medium text-gray-700">
                {pathLabels.join(' > ')}
              </p>
            </div>
          </div>
        )}
        {/* 말풍선 스타일 답변 박스 */}
        <div className="flex justify-start overflow-y-auto flex-1">
          <div className="relative max-w-[95%]">
            {/* 말풍선 꼬리 */}
            <div className="absolute -left-2 top-4 w-0 h-0 border-t-[8px] border-t-transparent border-r-[8px] border-r-blue-100 border-b-[8px] border-b-transparent"></div>
            {/* 말풍선 본체 - 하늘색 배경 진하게 적용 */}
            <div className="bg-blue-100 rounded-2xl px-4 py-3 shadow-md border border-blue-200">
              <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">{answer}</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // 2. 제목만 있고 내용이 없으면 옵션 목록으로 돌아가기 (이미 채팅에 추가됨)
  // 제목만 있는 옵션을 클릭하면 바로 채팅에 추가되므로, 여기서는 표시하지 않음
  // 이 조건에 도달하면 선택 경로를 초기화하여 옵션 목록으로 돌아가도록 함
  if (currentLabel && !answer && (!currentOptions || currentOptions.length === 0)) {
    // 제목만 있는 경우는 이미 채팅에 추가되었으므로 옵션 목록으로 돌아가야 함
    // 선택 경로를 한 단계 뒤로 이동하여 이전 옵션 목록으로 돌아감
    // onBack을 호출하여 선택 경로를 초기화
    if (selectionPath.length > 0) {
      // 선택 경로가 있으면 한 단계 뒤로 이동
      onBack()
      return null
    }
    // 선택 경로가 없으면 빈 상태로 표시
    return null
  }

  // 3. 하위 옵션이 있으면 옵션 목록 표시
  if (currentOptions && currentOptions.length > 0) {
    const handleOptionClick = (option: PresetOption) => {
      const hasChildren = option.children && option.children.length > 0
      const hasAnswer = !!option.answer
      
      if (!hasChildren && !hasAnswer) {
        // 제목만 있는 경우 바로 채팅에 답변으로 추가
        // handlePresetAnswer에서 선택 경로를 초기화하여 옵션 목록을 숨김
        onAnswer(option.label)
        return
      } else if (hasChildren && option.children) {
        // 하위 옵션이 있는 경우
        // 하위 옵션이 하나만 있고, 그 하위 옵션이 제목만 있는 경우 바로 채팅에 추가
        if (option.children.length === 1) {
          const child = option.children[0]
          const childHasChildren = child.children && child.children.length > 0
          const childHasAnswer = !!child.answer
          
          if (!childHasChildren && !childHasAnswer) {
            // 하위 옵션이 하나만 있고 제목만 있는 경우 바로 채팅에 추가
            // handlePresetAnswer에서 선택 경로를 초기화하여 옵션 목록을 숨김
            onAnswer(child.label)
            return
          }
        }
        // 하위 옵션이 여러 개이거나, 하위 옵션에 답변이 있는 경우 선택 경로에 추가
        onSelect(option.id)
      } else {
        // 하위 옵션이 없고 답변이 있는 경우 선택 경로에 추가하여 답변 표시
        onSelect(option.id)
      }
    }

    return (
      <div className="h-full flex flex-col p-4 bg-gray-50">
        {/* 헤더: 뒤로가기 버튼 (선택 경로가 있을 때만) */}
        {pathLabels.length > 0 && (
          <div className="mb-3 flex items-center gap-2 flex-shrink-0">
            <button
              onClick={onBack}
              className="p-1 hover:bg-blue-100 rounded transition-colors flex-shrink-0"
              aria-label="뒤로가기"
            >
              <ArrowLeft className="w-4 h-4 text-blue-600" />
            </button>
            <div className="bg-white rounded-lg px-3 py-2 border border-blue-200 flex-1">
              <p className="text-sm font-medium text-gray-700">
                {pathLabels.join(' > ')}
              </p>
            </div>
          </div>
        )}
        <div className="flex flex-col gap-2 overflow-y-auto flex-1 scrollbar-hide">
          {currentOptions.map((option) => {
            const hasChildren = option.children && option.children.length > 0
            const hasAnswer = !!option.answer
            const isTitleOnly = !hasChildren && !hasAnswer
            const isExpanded = expandedOptionId === option.id

            return (
              <div key={option.id} className="border rounded-lg overflow-hidden transition-all">
                <div
                  className={`flex items-center justify-between px-3 py-2 cursor-pointer transition-colors ${
                    isTitleOnly
                      ? 'bg-blue-50 hover:bg-blue-100 border-blue-300 text-blue-700'
                      : 'bg-white hover:bg-blue-100 border-blue-200 text-gray-700'
                  }`}
                  onClick={() => {
                    if (hasAnswer) {
                      // 답변이 있으면 확장/축소 토글
                      setExpandedOptionId(isExpanded ? null : option.id)
                    } else {
                      // 답변이 없으면 기존 동작
                      handleOptionClick(option)
                    }
                  }}
                >
                  <span className="text-sm font-medium flex-1">{option.label}</span>
                  {hasAnswer && (
                    <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                      <ChevronDown className={`w-4 h-4 text-gray-600 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                    </div>
                  )}
                  {isTitleOnly && (
                    <span className="ml-2 text-xs text-blue-500">(답변)</span>
                  )}
                </div>

                {/* 답변 확장 영역 */}
                {hasAnswer && isExpanded && (
                  <div className="px-3 py-3 bg-blue-50 border-t border-blue-200">
                    <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">
                      {option.answer}
                    </p>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  // 4. 아무것도 없으면 빈 상태 (컴포넌트는 유지)
  return null
}
