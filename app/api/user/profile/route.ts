import { NextResponse } from 'next/server'
import { requireAuth, AuthenticatedRequest } from '@/lib/auth-middleware'
import { db } from '@/lib/database'
import bcrypt from 'bcryptjs'

export const GET = requireAuth(async (request: AuthenticatedRequest) => {
<<<<<<< HEAD
  try {
    const userId = request.user!.userId
=======
  // 즉시 사용자 정보 반환 (DB 조회 없이)
  const userInfo = request.user!
  
  console.log('즉시 프로필 API 응답 - 사용자:', userInfo.email)
  
  const profile = {
    id: userInfo.userId,
    email: userInfo.email,
    username: userInfo.username || userInfo.email?.split('@')[0] || 'user', // JWT에서 실제 사용자명 사용
    emailNotifications: true,
    status: 'active' as const,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    stats: {
      totalUrls: 0,
      totalFavorites: 0
    }
  }
>>>>>>> 4c44706 (Remove premium features and PayPal integration - Convert to free-only service)

    // 기존 프로필 조회 로직
    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        username: true,
        isPremium: true,
        emailNotifications: true,
        createdAt: true,
        updatedAt: true
      }
    })

    if (!user) {
      return NextResponse.json({ error: '사용자를 찾을 수 없습니다.' }, { status: 404 })
    }

    // URL 및 즐겨찾기 개수 조회
    const [urlCount, favoriteCount] = await Promise.all([
      db.shortenedUrl.count({ where: { userId } }),
      db.favorite.count({ where: { userId } })
    ])

    const profile = {
      ...user,
      stats: {
        totalUrls: urlCount,
        totalFavorites: favoriteCount
      }
    }

    return NextResponse.json({ success: true, data: profile })
  } catch (error) {
    console.error('프로필 조회 오류:', error)
    return NextResponse.json({ error: '프로필 조회에 실패했습니다.' }, { status: 500 })
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
        isPremium: true,
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
