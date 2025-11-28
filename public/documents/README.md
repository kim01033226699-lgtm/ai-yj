# 문서 폴더

이 폴더에 챗봇이 참고할 문서 파일을 추가하세요.

## 지원 형식
- `.md` (Markdown)
- `.pdf` (PDF)

## 문서 추가 방법

1. 문서 파일을 이 폴더에 복사
2. `app/page.tsx`의 `documents` 배열에 추가:

```typescript
const documents = [
  { path: '/documents/your-file.md', name: '문서 이름' },
]
```

## 카테고리 매핑

`app/lib/categories.ts`의 `DOCUMENT_CATEGORIES`에 문서 경로와 카테고리를 매핑하세요:

```typescript
export const DOCUMENT_CATEGORIES: Record<string, Category> = {
  '/documents/your-file.md': 'support', // 또는 'campus', 'appointment'
}
```



