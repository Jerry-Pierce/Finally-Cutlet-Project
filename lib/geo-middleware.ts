import { NextRequest } from 'next/server'

interface GeoData {
  country: string
  city: string
  region: string
  latitude?: number
  longitude?: number
}

// IP 주소에서 지리적 위치 정보 추출
export async function getGeoData(ip: string): Promise<GeoData | null> {
  try {
    // 로컬 IP 주소는 건너뛰기
    if (ip === 'localhost' || ip === '127.0.0.1' || ip.startsWith('192.168.') || ip.startsWith('10.0.')) {
      return null
    }

    // GeoIP 서비스 API 키가 있는 경우
    const geoApiKey = process.env.GEOIP_API_KEY
    
    if (geoApiKey) {
      // ipapi.co 서비스 사용 (무료)
      const response = await fetch(`https://ipapi.co/${ip}/json/`)
      
      if (response.ok) {
        const data = await response.json()
        
        return {
          country: data.country_code || 'Unknown',
          city: data.city || 'Unknown',
          region: data.region || 'Unknown',
          latitude: data.latitude,
          longitude: data.longitude
        }
      }
    }

    // 대체 방법: 간단한 IP 기반 추정
    return getSimpleGeoEstimate(ip)
    
  } catch (error) {
    console.error('지리적 위치 정보 수집 오류:', error)
    return null
  }
}

// 간단한 IP 기반 지리적 위치 추정
function getSimpleGeoEstimate(ip: string): GeoData | null {
  try {
    // IP 주소를 숫자로 변환
    const ipParts = ip.split('.')
    if (ipParts.length !== 4) return null
    
    const ipNum = ipParts.reduce((acc, part) => (acc << 8) + parseInt(part), 0)
    
    // 간단한 지역 추정 (실제로는 정확하지 않음)
    if (ipNum >= 0x0A000000 && ipNum <= 0x0AFFFFFF) {
      return { country: 'KR', city: 'Seoul', region: 'Seoul' }
    }
    
    if (ipNum >= 0xC0A80000 && ipNum <= 0xC0A8FFFF) {
      return { country: 'US', city: 'New York', region: 'NY' }
    }
    
    // 기본값
    return { country: 'Unknown', city: 'Unknown', region: 'Unknown' }
    
  } catch (error) {
    return null
  }
}

// 요청에서 IP 주소 추출
export function extractIPAddress(request: NextRequest): string {
  // 다양한 헤더에서 IP 주소 확인
  const forwarded = request.headers.get('x-forwarded-for')
  const realIp = request.headers.get('x-real-ip')
  const cfConnectingIp = request.headers.get('cf-connecting-ip')
  
  if (forwarded) {
    // x-forwarded-for는 여러 IP를 포함할 수 있음
    return forwarded.split(',')[0].trim()
  }
  
  if (realIp) {
    return realIp
  }
  
  if (cfConnectingIp) {
    return cfConnectingIp
  }
  
  // 기본값
  return 'unknown'
}

// 지리적 위치 정보를 포함한 클릭 데이터 생성
export async function createClickWithGeo(
  request: NextRequest, 
  urlId: string
): Promise<{
  urlId: string
  ipAddress: string
  userAgent: string
  referer: string
  country: string | null
  city: string | null
  region: string | null
}> {
  const ip = extractIPAddress(request)
  const userAgent = request.headers.get('user-agent') || ''
  const referer = request.headers.get('referer') || ''
  
  // 지리적 위치 정보 수집
  const geoData = await getGeoData(ip)
  
  return {
    urlId,
    ipAddress: ip,
    userAgent,
    referer,
    country: geoData?.country || null,
    city: geoData?.city || null,
    region: geoData?.region || null
  }
}
