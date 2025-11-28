'use client'

import { useEffect, useRef } from 'react'
import { Send, Loader2 } from 'lucide-react'
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
}: ChatWindowProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // 새 메시지 추가 시 스크롤
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const input = inputRef.current
    if (!input || !input.value.trim() || isLoading) return

    onSendMessage(input.value.trim())
    input.value = ''
  }

  return (
    <div 
      className={`fixed top-1/2 left-1/2 md:top-auto md:left-auto md:right-6 md:bottom-24 z-40 w-[calc(100%-2rem)] max-w-sm md:w-96 h-[calc(100vh-4rem)] max-h-[600px] md:h-[600px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-200 transition-all duration-300 ease-in-out ${
        isOpen 
          ? '-translate-x-1/2 -translate-y-1/2 md:translate-x-0 md:translate-y-0 opacity-100 pointer-events-auto' 
          : 'translate-x-[150%] -translate-y-1/2 md:translate-x-[calc(100%+1.5rem)] md:translate-y-0 opacity-0 pointer-events-none'
      }`}
    >
      {/* 헤더 */}
      <div className="bg-blue-600 text-white p-4 flex items-center gap-3">
        <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
          <span className="text-1xl">YJ</span>
        </div>
        <div>
          <h3 className="font-semibold">영지챗봇</h3>
          <p className="text-xs text-blue-100">AI챗봇답변</p>
        </div>
      </div>

      {/* 카테고리 선택 */}
      <CategorySelector
        selectedCategory={selectedCategory}
        onSelectCategory={onSelectCategory}
        disabled={isLoading}
      />

      {/* 프리셋 답변 선택 (카테고리가 선택된 경우에만 표시) */}
      {selectedCategory && (
        <PresetAnswerSelector
          category={selectedCategory}
          selectionPath={presetSelectionPath}
          onSelect={onPresetOptionSelect}
          onBack={onPresetBack}
          onAnswer={onPresetAnswer}
        />
      )}

      {/* 메시지 목록 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.length > 0 && (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${
                msg.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                  msg.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-800 border border-gray-200'
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

      {/* 입력창 */}
      <form onSubmit={handleSubmit} className="p-4 bg-white border-t">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            placeholder={selectedCategory ? "질문을 입력하세요..." : "카테고리를 먼저 선택해주세요"}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm disabled:bg-gray-100"
            disabled={isLoading || !selectedCategory}
          />
          <button
            type="submit"
            disabled={isLoading || !selectedCategory}
            className="w-10 h-10 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white rounded-full flex items-center justify-center transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  )
}

export const ChatWindow = ChatWindowComponent

