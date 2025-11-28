'use client'

import dynamic from 'next/dynamic'

const DocumentChatbot = dynamic(() => import('./components/DocumentChatbot').then(mod => ({ default: mod.DocumentChatbot })), {
  ssr: false,
})

export default function AIYJPage() {
  // 로드할 문서 목록
  const documents = [
    { path: '/documents/goodrich-rp-qa.md', name: 'GoodRich RP채널 Q&A' },
    { path: '/documents/ga-domain-terms.md', name: 'GA 도메인 용어집' },
    { path: '/documents/gr-appoint.md', name: 'GR Appoint' },
    { path: '/documents/contact-info.md', name: '영업지원 연락처' },
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* 챗봇 컴포넌트 */}
      <DocumentChatbot documentPaths={documents} />
    </div>
  )
}

