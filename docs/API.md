# Cutlet URL 단축기 API 문서

## 🔐 인증

대부분의 API는 JWT 토큰 기반 인증이 필요합니다. 로그인 후 받은 토큰은 HTTP-only 쿠키로 자동 설정됩니다.

## 📋 API 엔드포인트

### 1. 사용자 인증

#### 회원가입
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "username": "username" // 선택사항
}
```

**응답:**
```json
{
  "success": true,
  "message": "회원가입이 완료되었습니다.",
  "data": {
    "id": "user_id",
    "email": "user@example.com",
    "username": "username",
    "isPremium": false,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### 로그인
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**응답:**
```json
{
  "success": true,
  "message": "로그인이 완료되었습니다.",
  "data": {
    "user": {
      "id": "user_id",
      "email": "user@example.com",
      "username": "username",
      "isPremium": false
    },
    "token": "jwt_token_here"
  }
}
```

#### 로그아웃
```http
POST /api/auth/logout
```

**응답:**
```json
{
  "success": true,
  "message": "로그아웃이 완료되었습니다."
}
```

### 2. URL 단축

#### URL 단축 생성
```http
POST /api/shorten
Content-Type: application/json

{
  "originalUrl": "https://example.com/very-long-url",
  "customCode": "my-link", // 선택사항
  "tags": ["업무", "프로젝트"], // 선택사항
  "expirationDays": "7", // 선택사항 (permanent, 1, 7, 30, 90, 365)
  "isFavorite": true, // 선택사항
  "isPremiumFavorite": false // 선택사항
}
```

**응답:**
```json
{
  "success": true,
  "data": {
    "id": "url_id",
    "shortUrl": "http://localhost:3000/abc123",
    "originalUrl": "https://example.com/very-long-url",
    "expiresAt": "2024-01-08T00:00:00.000Z",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### URL 리다이렉트
```http
GET /api/redirect/{code}
```

**응답:** 원본 URL로 리다이렉트

### 3. URL 관리

#### 사용자 URL 목록 조회
```http
GET /api/urls?page=1&limit=10&search=keyword&tag=업무&favorite=true
```

**쿼리 파라미터:**
- `page`: 페이지 번호 (기본값: 1)
- `limit`: 페이지당 항목 수 (기본값: 10)
- `search`: 검색어
- `tag`: 태그 필터
- `favorite`: 즐겨찾기만 표시 (true/false)

**응답:**
```json
{
  "success": true,
  "data": {
    "urls": [
      {
        "id": "url_id",
        "originalUrl": "https://example.com",
        "shortUrl": "http://localhost:3000/abc123",
        "shortCode": "abc123",
        "customCode": null,
        "title": "Example",
        "description": "Example description",
        "isFavorite": true,
        "isPremiumFavorite": false,
        "expiresAt": null,
        "createdAt": "2024-01-01T00:00:00.000Z",
        "clickCount": 42,
        "tags": [
          {
            "id": "tag_id",
            "name": "업무",
            "color": "#3B82F6"
          }
        ]
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "totalCount": 25,
      "totalPages": 3,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

#### URL 업데이트
```http
PATCH /api/urls/{id}
Content-Type: application/json

{
  "title": "새로운 제목",
  "description": "새로운 설명",
  "isFavorite": true,
  "isPremiumFavorite": false,
  "expiresAt": "2024-02-01T00:00:00.000Z"
}
```

#### URL 삭제
```http
DELETE /api/urls/{id}
```

### 4. 사용자 프로필

#### 프로필 조회
```http
GET /api/user/profile
```

**응답:**
```json
{
  "success": true,
  "data": {
    "id": "user_id",
    "email": "user@example.com",
    "username": "username",
    "isPremium": false,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z",
    "stats": {
      "totalUrls": 25,
      "totalFavorites": 5
    }
  }
}
```

#### 프로필 업데이트
```http
PATCH /api/user/profile
Content-Type: application/json

{
  "username": "new_username"
}
```

### 5. 통계 및 분석

#### 통계 조회
```http
GET /api/analytics?period=7d&urlId=url_id
```

**쿼리 파라미터:**
- `period`: 기간 (7d, 30d, 90d, 1y)
- `urlId`: 특정 URL의 통계 (선택사항)

**응답:**
```json
{
  "success": true,
  "data": {
    "period": "7d",
    "summary": {
      "totalUrls": 25,
      "totalClicks": 150,
      "totalFavorites": 5,
      "averageClicksPerUrl": 6.0
    },
    "urlStats": [
      {
        "id": "url_id",
        "shortCode": "abc123",
        "title": "Example",
        "clickCount": 42,
        "createdAt": "2024-01-01T00:00:00.000Z",
        "isFavorite": true
      }
    ],
    "dailyClicks": [
      {
        "date": "2024-01-01",
        "clicks": 15
      }
    ],
    "popularTags": [
      {
        "name": "업무",
        "color": "#3B82F6",
        "count": 10
      }
    ]
  }
}
```

## 🔒 에러 코드

| 상태 코드 | 설명 |
|-----------|------|
| 200 | 성공 |
| 400 | 잘못된 요청 데이터 |
| 401 | 인증 필요 |
| 403 | 권한 없음 (프리미엄 기능) |
| 404 | 리소스를 찾을 수 없음 |
| 409 | 충돌 (중복된 데이터) |
| 500 | 서버 오류 |

## 📝 에러 응답 형식

```json
{
  "error": "에러 메시지",
  "details": [] // Zod 검증 오류 시 상세 정보
}
```

## 🚀 사용 예시

### JavaScript/TypeScript

```typescript
// URL 단축
const shortenUrl = async (originalUrl: string) => {
  const response = await fetch('/api/shorten', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      originalUrl,
      tags: ['업무', '프로젝트'],
      expirationDays: '30'
    }),
  })
  
  const result = await response.json()
  return result.data.shortUrl
}

// 사용자 URL 목록 조회
const getUserUrls = async (page = 1) => {
  const response = await fetch(`/api/urls?page=${page}&limit=10`)
  const result = await response.json()
  return result.data.urls
}

// 통계 조회
const getAnalytics = async (period = '7d') => {
  const response = await fetch(`/api/analytics?period=${period}`)
  const result = await response.json()
  return result.data
}
```

### cURL

```bash
# 로그인
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'

# URL 단축
curl -X POST http://localhost:3000/api/shorten \
  -H "Content-Type: application/json" \
  -d '{"originalUrl":"https://example.com"}'

# URL 목록 조회
curl http://localhost:3000/api/urls
```

## 🔧 개발 환경 설정

1. 환경 변수 설정:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/cutlet_db"
JWT_SECRET="your-secret-key"
NEXT_PUBLIC_BASE_URL="http://localhost:3000"
```

2. 데이터베이스 마이그레이션:
```bash
pnpm prisma generate
pnpm prisma db push
```

3. 개발 서버 실행:
```bash
pnpm dev
```

## 📊 성능 고려사항

- 모든 API는 적절한 인덱싱을 통해 최적화됨
- 페이지네이션을 통한 대용량 데이터 처리
- JWT 토큰은 7일간 유효
- HTTP-only 쿠키를 통한 보안 강화
