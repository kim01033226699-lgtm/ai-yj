# Vercel 배포 가이드

이 프로젝트를 Vercel에 배포하는 방법입니다.

## 방법 1: Vercel 웹 대시보드 사용 (권장)

### 1단계: GitHub에 코드 푸시

1. GitHub 저장소 생성 (아직 없다면)
2. 로컬 코드를 GitHub에 푸시:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/your-username/ai-yj.git
   git push -u origin main
   ```

### 2단계: Vercel에 프로젝트 연결

1. [Vercel](https://vercel.com) 접속 및 로그인
2. "Add New Project" 클릭
3. GitHub 저장소 선택
4. 프로젝트 설정:
   - **Framework Preset**: Next.js
   - **Root Directory**: `./` (기본값)
   - **Build Command**: `npm run build` (자동 감지)
   - **Output Directory**: `out` (자동 감지)
   - **Install Command**: `npm install` (자동 감지)

### 3단계: 환경 변수 설정

Vercel 대시보드에서 프로젝트 설정 → Environment Variables에 다음 추가:

```
NEXT_PUBLIC_GEMINI_API_KEY=your-api-key-here
NEXT_PUBLIC_GOOGLE_SHEET_ID=1y3-9-GswYKhSYGKHo_3yMGZvO3EHO2bzfJKkG2MNedQ
NEXT_PUBLIC_GOOGLE_SHEET_GID=1960517683
```

**중요**: 
- 모든 환경 변수는 **Production**, **Preview**, **Development** 모두에 적용
- `NEXT_PUBLIC_` 접두사가 있는 변수는 클라이언트에서 접근 가능

### 4단계: 배포

1. "Deploy" 버튼 클릭
2. 배포 완료 대기 (약 1-2분)
3. 배포된 URL 확인

## 방법 2: Vercel CLI 사용

### 1단계: Vercel CLI 설치

```bash
npm i -g vercel
```

### 2단계: 로그인

```bash
vercel login
```

### 3단계: 프로젝트 배포

```bash
vercel
```

첫 배포 시:
- 프로젝트 이름 설정
- 환경 변수 입력 (또는 나중에 대시보드에서 설정)

### 4단계: 프로덕션 배포

```bash
vercel --prod
```

## 환경 변수 설정 (CLI)

CLI로 환경 변수 설정:

```bash
vercel env add NEXT_PUBLIC_GEMINI_API_KEY
vercel env add NEXT_PUBLIC_GOOGLE_SHEET_ID
vercel env add NEXT_PUBLIC_GOOGLE_SHEET_GID
```

각 명령어 실행 시 값 입력하거나, 한 번에 설정:

```bash
vercel env add NEXT_PUBLIC_GEMINI_API_KEY production
vercel env add NEXT_PUBLIC_GOOGLE_SHEET_ID production
vercel env add NEXT_PUBLE_SHEET_GID production
```

## 배포 후 확인 사항

1. **구글 시트 공개 설정 확인**
   - 구글 시트가 "링크가 있는 모든 사용자"에게 공개되어 있는지 확인
   - 권한: "뷰어"

2. **CORS 문제 확인**
   - 브라우저 콘솔에서 CORS 에러가 없는지 확인
   - 구글 시트가 공개되어 있으면 문제 없음

3. **환경 변수 확인**
   - Vercel 대시보드 → Settings → Environment Variables에서 확인
   - 배포 후에도 환경 변수가 적용되었는지 확인

## 커스텀 도메인 설정 (선택사항)

1. Vercel 대시보드 → 프로젝트 → Settings → Domains
2. 도메인 추가
3. DNS 설정 안내에 따라 도메인 설정

## 트러블슈팅

### 빌드 실패

- **에러**: `Module not found`
  - 해결: `package.json`의 dependencies 확인
  - `npm install` 실행 후 재배포

- **에러**: `Environment variable not found`
  - 해결: Vercel 대시보드에서 환경 변수 설정 확인
  - 환경 변수 이름이 정확한지 확인 (`NEXT_PUBLIC_` 접두사 포함)

### 런타임 에러

- **구글 시트 데이터가 로드되지 않음**
  - 구글 시트 공개 설정 확인
  - 브라우저 콘솔에서 네트워크 요청 확인
  - 환경 변수 `NEXT_PUBLIC_GOOGLE_SHEET_ID` 확인

- **CORS 에러**
  - 구글 시트가 공개로 설정되어 있는지 확인
  - 시트 URL이 올바른지 확인

## 자동 배포 설정

GitHub에 푸시하면 자동으로 배포됩니다:

1. Vercel 대시보드 → 프로젝트 → Settings → Git
2. "Automatic deployments" 활성화 확인
3. `main` 브랜치에 푸시하면 자동 배포

## 참고 사항

- 현재 프로젝트는 정적 사이트로 빌드됩니다 (`output: 'export'`)
- `basePath`가 `/ai-yj`로 설정되어 있어 서브 경로에서 실행됩니다
- Vercel은 자동으로 최적화된 CDN을 제공합니다

