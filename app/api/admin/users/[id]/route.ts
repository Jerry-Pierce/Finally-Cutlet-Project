import { NextRequest, NextResponse } from 'next/server'
import { requireAdminHandler, AdminRequest } from '@/lib/admin-middleware'
import { db } from '@/lib/database'

async function handler(request: AdminRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')

    if (!action) {
      return NextResponse.json(
        { error: 'MISSING_ACTION', message: '액션을 지정해야 합니다.' },
        { status: 400 }
      )
    }

    // 사용자 존재 확인
    const user = await db.user.findUnique({
      where: { id },
      select: { id: true, email: true, isPremium: true }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'USER_NOT_FOUND', message: '사용자를 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    let updateData: any = {}
    let message = ''

    switch (action) {
      case 'updateStatus':
        const body = await request.json()
        const newStatus = body.status
        
        if (!['active', 'suspended', 'pending'].includes(newStatus)) {
          return NextResponse.json(
            { error: 'INVALID_STATUS', message: '유효하지 않은 상태입니다.' },
            { status: 400 }
          )
        }
        
        updateData = { status: newStatus }
        message = `사용자 상태가 ${newStatus === 'active' ? '활성' : newStatus === 'suspended' ? '정지' : '대기'}로 변경되었습니다.`
        break
        
      case 'suspend':
        // 사용자 정지
        updateData = { status: 'suspended' }
        message = '사용자가 정지되었습니다.'
        break
        
      case 'activate':
        // 사용자 활성화
        updateData = { status: 'active' }
        message = '사용자가 활성화되었습니다.'
        break
        
      case 'delete':
        // 사용자 삭제 (관련 데이터도 함께 삭제)
        await db.$transaction([
          // URL 클릭 기록 삭제
          db.urlClick.deleteMany({
            where: {
              url: {
                userId: id
              }
            }
          }),
          // 단축 URL 삭제
          db.shortenedUrl.deleteMany({
            where: { userId: id }
          }),
          // 즐겨찾기 삭제
          db.favorite.deleteMany({
            where: { userId: id }
          }),
          // 사용자 삭제
          db.user.delete({
            where: { id }
          })
        ])
        
        return NextResponse.json({
          success: true,
          message: '사용자가 삭제되었습니다.'
        })
        
      default:
        return NextResponse.json(
          { error: 'INVALID_ACTION', message: '유효하지 않은 액션입니다.' },
          { status: 400 }
        )
    }

    // 사용자 정보 업데이트
    await db.user.update({
      where: { id },
      data: updateData
    })

    return NextResponse.json({
      success: true,
      message,
      user: {
        id: user.id,
        email: user.email,
        isPremium: updateData.isPremium !== undefined ? updateData.isPremium : user.isPremium
      }
    })

  } catch (error) {
    console.error('사용자 상태 변경 실패:', error)
    return NextResponse.json(
      { error: 'INTERNAL_SERVER_ERROR', message: '사용자 상태 변경에 실패했습니다.' },
      { status: 500 }
    )
  }
}

export const PATCH = requireAdminHandler(handler)

// DELETE 메서드 별도 처리
export const DELETE = requireAdminHandler(async (request: AdminRequest, { params }: { params: Promise<{ id: string }> }) => {
  try {
    const { id } = await params
    
    // 사용자 존재 확인
    const user = await db.user.findUnique({
      where: { id },
      select: { id: true, email: true }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'USER_NOT_FOUND', message: '사용자를 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    // 사용자 삭제 (관련 데이터도 함께 삭제)
    await db.$transaction([
      // URL 클릭 기록 삭제
      db.urlClick.deleteMany({
        where: {
          url: {
            userId: id
          }
        }
      }),
      // 단축 URL 삭제
      db.shortenedUrl.deleteMany({
        where: { userId: id }
        }),
      // 즐겨찾기 삭제
      db.favorite.deleteMany({
        where: { userId: id }
      }),
      // 사용자 삭제
      db.user.delete({
        where: { id }
      })
    ])
    
    return NextResponse.json({
      success: true,
      message: '사용자가 삭제되었습니다.'
    })

  } catch (error) {
    console.error('사용자 삭제 실패:', error)
    return NextResponse.json(
      { error: 'INTERNAL_SERVER_ERROR', message: '사용자 삭제에 실패했습니다.' },
      { status: 500 }
    )
  }
})
