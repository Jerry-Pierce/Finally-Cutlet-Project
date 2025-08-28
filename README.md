# Cutlet - URL Shortener Service

## 🧪 Testing

### Running Tests

```bash
# 모든 테스트 실행
pnpm test

# 테스트를 감시 모드로 실행
pnpm test:watch

# 커버리지와 함께 테스트 실행
pnpm test:coverage

# CI 환경에서 테스트 실행
pnpm test:ci
```

### Test Structure

```
__tests__/
├── components/          # UI 컴포넌트 테스트
│   ├── Button.test.tsx
│   └── Card.test.tsx
├── pages/              # 페이지 컴포넌트 테스트
│   └── HomePage.test.tsx
├── api/                # API 엔드포인트 테스트
│   ├── health.test.ts
│   └── public-stats.test.ts
├── integration/        # 통합 테스트
│   └── auth-flow.test.tsx
└── setup/             # 테스트 설정 및 유틸리티
    └── test-utils.tsx
```

### Test Coverage

현재 테스트 커버리지는 다음 영역을 포함합니다:

- ✅ **UI 컴포넌트**: Button, Card 등 기본 컴포넌트
- ✅ **유틸리티 함수**: cn 함수 등 헬퍼 함수
- ✅ **API 엔드포인트**: Health check, Public stats
- ✅ **통합 테스트**: 인증 플로우
- ✅ **페이지 컴포넌트**: 홈페이지 등

### Writing New Tests

새로운 테스트를 작성할 때는 다음 패턴을 따릅니다:

```typescript
import { render, screen } from '@testing-library/react'
import { ComponentName } from '@/components/ui/component-name'

describe('ComponentName', () => {
  it('renders correctly', () => {
    render(<ComponentName>Content</ComponentName>)
    expect(screen.getByText('Content')).toBeInTheDocument()
  })
})
```

### Mocking

테스트에서 외부 의존성을 모킹할 때는 `jest.mock()`을 사용합니다:

```typescript
jest.mock('@/lib/database', () => ({
  db: {
    user: {
      count: jest.fn().mockResolvedValue(100),
    },
  },
}))
```

---

## 🚀 Getting Started

### 필수 요구사항
- Node.js 18+ 
- PostgreSQL 데이터베이스
- pnpm (권장) 또는 npm

### 1. 저장소 클론
```bash
git clone <repository-url>
cd cutlet-v0-style
```

### 2. 의존성 설치
```bash
pnpm install
```

### 3. 환경 변수 설정
```bash
cp env.example .env.local
```

`.env.local` 파일을 편집하여 다음 정보를 입력하세요:
```env
# 데이터베이스 설정
DATABASE_URL="postgresql://username:password@localhost:5432/cutlet_db"

# 애플리케이션 설정
NEXT_PUBLIC_BASE_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"

# JWT 설정
JWT_SECRET="your-jwt-secret-here"
```

### 4. 데이터베이스 설정
```bash
# Prisma 클라이언트 생성
pnpm prisma generate

# 데이터베이스 마이그레이션
pnpm prisma db push

# (선택사항) Prisma Studio 실행
pnpm prisma studio
```

### 5. 개발 서버 실행
```bash
pnpm dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 애플리케이션을 확인하세요.

## 📁 프로젝트 구조

```
cutlet-v0-style/
├── app/                    # Next.js 13+ App Router
│   ├── api/               # API 엔드포인트
│   │   ├── shorten/       # URL 단축 API
│   │   └── redirect/      # URL 리다이렉트 API
│   ├── shortener/         # URL 단축 페이지
│   ├── auth/              # 인증 페이지들
│   ├── dashboard/         # 대시보드
│   └── profile/           # 사용자 프로필
├── components/            # 재사용 가능한 UI 컴포넌트
│   └── ui/               # 기본 UI 컴포넌트들
├── lib/                   # 유틸리티 함수들
│   ├── database.ts       # 데이터베이스 연결
│   ├── url-utils.ts      # URL 관련 유틸리티
│   └── translations.ts   # 다국어 번역
├── prisma/               # 데이터베이스 스키마
│   └── schema.prisma     # Prisma 스키마 정의
└── contexts/             # React Context
    ├── auth-context.tsx  # 인증 컨텍스트
    └── language-context.tsx # 언어 설정 컨텍스트
```

## 🔧 개발 가이드

### 새로운 API 엔드포인트 추가
```typescript
// app/api/example/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  // API 로직 구현
  return NextResponse.json({ message: 'Hello World' })
}
```

### 데이터베이스 모델 추가
```typescript
// prisma/schema.prisma
model Example {
  id        String   @id @default(cuid())
  name      String
  createdAt DateTime @default(now())
}
```

### 다국어 지원 추가
```typescript
// lib/translations.ts
export const translations = {
  en: {
    newKey: "English text"
  },
  ko: {
    newKey: "한국어 텍스트"
  }
}
```

## 🧪 테스트

```bash
# 타입 체크
pnpm type-check

# 린트 검사
pnpm lint

# 빌드 테스트
pnpm build
```

## 📦 배포

### Vercel 배포 (권장)
1. GitHub 저장소를 Vercel에 연결
2. 환경 변수 설정
3. 자동 배포 활성화

### Docker 배포
```bash
# Docker 이미지 빌드
docker build -t cutlet .

# 컨테이너 실행
docker run -p 3000:3000 cutlet
```

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 `LICENSE` 파일을 참조하세요.

## 📞 지원

문제가 있거나 질문이 있으시면 [Issues](https://github.com/yourusername/cutlet-v0-style/issues)를 통해 문의해 주세요.

---

**Cutlet** - URL을 더 스마트하게, 더 아름답게 ✨
# Force Vercel deployment
# Fix Git user configuration
