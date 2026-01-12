'use client'

import dynamic from 'next/dynamic'
import Link from 'next/link'
import { Home } from 'lucide-react'

// AdminDocumentManager를 클라이언트에서만 로드 (SSR 비활성화)
const AdminDocumentManager = dynamic(
  () => import('../components/AdminDocumentManager').then(mod => ({ default: mod.AdminDocumentManager })),
  { ssr: false, loading: () => <div className="text-center py-8">로딩 중...</div> }
)

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* 상단 네비게이션 */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">AI 영업지원 - 관리자</h1>
          <Link
            href="/"
            className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          >
            <Home size={18} />
            <span>메인 페이지</span>
          </Link>
        </div>
      </nav>

      {/* 메인 컨텐츠 */}
      <main className="py-8">
        <AdminDocumentManager />
      </main>
    </div>
  )
}
