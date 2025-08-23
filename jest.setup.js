import '@testing-library/jest-dom'

// fetch API 모킹
global.fetch = jest.fn()

// Request 타입 모킹 (Next.js 타입 정의 문제 해결)
global.Request = class Request {
  constructor(input, init) {
    // 기본 Request 구현
  }
}

// Response 타입 모킹 (Next.js 타입 정의 문제 해결)
global.Response = class Response {
  constructor(body, init) {
    // 기본 Response 구현
  }
}

// NextResponse 모킹
jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn((data, init) => ({
      json: () => Promise.resolve(data),
      status: init?.status || 200,
      headers: init?.headers || {},
    })),
  },
}))

jest.mock('next/image', () => ({
  __esModule: true,
  default: (props) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...props} />
  },
}))

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href, ...props }) => {
    return <a href={href} {...props}>{children}</a>
  },
}))

jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
    }
  },
  useSearchParams() {
    return new URLSearchParams()
  },
  usePathname() {
    return '/'
  },
}))

process.env.NODE_ENV = 'test'
process.env.NEXT_PUBLIC_API_URL = 'http://localhost:3000'
