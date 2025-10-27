import React, { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { AuthProvider } from '@/contexts/auth-context'
import { LanguageProvider } from '@/contexts/language-context'

// 테스트용 래퍼 컴포넌트
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <LanguageProvider>
      <AuthProvider>
        {children}
      </AuthProvider>
    </LanguageProvider>
  )
}

// 커스텀 렌더 함수
const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options })

// 테스트용 사용자 데이터
export const mockUser = {
  id: 'test-user-id',
  email: 'test@example.com',
  username: 'testuser',
  isPremium: false,
  createdAt: new Date(),
  updatedAt: new Date(),
}

// 테스트용 URL 데이터
export const mockShortenedUrl = {
  id: 'test-url-id',
  userId: 'test-user-id',
  originalUrl: 'https://example.com',
  shortCode: 'abc123',
  customCode: null,
  title: 'Test URL',
  description: 'Test description',
  isFavorite: false,
  expiresAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
}

// 테스트용 태그 데이터
export const mockTag = {
  id: 'test-tag-id',
  name: 'test-tag',
  color: '#3B82F6',
  description: 'Test tag description',
  userId: 'test-user-id',
  createdAt: new Date(),
}

// API 응답 모킹 헬퍼
export const mockApiResponse = (data: any, status = 200) => {
  return Promise.resolve({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(data),
    text: () => Promise.resolve(JSON.stringify(data)),
  })
}

// 에러 응답 모킹 헬퍼
export const mockApiError = (message: string, status = 400) => {
  return Promise.resolve({
    ok: false,
    status,
    json: () => Promise.resolve({ message, error: message }),
    text: () => Promise.resolve(JSON.stringify({ message, error: message })),
  })
}

// 재내보내기
export * from '@testing-library/react'
export { customRender as render }

// 테스트 유틸리티 함수들
describe('Test Utilities', () => {
  it('should provide mock user data', () => {
    expect(mockUser).toHaveProperty('id')
    expect(mockUser).toHaveProperty('email')
    expect(mockUser).toHaveProperty('username')
  })

  it('should provide mock URL data', () => {
    expect(mockShortenedUrl).toHaveProperty('id')
    expect(mockShortenedUrl).toHaveProperty('originalUrl')
    expect(mockShortenedUrl).toHaveProperty('shortCode')
  })

  it('should provide mock tag data', () => {
    expect(mockTag).toHaveProperty('id')
    expect(mockTag).toHaveProperty('name')
    expect(mockTag).toHaveProperty('color')
  })
})
