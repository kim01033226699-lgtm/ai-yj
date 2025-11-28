# AI-YJ 프로젝트 문제 해결 기록

**날짜**: 2025년 11월 28일
**작업자**: Claude Code

---

## 📋 목차

1. [문제 상황](#문제-상황)
2. [구조 분석](#구조-분석)
3. [발견된 문제들](#발견된-문제들)
4. [해결 방법](#해결-방법)
5. [배포 이슈](#배포-이슈)
6. [향후 개선 사항](#향후-개선-사항)

---

## 🔍 문제 상황

### 초기 증상
- 카테고리를 선택해도 하위 옵션이 제대로 표시되지 않음
- 카테고리 선택 전에도 옵션들이 미리 나타남
- 옵션으로 표시되는 텍스트가 짧은 라벨이 아니라 긴 답변 내용

### 사용자 보고
> "카테고리 선택해도 변화없고 카테고리 선택전에 옵션이 나와 있음"

---

## 🏗️ 구조 분석

### 1. 구글 시트 연동 구조

#### 데이터 소스
```
.env.local:
- NEXT_PUBLIC_GOOGLE_SHEET_ID=1y3-9-GswYKhSYGKHo_3yMGZvO3EHO2bzfJKkG2MNedQ
- NEXT_PUBLIC_GOOGLE_SHEET_GID=1960517683
```

#### 데이터 로딩 우선순위
```
1순위: 구글 시트 (환경변수 있을 경우)
   ↓
2순위: 로컬스토리지 (이전에 로드된 데이터)
   ↓
3순위: JSON 파일 (public/preset-answers.json)
   ↓
4순위: 기본값 (코드에 하드코딩된 값)
```

#### 구글 시트 구조
```
1행: 헤더 (카테고리설정 | 프리셋설정)
2행: 컬럼명 (id, label, id, 최상위옵션, 상세내용, ...)
3행~: 데이터

컬럼 구조:
- A열: 카테고리 ID (appoint, guarantee)
- B열: 카테고리 label (위촉, 수수료재정보증)
- C열: (비어있음)
- D열: 프리셋 카테고리 ID
- E열: 최상위옵션 (레벨1 라벨)
- F열: 상세내용 (레벨1 답변)
- G열: 옵션1 (레벨2-1 라벨)
- H열: 상세내용 (레벨2-1 답변)
- I~N열: 옵션2~4 및 답변
```

### 2. 관련 파일 구조

```
ai-yj/
├── app/
│   ├── components/
│   │   ├── CategorySelector.tsx         # 카테고리 선택 UI
│   │   ├── PresetAnswerSelector.tsx     # 프리셋 옵션 선택 UI
│   │   ├── ChatWindow.tsx               # 채팅창 컴포넌트
│   │   └── DocumentChatbot.tsx          # 메인 챗봇 로직
│   └── lib/
│       ├── googleSheetsLoader.ts        # 구글 시트 CSV 파싱
│       ├── categoryStorage.ts           # 카테고리 데이터 관리
│       ├── presetAnswersStorage.ts      # 프리셋 답변 데이터 관리
│       ├── presetAnswers.ts             # 프리셋 답변 로직
│       └── types.ts                     # 타입 정의
└── .github/
    └── workflows/
        └── deploy.yml                   # GitHub Pages 배포 워크플로우
```

---

## 🐛 발견된 문제들

### 문제 1: CSV 파싱의 줄바꿈 처리 오류

#### 증상
- 구글 시트의 답변 내용에 줄바꿈(`\n`)이 포함됨
- 기존 `split('\n')`이 따옴표 안의 줄바꿈까지 쪼갬
- 결과: 하나의 답변이 여러 행으로 잘못 파싱됨

#### 예시
```csv
guarantee,수수료 재정보증 종류,,보증보험,"개인신용도에 따라...
가입한 보증보험은 보험기간 만료일을 기준으로 매년 갱신...
설정 및 해제 비용은 본인 부담이며..."
```

위 데이터가 3개의 별도 행으로 파싱되어, 답변 중간 부분들이 옵션으로 잘못 표시됨.

#### 원인 코드
```typescript
// googleSheetsLoader.ts:96 (수정 전)
const lines = csvText.split('\n').filter(line => line.trim())
```

---

### 문제 2: 카테고리 ID 매핑 불일치

#### 증상
- 구글 시트: `appoint`, `guarantee`
- UI 카테고리: `appointment`, `grant`, `support`, `campus`
- 매핑이 불완전하여 일부 카테고리에서 옵션 로드 실패

#### 원인
- 카테고리 ID 매핑 테이블이 단방향만 지원
- 일부 변형된 ID가 매핑 테이블에 없음

---

### 문제 3: 잘못된 카테고리 값 전달

#### 증상
```
[getFirstLevelOptions] 잘못된 category 값 (옵션 제목으로 보임):
"가입한 보증보험은 보험기간 만료일을 기준으로 매년 갱신..."
```

#### 원인
- CSV 파싱 오류로 인해 답변 텍스트가 카테고리로 전달됨
- `PresetAnswerSelector`에 유효성 검사 부재

---

### 문제 4: GitHub Actions 환경 변수 누락

#### 증상
- 로컬에서는 정상 작동
- 배포 후 구글 시트 데이터 로드 실패
- 기본값만 표시됨

#### 원인
```yaml
# .github/workflows/deploy.yml (수정 전)
env:
  NODE_ENV: production
  NEXT_PUBLIC_GEMINI_API_KEY: ${{ secrets.NEXT_PUBLIC_GEMINI_API_KEY }}
  # ❌ 구글 시트 환경 변수 누락!
```

---

## ✅ 해결 방법

### 해결 1: CSV 파싱 로직 개선

#### 새로운 `splitCSVLines` 함수 추가

```typescript
// googleSheetsLoader.ts:221-264
function splitCSVLines(csvText: string): string[] {
  const lines: string[] = []
  let currentLine = ''
  let inQuotes = false

  for (let i = 0; i < csvText.length; i++) {
    const char = csvText[i]
    const nextChar = csvText[i + 1]

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // 이스케이프된 따옴표
        currentLine += '""'
        i++
      } else {
        // 따옴표 시작/끝
        inQuotes = !inQuotes
        currentLine += char
      }
    } else if (char === '\n' && !inQuotes) {
      // 따옴표 밖의 줄바꿈 = 라인 구분자
      if (currentLine) {
        lines.push(currentLine)
      }
      currentLine = ''
    } else if (char === '\r') {
      // \r은 무시 (Windows 줄바꿈 처리)
      if (!inQuotes && nextChar === '\n') {
        continue
      }
      currentLine += char
    } else {
      currentLine += char
    }
  }

  if (currentLine) {
    lines.push(currentLine)
  }

  return lines
}
```

#### 적용
```typescript
// parseCSVToPresetAnswers 수정
const lines = splitCSVLines(csvText).filter(line => line.trim())

// parseCSVToCategories 수정
const lines = splitCSVLines(csvText).filter(line => line.trim())
```

---

### 해결 2: 카테고리 ID 매핑 확장

```typescript
// presetAnswers.ts:219-227
const categoryMapping: Record<string, string[]> = {
  'appointment': ['appointment', 'appoint'],
  'appoint': ['appoint', 'appointment'],     // ← 양방향 추가
  'grant': ['grant', 'guarantee'],
  'guarantee': ['guarantee', 'grant'],       // ← 양방향 추가
  'support': ['support', 'grant', 'guarantee'],
  'campus': ['campus', 'gfe'],
  'gfe': ['gfe', 'campus'],                  // ← 양방향 추가
}
```

#### 유효 카테고리 ID 목록 업데이트
```typescript
const validCategoryIds = [
  'support', 'campus', 'appointment', 'grant',
  'appoint', 'guarantee', 'gfe'  // ← 추가
]
```

---

### 해결 3: PresetAnswerSelector 유효성 검사

```typescript
// PresetAnswerSelector.tsx:44-48
// 카테고리가 유효한 ID인지 확인 (긴 텍스트가 전달되는 버그 방지)
if (typeof category === 'string' && category.length > 50) {
  console.error('[PresetAnswerSelector] 잘못된 category 값:', category)
  return null
}
```

---

### 해결 4: GitHub Actions 환경 변수 추가

```yaml
# .github/workflows/deploy.yml:34-40
- name: Build
  run: npm run build
  env:
    NODE_ENV: production
    NEXT_PUBLIC_GEMINI_API_KEY: ${{ secrets.NEXT_PUBLIC_GEMINI_API_KEY }}
    NEXT_PUBLIC_GOOGLE_SHEET_ID: ${{ secrets.NEXT_PUBLIC_GOOGLE_SHEET_ID }}      # ← 추가
    NEXT_PUBLIC_GOOGLE_SHEET_GID: ${{ secrets.NEXT_PUBLIC_GOOGLE_SHEET_GID }}    # ← 추가
```

#### GitHub Secrets 설정
```
Settings → Secrets and variables → Actions → New repository secret

1. NEXT_PUBLIC_GEMINI_API_KEY
   → AIzaSyB9AV8MxBBgin_VRM2v7jsCxSpilT6oa3c

2. NEXT_PUBLIC_GOOGLE_SHEET_ID
   → 1y3-9-GswYKhSYGKHo_3yMGZvO3EHO2bzfJKkG2MNedQ

3. NEXT_PUBLIC_GOOGLE_SHEET_GID
   → 1960517683
```

---

## 🚀 배포 이슈

### 문제: 로컬스토리지 캐시

#### 증상
배포 후 콘솔 메시지:
```
로컬스토리지에 데이터가 있어 파일 동기화를 건너뜁니다.
[getFirstLevelOptions] 사용 가능한 카테고리: ['support', 'campus', 'appointment']
```

- 오래된 데이터(`support`, `campus`, `appointment`)가 로컬스토리지에 캐시됨
- 새로운 데이터(`appoint`, `guarantee`)를 로드하지 않음

#### 해결 방법
**사용자 측 (즉시 해결)**:
1. 브라우저 개발자 도구 (`F12`)
2. **Application** → **Local Storage** → 사이트 URL
3. `preset-answers-data`와 `categories-list` 삭제
4. 강제 새로고침 (`Ctrl + Shift + R`)

**코드 측 (장기 해결)**:
- 버전 관리를 추가하여 스키마 변경 시 자동으로 캐시 무효화
- 또는 구글 시트 로드를 항상 최우선으로 처리

---

## 📊 수정된 파일 목록

### 핵심 수정
1. **app/lib/googleSheetsLoader.ts**
   - `splitCSVLines()` 함수 추가 (221-264번 라인)
   - `parseCSVToPresetAnswers()` 수정 (97번 라인)
   - `parseCSVToCategories()` 수정 (177번 라인)

2. **app/lib/presetAnswers.ts**
   - 카테고리 매핑 테이블 확장 (219-227번 라인)
   - `findSheetCategoryId()` 매핑 업데이트 (238-246번 라인)
   - `validCategoryIds` 목록 업데이트 (437-440번 라인)

3. **app/components/PresetAnswerSelector.tsx**
   - 카테고리 유효성 검사 추가 (44-48번 라인)

4. **.github/workflows/deploy.yml**
   - 환경 변수 추가 (39-40번 라인)

### 커밋 히스토리
```bash
e6036ce - Add Google Sheets environment variables to GitHub Actions
b4bb99f - 에러 재수정
b0a3cc0 - 에러수정
0642575 - 프리셋수정
```

---

## 🎯 향후 개선 사항

### 1. 데이터 캐싱 전략 개선
```typescript
// 버전 관리 추가
interface CachedData {
  version: string  // 스키마 버전
  timestamp: number
  data: Record<string, PresetOption[]>
}

// 구글 시트 우선 정책
const CACHE_PRIORITY = {
  GOOGLE_SHEETS: 1,
  LOCAL_STORAGE: 2,
  FILE: 3,
  DEFAULT: 4
}
```

### 2. 에러 처리 강화
- 구글 시트 로드 실패 시 명확한 에러 메시지
- 사용자에게 "구글 시트를 로드할 수 없습니다. 기본값을 사용합니다." 알림

### 3. CSV 파싱 라이브러리 사용 고려
- 현재: 직접 구현한 `splitCSVLines` 사용
- 개선: `papaparse` 등 검증된 CSV 파싱 라이브러리 사용

### 4. 타입 안전성 강화
```typescript
// 런타임 검증 추가
function validatePresetData(data: unknown): data is Record<string, PresetOption[]> {
  // Zod 또는 io-ts 사용
}
```

### 5. 모니터링 추가
- 구글 시트 로드 성공/실패 메트릭
- 사용자별 카테고리/옵션 사용 통계

---

## 📝 테스트 체크리스트

- [x] 로컬 환경에서 구글 시트 데이터 로드 확인
- [x] 카테고리 선택 시 올바른 옵션 표시 확인
- [x] 하위 옵션이 있는 경우 계층 구조 정상 작동 확인
- [x] 답변 내용이 말풍선으로 정상 표시 확인
- [x] GitHub Actions 빌드 성공 확인
- [x] GitHub Secrets 설정 완료
- [ ] 배포 환경에서 구글 시트 로드 확인 (로컬스토리지 클리어 후)
- [ ] 여러 브라우저에서 정상 작동 확인
- [ ] 모바일 환경 테스트

---

## 🔗 참고 링크

- **GitHub 저장소**: https://github.com/kim01033226699-lgtm/ai-yj
- **배포 사이트**: https://kim01033226699-lgtm.github.io/ai-yj/
- **구글 시트**: https://docs.google.com/spreadsheets/d/1y3-9-GswYKhSYGKHo_3yMGZvO3EHO2bzfJKkG2MNedQ/edit

---

## 📞 문의 및 지원

문제가 발생하면:
1. 브라우저 콘솔 확인 (`F12`)
2. 로컬스토리지 클리어
3. GitHub Actions 로그 확인
4. 구글 시트 공개 설정 확인

---

**작성**: Claude Code
**날짜**: 2025-11-28
**버전**: 1.0
