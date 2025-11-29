'use client'

import { useEffect, useRef, useState } from 'react'
import { Send, Loader2, ChevronRight, ChevronDown } from 'lucide-react'
import { CategorySelector } from './CategorySelector'
import { PresetAnswerSelector } from './PresetAnswerSelector'
import type { Message } from '../lib/types'
import type { Category } from '../lib/types'
import type { SelectionPath } from '../lib/presetAnswers'

interface ChatWindowProps {
  messages: Message[]
  isLoading: boolean
  onSendMessage: (message: string) => void
  selectedCategory: Category
  onSelectCategory: (category: Category) => void
  onButtonClick: (buttonId: string, action: string) => void
  presetSelectionPath: SelectionPath
  onPresetOptionSelect: (optionId: string) => void
  onPresetBack: () => void
  onPresetAnswer: (answer: string) => void
  isOpen: boolean
  onClose: () => void
  isPresetListOpen: boolean
  onTogglePresetList: () => void
}

function ChatWindowComponent({
  messages,
  isLoading,
  onSendMessage,
  selectedCategory,
  onSelectCategory,
  onButtonClick,
  presetSelectionPath,
  onPresetOptionSelect,
  onPresetBack,
  onPresetAnswer,
  isOpen,
  onClose,
  isPresetListOpen,
  onTogglePresetList,
}: ChatWindowProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [inputValue, setInputValue] = useState('')

  // 새 메시지 추가 시 스크롤
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!inputValue.trim() || isLoading) return

    onSendMessage(inputValue.trim())
    setInputValue('')
  }

  return (
    <div
      className={`fixed top-[10vh] left-1/2 md:top-auto md:left-auto md:right-6 md:bottom-24 z-40 w-[calc(100%-2rem)] max-w-sm md:w-96 h-[80vh] max-h-[80vh] md:h-[600px] md:max-h-[600px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-200 transition-all duration-300 ease-in-out ${
        isOpen
          ? '-translate-x-1/2 md:translate-x-0 md:translate-y-0 opacity-100 pointer-events-auto'
          : 'translate-x-[150%] md:translate-x-[calc(100%+1.5rem)] md:translate-y-0 opacity-0 pointer-events-none'
      }`}
    >
      {/* 헤더 */}
      <div className="bg-blue-600 text-white p-4 flex items-center gap-3">
        <div className="flex-1">
          <h3 className="font-semibold">ai영업지원</h3>
          <p className="text-xs text-blue-100">AI챗봇이 안내드립니다.</p>
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 flex items-center justify-center hover:bg-white/20 rounded-full transition-colors"
          aria-label="채팅 닫기"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>

      {/* 카테고리 선택 */}
      <CategorySelector
        selectedCategory={selectedCategory}
        onSelectCategory={onSelectCategory}
        disabled={isLoading}
      />

      {/* 프리셋 답변 선택 (카테고리가 선택된 경우에만 표시) - 전체 높이 */}
      <div className={`transition-all duration-300 ease-in-out overflow-hidden ${
        selectedCategory && isPresetListOpen ? 'flex-1' : 'max-h-0'
      }`}>
        {selectedCategory && (
          <PresetAnswerSelector
            category={selectedCategory}
            selectionPath={presetSelectionPath}
            onSelect={onPresetOptionSelect}
            onBack={onPresetBack}
            onAnswer={onPresetAnswer}
            onClose={onTogglePresetList}
          />
        )}
      </div>

      {/* 메시지 목록 - 목록이 열려있을 때는 숨김 */}
      <div className={`overflow-y-auto p-4 space-y-4 bg-gray-50 transition-all duration-300 ease-in-out ${
        selectedCategory && isPresetListOpen ? 'hidden' : 'flex-1'
      }`}>
        {messages.length > 0 && (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${
                msg.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`rounded-2xl px-4 py-2 ${
                  msg.role === 'user'
                    ? 'max-w-[80%] bg-blue-600 text-white'
                    : 'max-w-[95%] bg-blue-100 text-gray-800 border border-blue-200'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                
                {/* 버튼이 있는 경우 */}
                {msg.buttons && msg.buttons.length > 0 && (
                  <div className="flex gap-2 mt-3">
                    {msg.buttons.map((button) => (
                      <button
                        key={button.id}
                        onClick={() => onButtonClick(button.id, button.action)}
                        className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-colors ${
                          button.action === 'contact'
                            ? 'bg-blue-600 text-white hover:bg-blue-700'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {button.label}
                      </button>
                    ))}
                  </div>
                )}

                <p
                  className={`text-xs mt-1 ${
                    msg.role === 'user' ? 'text-blue-100' : 'text-gray-400'
                  }`}
                >
                  {msg.timestamp.toLocaleTimeString('ko-KR', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </div>
          ))
        )}

        {/* 로딩 인디케이터 */}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white rounded-2xl px-4 py-3 border border-gray-200">
              <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 입력창 - 목록이 열려있을 때는 숨김 */}
      {!isPresetListOpen && (
        <form onSubmit={handleSubmit} className="p-4 bg-white border-t">
          <div className="flex gap-2 items-center">
            {/* 목록 토글 버튼 */}
            {selectedCategory && (
              <button
                type="button"
                onClick={onTogglePresetList}
                className="w-10 h-10 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full flex items-center justify-center transition-colors flex-shrink-0"
                aria-label={isPresetListOpen ? "목록 닫기" : "목록 열기"}
              >
                <ChevronDown className={`w-5 h-5 transition-transform duration-300 ${isPresetListOpen ? 'rotate-180' : ''}`} />
              </button>
            )}
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={selectedCategory ? "질문을 입력하세요..." : "카테고리를 먼저 선택해주세요"}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm disabled:bg-gray-100"
              disabled={isLoading || !selectedCategory}
            />
            <button
              type="submit"
              disabled={isLoading || !selectedCategory || !inputValue.trim()}
              className="w-10 h-10 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white rounded-full flex items-center justify-center transition-colors flex-shrink-0"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </form>
      )}
    </div>
  )
}

export const ChatWindow = ChatWindowComponent

