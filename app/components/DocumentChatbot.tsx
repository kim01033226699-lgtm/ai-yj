'use client'

import { useState, useEffect } from 'react'
import { FloatingChatButton } from './FloatingChatButton'
import { ChatWindow } from './ChatWindow'
import { loadDocuments, mergeDocuments } from '../lib/documentLoader'
import { askQuestion } from '../lib/gemini'
import { filterDocumentsByCategory, CONTACT_INFO, CATEGORIES, extractContactFromDocument } from '../lib/categories'
import type { Message, Document, Category, CategoryInfo } from '../lib/types'
import type { ContactInfo } from '../lib/categories'

interface DocumentChatbotProps {
  documentPaths: { path: string; name: string }[]
}

export function DocumentChatbot({ documentPaths }: DocumentChatbotProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [documents, setDocuments] = useState<Document[]>([])
  const [allDocuments, setAllDocuments] = useState<Document[]>([])
  const [documentContext, setDocumentContext] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<Category>(null)
  const [waitingForContactConfirmation, setWaitingForContactConfirmation] = useState(false)

  // 문서 로드
  useEffect(() => {
    async function load() {
      try {
        const docs = await loadDocuments(documentPaths)
        setAllDocuments(docs)
        // 초기에는 전체 문서 로드
        updateDocumentContext(docs, null)
      } catch (err) {
        console.error('문서 로드 오류:', err)
        setError('문서를 불러오는 중 오류가 발생했습니다.')
      }
    }

    load()
  }, [documentPaths])

  // 카테고리 변경 시 문서 컨텍스트 업데이트
  const updateDocumentContext = (docs: Document[], category: Category) => {
    if (!category) {
      const context = mergeDocuments(docs)
      setDocumentContext(context)
      setDocuments(docs)
      return
    }

    // 카테고리별 문서 필터링
    const filteredPaths = filterDocumentsByCategory(
      documentPaths,
      category
    )
    const filteredDocs = docs.filter((doc) =>
      filteredPaths.some((path) => path.path === doc.path)
    )

    // 필터링된 문서 + 전체 문서(FAQ, 용어집 등) 병합
    const categoryDocs = [...filteredDocs]
    const commonDocs = docs.filter(
      (doc) =>
        doc.path === '/documents/faq.md' ||
        doc.path === '/documents/ga_domain.md'
    )
    const mergedDocs = [...categoryDocs, ...commonDocs]

    const context = mergeDocuments(mergedDocs)
    setDocumentContext(context)
    setDocuments(mergedDocs)
  }

  // 카테고리 선택 핸들러
  const handleCategorySelect = (category: Category) => {
    setSelectedCategory(category)
    updateDocumentContext(allDocuments, category)
    setWaitingForContactConfirmation(false)

    // 카테고리 선택 안내 메시지
    const categoryInfo = category ? CATEGORIES[category] : (CATEGORIES as Record<string, CategoryInfo>)[null]
    const welcomeMessage: Message = {
      id: Date.now().toString(),
      role: 'assistant',
      content: `${categoryInfo.label}에 대해 문의 주시면 안내해 드리겠습니다.`,
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, welcomeMessage])
  }

  // 담당자 연락처 안내
  const handleShowContact = () => {
    const category = selectedCategory || null
    
    // 문서에서 연락처 정보 추출 시도
    let contact = category ? CONTACT_INFO[category] : (CONTACT_INFO as Record<string, ContactInfo | null>)[null]
    
    // contact-info.md 문서가 있으면 해당 문서에서 추출
    const contactDoc = allDocuments.find((doc) => doc.path === '/documents/contact-info.md')
    if (contactDoc) {
      const extractedContact = extractContactFromDocument(contactDoc.content, category)
      if (extractedContact) {
        contact = extractedContact
      }
    }
    
    if (!contact) return

    const contactMessage: Message = {
      id: Date.now().toString(),
      role: 'assistant',
      content: `📞 담당자 연락처\n\n${contact.name}\n${contact.phone}${contact.email ? `\n이메일: ${contact.email}` : ''}\n\n업무 시간: 평일 09:00 ~ 18:00\n긴급 문의: 김남헌 팀장 (02-6410-5000 내선 7385)`,
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, contactMessage])
    setWaitingForContactConfirmation(false)
  }

  // 메시지 전송
  const handleSendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return

    // 카테고리 미선택 시 안내
    if (!selectedCategory) {
      const categoryPrompt: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: '먼저 카테고리를 선택해주세요. 지원금, 금융캠퍼스, 위촉 중에서 선택하시면 해당 카테고리 문서를 우선 참고하여 답변해드립니다.',
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, categoryPrompt])
      return
    }

    // API 키 확인
    if (!process.env.NEXT_PUBLIC_GEMINI_API_KEY) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: 'user',
          content,
          timestamp: new Date(),
        },
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: '⚠️ Gemini API 키가 설정되지 않았습니다. .env.local 파일을 확인해주세요.',
          timestamp: new Date(),
        },
      ])
      return
    }

    // 문서 로드 확인
    if (!documentContext) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: 'user',
          content,
          timestamp: new Date(),
        },
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: '⚠️ 문서를 아직 로드하지 못했습니다. 잠시 후 다시 시도해주세요.',
          timestamp: new Date(),
        },
      ])
      return
    }

    // 사용자 메시지 추가
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setIsLoading(true)
    setWaitingForContactConfirmation(false)

    try {
      // AI 답변 생성
      const categoryLabel = CATEGORIES[selectedCategory].label
      const result = await askQuestion(content, documentContext, categoryLabel)

      // 답변이 없는 경우 담당자 연락처 안내
      if (!result.hasAnswer) {
        const noAnswerMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: '해당 질문에 대한 답변은 담당자에게 직접 확인하시기 바랍니다. 담당자 연락처를 알려드릴까요?',
          timestamp: new Date(),
          buttons: [
            { id: 'contact-yes', label: '네, 알려주세요', action: 'contact' },
            { id: 'contact-no', label: '아니요', action: 'retry' },
          ],
        }
        setMessages((prev) => [...prev, noAnswerMessage])
        setWaitingForContactConfirmation(true)
      } else {
        // AI 메시지 추가
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: result.answer,
          timestamp: new Date(),
        }
        setMessages((prev) => [...prev, assistantMessage])
      }
    } catch (err) {
      console.error('AI 답변 오류:', err)

      // 오류 메시지 추가
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '죄송합니다. 답변 생성 중 오류가 발생했습니다. 다시 시도해주세요.',
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  // 버튼 클릭 핸들러
  const handleButtonClick = (buttonId: string, action: string) => {
    if (action === 'contact') {
      handleShowContact()
    } else if (action === 'retry') {
      const retryMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: '다른 질문을 해주시면 도와드리겠습니다.',
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, retryMessage])
      setWaitingForContactConfirmation(false)
    }
  }

  return (
    <>
      <FloatingChatButton isOpen={isOpen} onClick={() => setIsOpen(!isOpen)} />
      {isOpen && (
        <ChatWindow
          messages={messages}
          isLoading={isLoading}
          onSendMessage={handleSendMessage}
          selectedCategory={selectedCategory}
          onSelectCategory={handleCategorySelect}
          onButtonClick={handleButtonClick}
        />
      )}
    </>
  )
}

