'use client'

import * as pdfjsLib from 'pdfjs-dist'
import { marked } from 'marked'
import type { Document } from './types'

// PDF.js Worker 설정
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`
}

// PDF 파일을 텍스트로 변환
export async function parsePDF(url: string): Promise<string> {
  try {
    // basePath를 고려한 경로 생성
    const basePath = process.env.NODE_ENV === 'production' ? '/ai-yj' : ''
    const fullUrl = url.startsWith('/') ? `${basePath}${url}` : url
    const pdf = await pdfjsLib.getDocument(fullUrl).promise
    let fullText = ''

    // 모든 페이지의 텍스트 추출
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i)
      const textContent = await page.getTextContent()
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ')
      fullText += pageText + '\n\n'
    }

    return fullText.trim()
  } catch (error) {
    console.error('PDF 파싱 오류:', error)
    throw new Error('PDF 파일을 읽을 수 없습니다.')
  }
}

// Markdown 파일을 텍스트로 변환
export async function parseMD(url: string): Promise<string> {
  try {
    // basePath를 고려한 경로 생성
    const basePath = process.env.NODE_ENV === 'production' ? '/ai-yj' : ''
    const fullUrl = url.startsWith('/') ? `${basePath}${url}` : url
    const response = await fetch(fullUrl)
    const markdown = await response.text()

    // Markdown을 HTML로 변환 후 태그 제거하여 순수 텍스트로
    const html = await marked(markdown)
    const text = html.replace(/<[^>]*>/g, '').trim()

    return text
  } catch (error) {
    console.error('MD 파싱 오류:', error)
    throw new Error('Markdown 파일을 읽을 수 없습니다.')
  }
}

// 문서 로드 (자동 타입 감지)
export async function loadDocument(path: string, name: string): Promise<Document> {
  const extension = path.split('.').pop()?.toLowerCase()

  let content = ''
  let type: 'pdf' | 'md' = 'md'

  if (extension === 'pdf') {
    type = 'pdf'
    content = await parsePDF(path)
  } else if (extension === 'md') {
    type = 'md'
    content = await parseMD(path)
  } else {
    throw new Error(`지원하지 않는 파일 형식입니다: ${extension}`)
  }

  return {
    name,
    type,
    content,
    path,
  }
}

// 여러 문서 로드
export async function loadDocuments(
  documentPaths: { path: string; name: string }[]
): Promise<Document[]> {
  const promises = documentPaths.map(({ path, name }) =>
    loadDocument(path, name)
  )
  return Promise.all(promises)
}

// 문서들을 하나의 컨텍스트로 합치기
export function mergeDocuments(documents: Document[]): string {
  return documents
    .map((doc) => {
      return `=== ${doc.name} ===\n\n${doc.content}\n\n`
    })
    .join('\n')
}



