// 챗봇 메시지 타입
export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  buttons?: MessageButton[] // 버튼이 있는 경우
}

// 메시지 버튼 타입
export interface MessageButton {
  id: string
  label: string
  action: 'contact' | 'retry' | 'category'
}

// 문서 타입
export interface Document {
  name: string
  type: 'pdf' | 'md'
  content: string
  path: string
  category?: Category // 카테고리 정보
}

// 카테고리 타입
export type Category = 'support' | 'campus' | 'appointment' | null

// 카테고리 정보
export interface CategoryInfo {
  id: Category
  label: string
  emoji: string
  description: string
}

// 채팅 상태
export interface ChatState {
  isOpen: boolean
  messages: Message[]
  isLoading: boolean
  selectedCategory: Category
}



