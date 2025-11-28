'use client'

import { useEffect, useRef } from 'react'
import { ArrowLeft } from 'lucide-react'
import type { Category } from '../lib/types'
import { getFirstLevelOptions, getNextOptions, findAnswerByPath, type SelectionPath } from '../lib/presetAnswers'
import type { PresetOption } from '../lib/presetAnswers'

interface PresetAnswerSelectorProps {
  category: Category
  selectionPath: SelectionPath
  onSelect: (optionId: string) => void
  onBack: () => void
  onAnswer: (answer: string) => void
}

export function PresetAnswerSelector({
  category,
  selectionPath,
  onSelect,
  onBack,
  onAnswer,
}: PresetAnswerSelectorProps) {
  const hasAutoAddedRef = useRef<string>('')

  if (!category) {
    return null
  }

  // 현재 단계의 옵션들 가져오기
  const currentOptions = selectionPath.length === 0
    ? getFirstLevelOptions(category)
    : getNextOptions(category, selectionPath)

  // 답변 확인
  const answer = findAnswerByPath(category, selectionPath)

  // 선택 경로의 모든 제목 가져오기 (경로 표시용)
  const getSelectionPathLabels = (): string[] => {
    if (selectionPath.length === 0) return []
    
    try {
      const options = getFirstLevelOptions(category)
      if (!options) return []

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
    } catch {
      return []
    }
  }

  const pathLabels = getSelectionPathLabels()
  const currentLabel = pathLabels.length > 0 ? pathLabels[pathLabels.length - 1] : null

  // 제목만 있고 내용이 없는 경우는 옵션 클릭 시 바로 처리되므로 여기서는 제거

  // 1. 답변이 있으면 답변 표시
  if (answer) {
    return (
      <div className="p-4 bg-blue-50/30 border-b border-blue-200">
        {selectionPath.length > 0 && (
          <button
            onClick={onBack}
            className="mb-3 p-1 hover:bg-blue-100 rounded transition-colors"
            aria-label="뒤로가기"
          >
            <ArrowLeft className="w-4 h-4 text-blue-600" />
          </button>
        )}
        {/* 선택한 경로 표시 */}
        {pathLabels.length > 0 && (
          <div className="mb-3">
            <p className="text-xs text-gray-600 mb-1">선택한 항목:</p>
            <div className="bg-white/50 rounded-lg px-3 py-2 border border-blue-100/50">
              <p className="text-sm font-medium text-gray-700">
                {pathLabels.join(' > ')}
              </p>
            </div>
          </div>
        )}
        {/* 말풍선 스타일 답변 박스 */}
        <div className="flex justify-start mb-3">
          <div className="relative max-w-[85%]">
            {/* 말풍선 꼬리 */}
            <div className="absolute -left-2 top-4 w-0 h-0 border-t-[8px] border-t-transparent border-r-[8px] border-r-blue-50/50 border-b-[8px] border-b-transparent"></div>
            {/* 말풍선 본체 - 하늘색 배경 흐리게 적용 */}
            <div className="bg-blue-50/50 rounded-2xl px-4 py-3 shadow-md border border-blue-100/50">
              <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">{answer}</p>
            </div>
          </div>
        </div>
        {selectionPath.length > 0 && (
          <button
            onClick={onBack}
            className="w-full px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg text-sm font-medium transition-colors"
          >
            다시 선택
          </button>
        )}
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
        onAnswer(option.label)
        // 선택 경로를 한 단계 뒤로 이동하여 이전 옵션 목록으로 돌아감
        if (selectionPath.length > 0) {
          onBack()
        }
      } else if (hasChildren && option.children) {
        // 하위 옵션이 있는 경우
        // 하위 옵션이 하나만 있고, 그 하위 옵션이 제목만 있는 경우 바로 채팅에 추가
        if (option.children.length === 1) {
          const child = option.children[0]
          const childHasChildren = child.children && child.children.length > 0
          const childHasAnswer = !!child.answer
          
          if (!childHasChildren && !childHasAnswer) {
            // 하위 옵션이 하나만 있고 제목만 있는 경우 바로 채팅에 추가
            onAnswer(child.label)
            // 선택 경로를 변경하지 않아서 옵션 목록이 계속 표시됨
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
      <div className="p-4 bg-blue-50 border-b border-blue-200">
        {selectionPath.length > 0 && (
          <button
            onClick={onBack}
            className="mb-3 p-1 hover:bg-blue-100 rounded transition-colors"
            aria-label="뒤로가기"
          >
            <ArrowLeft className="w-4 h-4 text-blue-600" />
          </button>
        )}
        {/* 선택한 경로 표시 */}
        {pathLabels.length > 0 && (
          <div className="mb-3">
            <p className="text-xs text-gray-600 mb-1">선택한 항목:</p>
            <div className="bg-white rounded-lg px-3 py-2 border border-blue-200">
              <p className="text-sm font-medium text-gray-700">
                {pathLabels.join(' > ')}
              </p>
            </div>
          </div>
        )}
        <p className="text-sm text-gray-700 mb-3">아래 질문에서 선택해 주세요.</p>
        <div className="flex flex-col gap-2">
          {currentOptions.map((option) => {
            const hasChildren = option.children && option.children.length > 0
            const hasAnswer = !!option.answer
            const isTitleOnly = !hasChildren && !hasAnswer
            
            return (
              <button
                key={option.id}
                onClick={() => handleOptionClick(option)}
                className={`px-3 py-2 border rounded-lg text-sm font-medium text-left transition-colors ${
                  isTitleOnly
                    ? 'bg-blue-50 hover:bg-blue-100 border-blue-300 text-blue-700'
                    : 'bg-white hover:bg-blue-100 border-blue-200 text-gray-700'
                }`}
              >
                {option.label}
                {isTitleOnly && (
                  <span className="ml-2 text-xs text-blue-500">(답변)</span>
                )}
              </button>
            )
          })}
        </div>
      </div>
    )
  }

  // 4. 아무것도 없으면 빈 상태 (컴포넌트는 유지)
  return (
    <div className="p-4 bg-blue-50 border-b border-blue-200">
      <p className="text-xs text-gray-600">옵션을 선택해주세요</p>
    </div>
  )
}
