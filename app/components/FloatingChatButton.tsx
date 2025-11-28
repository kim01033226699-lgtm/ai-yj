'use client'

import { MessageCircle, X } from 'lucide-react'

interface FloatingChatButtonProps {
  isOpen: boolean
  onClick: () => void
  unreadCount?: number
}

export function FloatingChatButton({
  isOpen,
  onClick,
  unreadCount = 0,
}: FloatingChatButtonProps) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 left-1/2 -translate-x-1/2 md:left-auto md:translate-x-0 md:right-6 z-50 flex items-center justify-center w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg transition-all duration-200 hover:scale-110"
      aria-label={isOpen ? '채팅 닫기' : '채팅 열기'}
    >
      {isOpen ? (
        <X className="w-6 h-6" />
      ) : (
        <>
          <MessageCircle className="w-6 h-6" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </>
      )}
    </button>
  )
}


