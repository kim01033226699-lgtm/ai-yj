'use client'

import { useRef } from 'react'
import { Upload, FileText, X } from 'lucide-react'
import type { Document } from '../lib/types'

interface DocumentUploaderProps {
  onDocumentsUploaded: (documents: Document[]) => void
  uploadedDocuments: Document[]
  onRemoveDocument: (path: string) => void
}

export function DocumentUploader({
  onDocumentsUploaded,
  uploadedDocuments,
  onRemoveDocument,
}: DocumentUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    const documents: Document[] = []

    for (const file of Array.from(files)) {
      try {
        const document = await processFile(file)
        documents.push(document)
      } catch (error) {
        console.error(`파일 처리 오류 (${file.name}):`, error)
        alert(`${file.name} 파일을 처리할 수 없습니다.`)
      }
    }

    if (documents.length > 0) {
      onDocumentsUploaded(documents)
    }

    // 입력 초기화 (같은 파일 재업로드 가능하도록)
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
      path: `uploaded:${fileName}:${Date.now()}`, // 고유 경로 생성
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
    const pdfjsLib = await import('pdfjs-dist')

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

  return (
    <div className="border-b border-gray-200 p-4">
      <div className="mb-3">
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
        >
          <Upload size={16} />
          문서 업로드 (PDF, MD, TXT)
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.md,.txt"
          multiple
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {uploadedDocuments.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-gray-600 font-medium">
            업로드된 문서 ({uploadedDocuments.length}개)
          </p>
          <div className="space-y-1">
            {uploadedDocuments.map((doc) => (
              <div
                key={doc.path}
                className="flex items-center justify-between bg-gray-50 rounded px-3 py-2 text-xs"
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <FileText size={14} className="text-gray-500 flex-shrink-0" />
                  <span className="truncate text-gray-700">{doc.name}</span>
                  <span className="text-gray-400">
                    ({doc.content.length.toLocaleString()} 자)
                  </span>
                </div>
                <button
                  onClick={() => onRemoveDocument(doc.path)}
                  className="ml-2 text-gray-400 hover:text-red-500 transition-colors flex-shrink-0"
                  title="삭제"
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
