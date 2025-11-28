# AI 문서 챗봇 (ai-yj)

문서(PDF, MD)를 기반으로 질문에 답변하는 AI 챗봇입니다.

## 기능

- 📄 PDF 및 Markdown 문서 자동 파싱
- 🤖 Gemini AI 기반 답변 생성
- 💬 플로팅 채팅 인터페이스
- 🎯 문서 컨텍스트 기반 정확한 답변
- 📋 카테고리별 문서 필터링 (지원금/금융캠퍼스/위촉)
- 📞 담당자 연락처 자동 안내

## 설정 방법

### 1. Gemini API 키 발급

1. [Google AI Studio](https://aistudio.google.com/app/apikey)에 접속
2. 'Get API Key' 클릭
3. API 키 복사

### 2. 환경 변수 설정

`.env.local` 파일 생성:
```
NEXT_PUBLIC_GEMINI_API_KEY=your-api-key-here
```

### 3. 문서 준비

`public/documents/` 폴더에 PDF 또는 MD 파일을 추가하세요.

### 4. 개발 서버 실행

```bash
npm install
npm run dev
```

브라우저에서 `http://localhost:3000` 접속

## 배포

### GitHub Pages 배포

1. GitHub 저장소 생성
2. GitHub Secrets에 `NEXT_PUBLIC_GEMINI_API_KEY` 설정
3. `main` 브랜치에 푸시하면 자동 배포

배포 URL: `https://[username].github.io/ai-yj`

## 기술 스택

- **AI**: Google Gemini 2.5 Flash
- **PDF 파싱**: pdf.js
- **MD 파싱**: marked
- **UI**: React, Tailwind CSS, Lucide Icons
- **Framework**: Next.js 16


