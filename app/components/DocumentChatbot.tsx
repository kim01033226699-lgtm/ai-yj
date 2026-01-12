'use client'

import { useState, useEffect, useCallback } from 'react'
import { FloatingChatButton } from './FloatingChatButton'
import { ChatWindow } from './ChatWindow'
import { loadDocuments, mergeDocuments } from '../lib/documentLoader'
import { askQuestion } from '../lib/gemini'
import { filterDocumentsByCategory, CONTACT_INFO, CATEGORIES, extractContactFromDocument } from '../lib/categories'
import { loadCategoriesAsync } from '../lib/categoryStorage'
import type { Message, Document, Category, CategoryInfo } from '../lib/types'
import type { ContactInfo } from '../lib/categories'
import type { SelectionPath } from '../lib/presetAnswers'

interface DocumentChatbotProps {
  documentPaths: { path: string; name: string }[]
}

export function DocumentChatbot({ documentPaths }: DocumentChatbotProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [documents, setDocuments] = useState<Document[]>([])
  const [allDocuments, setAllDocuments] = useState<Document[]>([])
  const [adminDocuments, setAdminDocuments] = useState<Document[]>([])
  const [documentContext, setDocumentContext] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<Category>(null)
  const [waitingForContactConfirmation, setWaitingForContactConfirmation] = useState(false)
  const [presetSelectionPath, setPresetSelectionPath] = useState<SelectionPath>([])

  // 카테고리 변경 시 문서 컨텍스트 업데이트 (useCallback으로 메모이제이션)
  const updateDocumentContext = useCallback((docs: Document[], category: Category, adminDocs: Document[] = []) => {
    // 관리자가 업로드한 문서를 항상 포함
    const allDocs = [...docs, ...adminDocs]

    if (!category) {
      const context = mergeDocuments(allDocs)
      setDocumentContext(context)
      setDocuments(allDocs)
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

    // 필터링된 문서 + 전체 문서(용어집, Q&A 등) + 관리자 문서 병합
    const categoryDocs = [...filteredDocs]
    const commonDocs = docs.filter(
      (doc) =>
        doc.path === '/documents/ga-domain-terms.md' ||
        doc.path === '/documents/goodrich-rp-qa.md'
    )
    const mergedDocs = [...categoryDocs, ...commonDocs, ...adminDocs]

    const context = mergeDocuments(mergedDocs)
    setDocumentContext(context)
    setDocuments(mergedDocs)
  }, [documentPaths])

  // 문서 로드 및 프리셋 답변 동기화
  useEffect(() => {
    async function load() {
      try {
        // 기본 문서 로드
        const docs = await loadDocuments(documentPaths)
        setAllDocuments(docs)

        // 구글 시트 문서 로드
        const sheetDocs: Document[] = []
        try {
          const basePath = process.env.NODE_ENV === 'production' ? '/ai-yj' : ''
          const response = await fetch(`${basePath}/documents.json`)
          if (response.ok) {
            const data = await response.json()
            if (Array.isArray(data)) {
              sheetDocs.push(...data)
              console.log(`✅ 구글 시트 문서 ${data.length}개 로드됨`)
            }
          }
        } catch (err) {
          console.warn('구글 시트 문서 로드 실패:', err)
        }

        setAdminDocuments(sheetDocs)

        // 초기에는 전체 문서 로드 (기본 + 구글 시트)
        updateDocumentContext(docs, null, sheetDocs)

        // 프리셋 답변 파일에서 로컬스토리지로 동기화
        const { syncPresetAnswersFromFile } = await import('../lib/presetAnswersStorage')
        await syncPresetAnswersFromFile()
      } catch (err) {
        console.error('문서 로드 오류:', err)
        setError('문서를 불러오는 중 오류가 발생했습니다.')
      }
    }

    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [documentPaths])

  // 채팅창이 열릴 때 첫 번째 카테고리 자동 선택
  useEffect(() => {
    if (isOpen && !selectedCategory) {
      loadCategoriesAsync().then((categories) => {
        if (categories && categories.length > 0) {
          const firstCategory = categories[0].id as Category
          setSelectedCategory(firstCategory)
          updateDocumentContext(allDocuments, firstCategory, adminDocuments)
          setIsPresetListOpen(true)
        }
      })
    }
  }, [isOpen, selectedCategory, allDocuments, adminDocuments, updateDocumentContext])

  // 카테고리 선택 핸들러
  const handleCategorySelect = useCallback((category: Category) => {
    setSelectedCategory(category)
    updateDocumentContext(allDocuments, category, adminDocuments)
    setWaitingForContactConfirmation(false)
    setPresetSelectionPath([]) // 카테고리 변경 시 선택 경로 초기화
    setIsPresetListOpen(true) // 카테고리 선택 시 목록 열기
  }, [allDocuments, adminDocuments, updateDocumentContext])

  // 프리셋 답변 옵션 선택 핸들러
  const handlePresetOptionSelect = useCallback((optionId: string) => {
    setPresetSelectionPath((prev) => [...prev, optionId])
  }, [])

  // 프리셋 답변 선택 뒤로가기
  const handlePresetBack = useCallback(() => {
    setPresetSelectionPath((prev) => prev.slice(0, -1))
  }, [])

  // 프리셋 답변을 채팅에 추가
  const handlePresetAnswer = useCallback((answer: string) => {
    const answerMessage: Message = {
      id: Date.now().toString(),
      role: 'assistant',
      content: answer,
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, answerMessage])

    // 제목만 있는 옵션을 클릭한 경우: 선택 경로를 초기화하여 옵션 목록을 숨김
    // 이렇게 하면 채팅창이 보이도록 함
    setPresetSelectionPath([])
  }, [])

  // 담당자 연락처 안내
  const handleShowContact = () => {
    const category = selectedCategory || null
    
    // 문서에서 연락처 정보 추출 시도
    let contact = category ? CONTACT_INFO[category] : (CONTACT_INFO as Record<string, ContactInfo | null>)['null']
    
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

    // 옵션 목록 닫기
    setPresetSelectionPath([])
    setIsPresetListOpen(false)

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
      const categoryInfo = selectedCategory ? CATEGORIES[selectedCategory] : null
      const categoryLabel = categoryInfo?.label || '일반'
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

      // 에러 메시지 결정
      let errorContent = '죄송합니다. 답변 생성 중 오류가 발생했습니다. 다시 시도해주세요.'

      if (err instanceof Error) {
        // 할당량 초과 에러
        if (err.message.includes('할당량') || err.message.includes('quota') || err.message.includes('한도')) {
          errorContent = '⚠️ 일시적으로 요청이 많아 응답이 지연되고 있습니다.\n\n잠시 후(약 1분) 다시 시도해주시거나, 담당자에게 직접 문의해주세요.'
        }
        // 기타 상세 에러 메시지
        else if (err.message.length < 200) {
          errorContent = `죄송합니다. 오류가 발생했습니다.\n\n${err.message}`
        }
      }

      // 오류 메시지 추가
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: errorContent,
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
      <ChatWindow
        messages={messages}
        isLoading={isLoading}
        onSendMessage={handleSendMessage}
        selectedCategory={selectedCategory}
        onSelectCategory={handleCategorySelect}
        onButtonClick={handleButtonClick}
        presetSelectionPath={presetSelectionPath}
        onPresetOptionSelect={handlePresetOptionSelect}
        onPresetBack={handlePresetBack}
        onPresetAnswer={handlePresetAnswer}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </>
  )
}

