'use client'

import { useState, useEffect, useRef } from 'react'
import { Upload, FileText, X, Trash2, Download, AlertCircle } from 'lucide-react'
import type { Document } from '../lib/types'
import {
  saveDocuments,
  getAllDocuments,
  deleteDocument,
  clearAllDocuments,
  getDocumentCount,
} from '../lib/documentStorage'
import * as pdfjsLib from 'pdfjs-dist'

// PDF.js Worker 설정
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`
}

export function AdminDocumentManager() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // 문서 목록 로드
  useEffect(() => {
    loadDocuments()
  }, [])

  const loadDocuments = async () => {
    try {
      const docs = await getAllDocuments()
      setDocuments(docs)
    } catch (error) {
      console.error('문서 로드 오류:', error)
      showMessage('error', '문서를 불러오는데 실패했습니다.')
    }
  }

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text })
    setTimeout(() => setMessage(null), 5000)
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setIsLoading(true)
    const newDocuments: Document[] = []
    let errorCount = 0

    for (const file of Array.from(files)) {
      try {
        const document = await processFile(file)
        newDocuments.push(document)
      } catch (error) {
        console.error(`파일 처리 오류 (${file.name}):`, error)
        errorCount++
      }
    }

    if (newDocuments.length > 0) {
      try {
        await saveDocuments(newDocuments)
        await loadDocuments()
        showMessage('success', `${newDocuments.length}개의 문서가 추가되었습니다.`)
      } catch (error) {
        console.error('문서 저장 오류:', error)
        showMessage('error', '문서 저장에 실패했습니다.')
      }
    }

    if (errorCount > 0) {
      showMessage('error', `${errorCount}개의 파일 처리에 실패했습니다.`)
    }

    setIsLoading(false)

    // 입력 초기화
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const processFile = async (file: File): Promise<Document> => {
    const fileName = file.name
    const extension = fileName.split('.').pop()?.toLowerCase()

    let content = ''
    let type: 'pdf' | 'md' = 'md'

    if (extension === 'pdf') {
      type = 'pdf'
      content = await extractPDFText(file)
    } else if (extension === 'md' || extension === 'txt') {
      type = 'md'
      content = await extractTextContent(file)
    } else {
      throw new Error(`지원하지 않는 파일 형식입니다: ${extension}`)
    }

    return {
      name: fileName,
      type,
      content,
      path: `admin:${fileName}:${Date.now()}`,
    }
  }

  const extractTextContent = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const text = e.target?.result as string
        resolve(text)
      }
      reader.onerror = () => reject(new Error('파일을 읽을 수 없습니다.'))
      reader.readAsText(file, 'UTF-8')
    })
  }

  const extractPDFText = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = async (e) => {
        try {
          const arrayBuffer = e.target?.result as ArrayBuffer
          const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
          let fullText = ''

          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i)
            const textContent = await page.getTextContent()
            const pageText = textContent.items
              .map((item: any) => item.str)
              .join(' ')
            fullText += pageText + '\n\n'
          }

          resolve(fullText.trim())
        } catch (error) {
          reject(new Error('PDF 파일을 읽을 수 없습니다.'))
        }
      }
      reader.onerror = () => reject(new Error('파일을 읽을 수 없습니다.'))
      reader.readAsArrayBuffer(file)
    })
  }

  const handleDeleteDocument = async (path: string) => {
    if (!confirm('이 문서를 삭제하시겠습니까?')) return

    try {
      await deleteDocument(path)
      await loadDocuments()
      showMessage('success', '문서가 삭제되었습니다.')
    } catch (error) {
      console.error('문서 삭제 오류:', error)
      showMessage('error', '문서 삭제에 실패했습니다.')
    }
  }

  const handleClearAll = async () => {
    if (!confirm('모든 문서를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) return

    try {
      await clearAllDocuments()
      await loadDocuments()
      showMessage('success', '모든 문서가 삭제되었습니다.')
    } catch (error) {
      console.error('문서 삭제 오류:', error)
      showMessage('error', '문서 삭제에 실패했습니다.')
    }
  }

  const handleExportDocument = (doc: Document) => {
    const blob = new Blob([doc.content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${doc.name.replace(/\.[^/.]+$/, '')}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* 헤더 */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">문서 관리</h1>
        <p className="text-gray-600">
          채팅봇에서 사용할 문서를 업로드하고 관리합니다. (PDF, MD, TXT 형식 지원)
        </p>
      </div>

      {/* 메시지 */}
      {message && (
        <div
          className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
            message.type === 'success'
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          <AlertCircle size={20} />
          <span>{message.text}</span>
        </div>
      )}

      {/* 업로드 섹션 */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">문서 업로드</h2>
        <div className="flex items-center gap-4">
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Upload size={20} />
            {isLoading ? '업로드 중...' : '파일 선택'}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.md,.txt"
            multiple
            onChange={handleFileChange}
            disabled={isLoading}
            className="hidden"
          />
          <span className="text-sm text-gray-600">
            PDF, Markdown, 텍스트 파일을 선택하세요 (여러 파일 가능)
          </span>
        </div>
      </div>

      {/* 문서 목록 */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            업로드된 문서 ({documents.length}개)
          </h2>
          {documents.length > 0 && (
            <button
              onClick={handleClearAll}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 text-sm"
            >
              <Trash2 size={16} />
              전체 삭제
            </button>
          )}
        </div>

        {documents.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <FileText size={48} className="mx-auto mb-4 opacity-50" />
            <p>업로드된 문서가 없습니다.</p>
            <p className="text-sm mt-2">위의 '파일 선택' 버튼을 클릭하여 문서를 추가하세요.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {documents.map((doc) => (
              <div
                key={doc.path}
                className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-3 border border-gray-200 hover:border-gray-300 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <FileText size={20} className="text-blue-600 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{doc.name}</p>
                    <p className="text-sm text-gray-500">
                      {doc.type.toUpperCase()} • {doc.content.length.toLocaleString()} 자
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleExportDocument(doc)}
                    className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="텍스트로 다운로드"
                  >
                    <Download size={18} />
                  </button>
                  <button
                    onClick={() => handleDeleteDocument(doc.path)}
                    className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="삭제"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 안내 사항 */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2">💡 사용 안내</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• 업로드된 문서는 브라우저의 IndexedDB에 저장됩니다.</li>
          <li>• 일반 사용자가 채팅봇을 사용할 때 이 문서들이 자동으로 참조됩니다.</li>
          <li>• PDF 파일은 텍스트 추출 후 저장되므로, 이미지만 있는 PDF는 인식되지 않습니다.</li>
          <li>• 문서 크기가 너무 크면 AI 응답 시간이 길어질 수 있습니다.</li>
        </ul>
      </div>
    </div>
  )
}
