# GitHub Pages vs Vercel 비교 및 활용 가이드

현재 프로젝트는 GitHub Pages에 배포되어 있으며, Vercel로도 배포할 수 있습니다. 두 플랫폼의 차이점과 각각의 활용법을 정리했습니다.

## 주요 차이점

### 1. 호스팅 방식

| 항목 | GitHub Pages | Vercel |
|------|-------------|--------|
| **호스팅 타입** | 정적 파일만 (Static) | 정적 + 서버 사이드 렌더링 (SSR) |
| **빌드 방식** | `output: 'export'` 필수 | 자동 감지, SSR 가능 |
| **basePath** | `/ai-yj` 필요 (서브 경로) | 루트 경로 또는 커스텀 도메인 |
| **URL 구조** | `username.github.io/ai-yj` | `project-name.vercel.app` 또는 커스텀 도메인 |

### 2. 배포 속도

| 항목 | GitHub Pages | Vercel |
|------|-------------|--------|
| **빌드 시간** | 2-5분 | 1-2분 |
| **배포 속도** | 상대적으로 느림 | 매우 빠름 (CDN 최적화) |
| **캐시 무효화** | 수동 또는 지연 | 자동, 즉시 반영 |

### 3. 기능 및 제한사항

| 항목 | GitHub Pages | Vercel |
|------|-------------|--------|
| **서버 사이드 기능** | ❌ 불가능 | ✅ 가능 (API Routes, SSR) |
| **환경 변수** | GitHub Secrets (제한적) | 대시보드에서 쉽게 관리 |
| **프리뷰 배포** | ❌ 없음 | ✅ PR마다 자동 생성 |
| **롤백** | 수동 (이전 커밋으로) | ✅ 원클릭 롤백 |
| **애널리틱스** | ❌ 없음 | ✅ 내장 (선택사항) |
| **비용** | 무료 (공개 저장소) | 무료 플랜 제공 |

### 4. 설정 복잡도

| 항목 | GitHub Pages | Vercel |
|------|-------------|--------|
| **초기 설정** | GitHub Actions 워크플로우 필요 | 자동 감지, 클릭 몇 번 |
| **환경 변수 설정** | GitHub Secrets 설정 | 대시보드에서 GUI로 설정 |
| **커스텀 도메인** | 가능하지만 복잡 | 매우 간단 |

## 현재 프로젝트 설정

### GitHub Pages용 설정

```typescript
// next.config.ts (GitHub Pages)
{
  output: 'export',  // 정적 사이트로 빌드
  basePath: '/ai-yj',  // 서브 경로
  assetPrefix: '/ai-yj/',
}
```

### Vercel용 설정 (자동 적용)

```typescript
// next.config.ts (Vercel)
{
  // output: 'export' 제거 (SSR 가능)
  basePath: '',  // 루트 경로
  assetPrefix: '',
}
```

현재 `next.config.ts`는 두 플랫폼 모두 지원하도록 설정되어 있습니다.

## Vercel의 주요 장점

### 1. **프리뷰 배포 (Preview Deployments)**
- Pull Request 생성 시 자동으로 프리뷰 URL 생성
- 변경사항을 배포 전에 테스트 가능
- 팀원과 공유하여 리뷰 가능

### 2. **빠른 배포 및 CDN**
- 전 세계 CDN 네트워크로 빠른 로딩 속도
- 자동 최적화 및 압축
- 이미지 최적화 (Next.js Image 컴포넌트 활용 가능)

### 3. **서버 사이드 기능**
- API Routes 사용 가능
- 서버 사이드 렌더링 (SSR) 가능
- 미들웨어 사용 가능

### 4. **환경 변수 관리**
- 대시보드에서 GUI로 쉽게 관리
- Production, Preview, Development 환경별 설정 가능
- 환경 변수 변경 시 자동 재배포

### 5. **애널리틱스 및 모니터링**
- 내장 애널리틱스 (선택사항)
- 실시간 로그 확인
- 성능 모니터링

### 6. **롤백 및 버전 관리**
- 원클릭 롤백
- 배포 히스토리 관리
- 각 배포의 성능 비교

## Vercel 활용 시나리오

### 시나리오 1: 개발 워크플로우 개선

**GitHub Pages:**
```
코드 수정 → 커밋 → 푸시 → GitHub Actions 빌드 → 배포
(프리뷰 없음, 바로 프로덕션에 배포)
```

**Vercel:**
```
코드 수정 → PR 생성 → 자동 프리뷰 배포 → 리뷰 → 머지 → 프로덕션 배포
(프리뷰로 안전하게 테스트 후 배포)
```

### 시나리오 2: 환경 변수 관리

**GitHub Pages:**
- GitHub Secrets에 설정
- 변경 시 워크플로우 수정 필요
- 환경별 분리 어려움

**Vercel:**
- 대시보드에서 클릭 몇 번으로 설정
- Production/Preview/Development 분리
- 변경 시 자동 재배포

### 시나리오 3: 성능 최적화

**GitHub Pages:**
- 정적 파일만 제공
- CDN은 GitHub 인프라 사용
- 추가 최적화 어려움

**Vercel:**
- 자동 이미지 최적화
- 코드 스플리팅 최적화
- Edge Functions 활용 가능

## 두 플랫폼 동시 사용 전략

### 전략 1: Vercel을 메인, GitHub Pages는 백업

- **Vercel**: 메인 프로덕션 사이트
- **GitHub Pages**: 백업 또는 미러 사이트

### 전략 2: 환경별 분리

- **Vercel**: 개발/스테이징 환경 (프리뷰 배포 활용)
- **GitHub Pages**: 프로덕션 환경

### 전략 3: 기능별 분리

- **Vercel**: 서버 사이드 기능이 필요한 경우
- **GitHub Pages**: 순수 정적 사이트

## Vercel 배포 단계별 가이드

### 1단계: Vercel 계정 생성 및 프로젝트 연결

1. [vercel.com](https://vercel.com) 접속
2. GitHub 계정으로 로그인
3. "Add New Project" 클릭
4. GitHub 저장소 선택
5. 프로젝트 설정 확인 (자동 감지됨)

### 2단계: 환경 변수 설정

Vercel 대시보드 → 프로젝트 → Settings → Environment Variables:

```
NEXT_PUBLIC_GEMINI_API_KEY=your-api-key
NEXT_PUBLIC_GOOGLE_SHEET_ID=1y3-9-GswYKhSYGKHo_3yMGZvO3EHO2bzfJKkG2MNedQ
NEXT_PUBLIC_GOOGLE_SHEET_GID=1960517683
```

**중요**: 
- Production, Preview, Development 모두에 적용
- 변경 후 자동 재배포

### 3단계: 배포

1. "Deploy" 버튼 클릭
2. 배포 완료 대기 (약 1-2분)
3. 배포된 URL 확인: `https://ai-yj.vercel.app`

### 4단계: 커스텀 도메인 설정 (선택사항)

1. Settings → Domains
2. 도메인 추가
3. DNS 설정 안내에 따라 설정

## GitHub Pages와 Vercel 동시 사용

두 플랫폼을 동시에 사용하려면:

### 옵션 1: 브랜치 분리

```bash
# GitHub Pages용 브랜치
git checkout -b gh-pages
# GitHub Pages 설정

# Vercel용 브랜치 (main)
git checkout main
# Vercel 설정
```

### 옵션 2: 조건부 빌드

현재 `next.config.ts`가 이미 두 플랫폼을 지원하도록 설정되어 있습니다:

```typescript
// Vercel 환경 감지
basePath: process.env.VERCEL ? '' : '/ai-yj'
```

## 추천 전략

### 현재 프로젝트에 추천하는 방법

1. **Vercel을 메인으로 사용** (권장)
   - 더 빠른 배포
   - 프리뷰 배포로 안전한 테스트
   - 향후 서버 사이드 기능 추가 가능

2. **GitHub Pages는 유지** (선택사항)
   - 백업 목적
   - 또는 완전히 Vercel로 전환

### 마이그레이션 체크리스트

- [ ] Vercel 계정 생성 및 프로젝트 연결
- [ ] 환경 변수 설정 (GitHub Secrets에서 복사)
- [ ] 첫 배포 테스트
- [ ] 커스텀 도메인 설정 (필요시)
- [ ] GitHub Pages 워크플로우 비활성화 (선택사항)

## 결론

**GitHub Pages**는:
- ✅ 무료, 간단한 정적 사이트 호스팅
- ✅ GitHub와 통합
- ❌ 제한적인 기능, 느린 배포

**Vercel**은:
- ✅ 빠른 배포, 프리뷰 기능
- ✅ 서버 사이드 기능 지원
- ✅ 향상된 개발자 경험
- ✅ 무료 플랜 제공

현재 프로젝트는 두 플랫폼 모두 지원하도록 설정되어 있으므로, 필요에 따라 선택하여 사용할 수 있습니다.

