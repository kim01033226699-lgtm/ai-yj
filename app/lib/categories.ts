import type { Category, CategoryInfo } from './types'

// 담당자 연락처 정보
export interface ContactInfo {
  category: Category
  name: string
  phone: string
  email?: string
}

// 카테고리 정보 정의
export const CATEGORIES: Record<NonNullable<Category>, CategoryInfo> & { null: CategoryInfo } = {
  support: {
    id: 'support',
    label: '지원금',
    emoji: '💰',
    description: '지원금 관련 문의',
  },
  campus: {
    id: 'campus',
    label: '금융캠퍼스',
    emoji: '🏫',
    description: '금융캠퍼스 관련 문의',
  },
  appointment: {
    id: 'appointment',
    label: '위촉',
    emoji: '📋',
    description: '위촉 관련 문의',
  },
  null: {
    id: null,
    label: '전체',
    emoji: '📚',
    description: '전체 문서',
  },
}

// 문서 경로와 카테고리 매핑
export const DOCUMENT_CATEGORIES: Record<string, Category> = {
  '/documents/gr-appoint.md': 'campus', // 금융캠퍼스 관련
  '/documents/sample-guide.md': 'appointment', // 위촉 관련
  '/documents/contact-info.md': null, // 전체 (연락처 정보는 모든 카테고리에 해당)
  '/documents/faq.md': null, // 전체 (FAQ는 모든 카테고리에 해당)
  '/documents/ga_domain.md': null, // 전체 (용어집은 모든 카테고리에 해당)
}

// 카테고리별 문서 필터링
export function filterDocumentsByCategory(
  documents: { path: string; name: string }[],
  category: Category
): { path: string; name: string }[] {
  if (!category) {
    return documents
  }

  return documents.filter((doc) => {
    const docCategory = DOCUMENT_CATEGORIES[doc.path]
    return docCategory === category || docCategory === null
  })
}

// 본사 대표 번호
const MAIN_PHONE = '02-6410-5000'

// 내선번호를 본사 대표 번호 형식으로 변환
function formatPhoneWithExtension(extensions: string | string[]): string {
  const extArray = Array.isArray(extensions) ? extensions : [extensions]
  const extList = extArray
    .map((ext) => ext.replace(/내선\s*/gi, '').trim())
    .filter((ext) => ext)
    .join(', ')
  
  return `${MAIN_PHONE}(내선 ${extList})`
}

// 카테고리별 담당자 연락처 (기본값, 문서에서 추출 시 덮어씀)
export const CONTACT_INFO: Record<NonNullable<Category>, ContactInfo | null> & { null: ContactInfo | null } = {
  support: {
    category: 'support',
    name: '조준승 차장, 서미해 대리',
    phone: formatPhoneWithExtension(['7258', '7439']),
    email: undefined,
  },
  campus: {
    category: 'campus',
    name: '고현진 과장',
    phone: formatPhoneWithExtension('7380'),
    email: undefined,
  },
  appointment: {
    category: 'appointment',
    name: '안다솜 과장, 백현정 부장',
    phone: formatPhoneWithExtension(['7821', '7490']),
    email: undefined,
  },
  null: {
    category: null,
    name: '김남헌 팀장',
    phone: formatPhoneWithExtension('7385'),
    email: undefined,
  },
}

// 문서에서 연락처 정보 추출
export function extractContactFromDocument(
  documentContent: string,
  category: Category
): ContactInfo | null {
  if (!category) {
    return (CONTACT_INFO as Record<string, ContactInfo | null>)['null']
  }

  // 카테고리별 담당자 정보 추출
  const categoryLabels: Record<NonNullable<Category>, string> & { null: string } = {
    support: '지원금',
    campus: '금융캠퍼스',
    appointment: '위촉',
    null: '전체',
  }

  const categoryLabel = categoryLabels[category]
  
  // 문서에서 해당 카테고리 섹션 찾기
  const categorySectionRegex = new RegExp(
    `###\\s+.*${categoryLabel}.*?\\n([\\s\\S]*?)(?=###|##|$)`,
    'i'
  )
  const match = documentContent.match(categorySectionRegex)
  
  if (match) {
    const section = match[1]
    
    // 테이블 형식에서 담당자 정보 추출
    // | 이름 | 직급 | 내선번호 | 담당업무 | 형식
    const tableRows = section.match(/\|\s*([^|]+)\s*\|\s*([^|]+)\s*\|\s*([^|]+)\s*\|\s*([^|]+)\s*\|/g)
    
    if (tableRows && tableRows.length > 1) {
      // 첫 번째 행은 헤더이므로 제외
      const dataRows = tableRows.slice(1)
      const names: string[] = []
      const phones: string[] = []
      
      dataRows.forEach((row) => {
        const cells = row.split('|').map((cell) => cell.trim()).filter((cell) => cell)
        if (cells.length >= 3) {
          // 이름, 직급, 내선번호
          const name = cells[0]
          const position = cells[1]
          const phone = cells[2]
          
          if (name && phone && !name.includes('이름') && !phone.includes('내선번호')) {
            names.push(`${name} ${position}`)
            // 내선번호만 추출 (숫자만)
            const extNumber = phone.replace(/[^0-9]/g, '')
            if (extNumber) {
              phones.push(extNumber)
            }
          }
        }
      })
      
      if (names.length > 0 && phones.length > 0) {
        return {
          category,
          name: names.join(', '),
          phone: formatPhoneWithExtension(phones),
        }
      }
    }
    
    // 테이블 형식이 아닌 경우 텍스트 형식에서 추출 시도
    const nameMatch = section.match(/담당자[：:]\s*([^\n|]+)/)
    const names = nameMatch ? nameMatch[1].trim() : null
    
    const phoneMatch = section.match(/내선번호[：:]\s*([^\n|]+)/)
    const phonesText = phoneMatch ? phoneMatch[1].trim() : null
    
    if (names && phonesText) {
      // 내선번호 추출 (숫자만)
      const extNumbers = phonesText.match(/\d+/g) || []
      if (extNumbers.length > 0) {
        return {
          category,
          name: names,
          phone: formatPhoneWithExtension(extNumbers),
        }
      }
    }
  }
  
  // 문서에서 찾지 못한 경우 기본 연락처 반환
  return CONTACT_INFO[category]
}

