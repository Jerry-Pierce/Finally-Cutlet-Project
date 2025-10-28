import { NextResponse, NextRequest } from 'next/server'

// 임시 테스트: 모든 의존성 제거

// 임시 테스트: auth-middleware 우회해서 데이터베이스 접근 없이 바로 응답
export async function GET(request: NextRequest) {
  try {
    const startTime = Date.now()
    console.log('🚀 프로필 API 시작 (간단 테스트):', new Date().toISOString())
    
    // 데이터베이스 접근 없이 바로 응답
    const profile = {
      id: 'test-user-id',
      email: 'test@cutlet.local',
      username: 'testuser',
      emailNotifications: true,
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      stats: {
        totalUrls: 0,
        totalFavorites: 0
      }
    }

    const totalTime = Date.now() - startTime
    console.log('🎉 간단 테스트 완료 - 총 소요시간:', totalTime, 'ms')

    return NextResponse.json({ success: true, data: profile })
  } catch (error) {
    console.error('❌ 간단 테스트 오류:', error)
    return NextResponse.json({ error: '테스트 실패' }, { status: 500 })
  }
}

// PATCH 함수 임시 비활성화 (테스트 목적)
