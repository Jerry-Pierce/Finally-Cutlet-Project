/**
 * URL 단축 관련 유틸리티 함수들
 */

/**
 * 짧은 코드 생성 (8자리 랜덤 문자열)
 */
export function generateShortCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  
  return result
}

/**
 * URL 유효성 검사
 */
export function validateUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

/**
 * URL에서 도메인 추출
 */
export function extractDomain(url: string): string {
  try {
    const urlObj = new URL(url)
    return urlObj.hostname
  } catch {
    return url
  }
}

/**
 * URL에서 제목 추출 (메타 태그에서)
 */
export async function extractUrlTitle(url: string): Promise<string | null> {
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; CutletBot/1.0)'
      }
    })
    
    if (!response.ok) return null
    
    const html = await response.text()
    
    // title 태그에서 제목 추출
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i)
    if (titleMatch) {
      return titleMatch[1].trim()
    }
    
    // h1 태그에서 제목 추출
    const h1Match = html.match(/<h1[^>]*>([^<]+)<\/h1>/i)
    if (h1Match) {
      return h1Match[1].trim()
    }
    
    return null
  } catch (error) {
    console.error('URL 제목 추출 오류:', error)
    return null
  }
}

/**
 * 만료일 계산
 */
export function calculateExpirationDate(days: number): Date {
  const expirationDate = new Date()
  expirationDate.setDate(expirationDate.getDate() + days)
  return expirationDate
}

/**
 * 남은 시간 계산 (사용자 친화적)
 */
export function getTimeRemaining(expiresAt: Date): string {
  const now = new Date()
  const diff = expiresAt.getTime() - now.getTime()
  
  if (diff <= 0) {
    return '만료됨'
  }
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  
  if (days > 0) {
    return `${days}일 ${hours}시간`
  } else if (hours > 0) {
    return `${hours}시간 ${minutes}분`
  } else {
    return `${minutes}분`
  }
}

/**
 * 클릭 수 포맷팅
 */
export function formatClickCount(count: number): string {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`
  } else if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`
  }
  return count.toString()
}

/**
 * URL 안전성 검사 (악성 URL 필터링)
 */
export function isUrlSafe(url: string): boolean {
  const unsafePatterns = [
    /javascript:/i,
    /data:/i,
    /vbscript:/i,
    /file:/i,
    /about:/i,
    /chrome:/i,
    /chrome-extension:/i,
    /moz-extension:/i,
    /safari-extension:/i,
    /ms-browser-extension:/i,
  ]
  
  return !unsafePatterns.some(pattern => pattern.test(url))
}
