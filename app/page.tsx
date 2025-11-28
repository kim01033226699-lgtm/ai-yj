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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-4xl mx-auto">
        {/* 헤더 */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            AI 문서 챗봇
          </h1>
          <p className="text-lg text-gray-600">
            우측 하단의 챗봇 아이콘을 클릭하여 질문해보세요!
          </p>
        </div>

        {/* 안내 카드 */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            💡 사용 방법
          </h2>
          <ul className="space-y-3 text-gray-700">
            <li className="flex items-start gap-3">
              <span className="text-blue-600 font-bold">1.</span>
              <span>우측 하단의 파란색 챗봇 아이콘을 클릭하세요.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-blue-600 font-bold">2.</span>
              <span>
                카테고리를 선택하세요 (지원금/금융캠퍼스/위촉)
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-blue-600 font-bold">3.</span>
              <span>
                문서와 관련된 질문을 입력하세요.
                <br />
                <span className="text-sm text-gray-500">
                  예: "위촉 절차가 뭐야?", "금융캠퍼스 지원금은?", "담당자 연락처 알려줘"
                </span>
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-blue-600 font-bold">4.</span>
              <span>AI가 문서를 기반으로 답변해드립니다.</span>
            </li>
          </ul>
        </div>

        {/* 문서 목록 */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            📚 로드된 문서
          </h2>
          <div className="space-y-2">
            {documents.map((doc, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
              >
                <span className="text-2xl">📄</span>
                <div>
                  <p className="font-medium text-gray-800">{doc.name}</p>
                  <p className="text-xs text-gray-500">{doc.path}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* API 키 안내 */}
        <div className="mt-8 p-6 bg-yellow-50 border-l-4 border-yellow-400 rounded-r-xl">
          <h3 className="font-semibold text-yellow-800 mb-2">⚠️ 중요</h3>
          <p className="text-sm text-yellow-700">
            챗봇을 사용하려면 <code className="bg-yellow-100 px-2 py-1 rounded">.env.local</code> 파일에{' '}
            <code className="bg-yellow-100 px-2 py-1 rounded">
              NEXT_PUBLIC_GEMINI_API_KEY
            </code>를 설정해야 합니다.
          </p>
        </div>

      </div>

      {/* 챗봇 컴포넌트 */}
      <DocumentChatbot documentPaths={documents} />
    </div>
  )
}

