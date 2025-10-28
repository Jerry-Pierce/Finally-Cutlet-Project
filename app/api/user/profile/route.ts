import { NextResponse } from 'next/server'
import { requireAuth, AuthenticatedRequest } from '@/lib/auth-middleware'
import { db } from '@/lib/database'
import bcrypt from 'bcryptjs'

export const GET = requireAuth(async (request: AuthenticatedRequest) => {
  try {
    const userInfo = request.user!
    const startTime = Date.now()
    console.log('🚀 프로필 API 시작 - 사용자:', userInfo.email, 'Time:', new Date().toISOString())
    
    // 단계별 시간 측정을 위해 순차 실행
    console.log('📊 사용자 기본 정보 조회 시작...')
    const userStartTime = Date.now()
    
    const user = await db.user.findUnique({
      where: { id: userInfo.userId },
      select: {
        id: true,
        email: true,
        username: true,
        emailNotifications: true,
        status: true,
        createdAt: true,
        updatedAt: true
      }
    })
    
    console.log('✅ 사용자 기본 정보 조회 완료:', Date.now() - userStartTime, 'ms')

    if (!user) {
      console.log('❌ 사용자를 찾을 수 없음')
      return NextResponse.json({ error: '사용자를 찾을 수 없습니다.' }, { status: 404 })
    }

    // 통계는 임시로 0으로 설정 (성능 테스트)
    console.log('📈 통계 조회 건너뛰기 (성능 테스트)')
    
    const profile = {
      id: user.id,
      email: user.email,
      username: user.username || userInfo.email?.split('@')[0] || 'user',
      emailNotifications: user.emailNotifications,
      status: user.status,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
      stats: {
        totalUrls: 0, // 임시로 0 설정
        totalFavorites: 0 // 임시로 0 설정
      }
    }

    const totalTime = Date.now() - startTime
    console.log('🎉 프로필 API 완료 - 총 소요시간:', totalTime, 'ms')

    return NextResponse.json({ success: true, data: profile })
  } catch (error) {
    console.error('❌ 프로필 조회 오류:', error)
    return NextResponse.json({ error: '프로필을 불러올 수 없습니다.' }, { status: 500 })
  }
})

export const PATCH = requireAuth(async (request: AuthenticatedRequest) => {
  try {
    const userId = request.user!.userId
    const body = await request.json()
    const { username, currentPassword, newPassword, email, emailNotifications } = body

    const updateData: any = {}

    // 사용자명 업데이트
    if (username && username.trim()) {
      // 중복 확인
      const existingUser = await db.user.findFirst({
        where: { username: username.trim(), NOT: { id: userId } }
      })
      if (existingUser) {
        return NextResponse.json({ error: '이미 사용 중인 사용자명입니다.' }, { status: 400 })
      }
      updateData.username = username.trim()
    }

    // 이메일 업데이트
    if (email && email.trim()) {
      // 중복 확인
      const existingUser = await db.user.findFirst({
        where: { email: email.trim(), NOT: { id: userId } }
      })
      if (existingUser) {
        return NextResponse.json({ error: '이미 사용 중인 이메일입니다.' }, { status: 400 })
      }
      updateData.email = email.trim()
    }

    // 이메일 알림 설정 업데이트
    if (typeof emailNotifications === 'boolean') {
      updateData.emailNotifications = emailNotifications
    }

    // 비밀번호 변경
    if (currentPassword && newPassword) {
      const user = await db.user.findUnique({
        where: { id: userId },
        select: { passwordHash: true }
      })

      if (!user) {
        return NextResponse.json({ error: '사용자를 찾을 수 없습니다.' }, { status: 400 })
      }

      // 현재 비밀번호 확인
      const isValidPassword = await bcrypt.compare(currentPassword, user.passwordHash)
      if (!isValidPassword) {
        return NextResponse.json({ error: '현재 비밀번호가 올바르지 않습니다.' }, { status: 400 })
      }

      // 새 비밀번호 해시화
      const saltRounds = 12
      updateData.passwordHash = await bcrypt.hash(newPassword, saltRounds)
    }

    // 사용자 정보 업데이트
    const updatedUser = await db.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        username: true,
        emailNotifications: true,
        updatedAt: true
      }
    })

    return NextResponse.json({ success: true, data: updatedUser })
  } catch (error) {
    console.error('프로필 업데이트 오류:', error)
    return NextResponse.json({ error: '프로필 업데이트에 실패했습니다.' }, { status: 500 })
  }
})
