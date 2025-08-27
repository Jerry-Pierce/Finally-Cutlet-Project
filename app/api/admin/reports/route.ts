import { NextRequest, NextResponse } from 'next/server'
import { requireAdminHandler, AdminRequest } from '@/lib/admin-middleware'
import { db } from '@/lib/database'

async function handler(request: AdminRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const status = searchParams.get('status') || ''

    const skip = (page - 1) * limit

    // 실제 데이터베이스에서 신고 목록 조회
    const whereClause: any = {}
    if (status) {
      whereClause.status = status
    }

    const reports = await db.report.findMany({
      where: whereClause,
      include: {
        url: {
          select: {
            id: true,
            originalUrl: true,
            shortCode: true,
            customCode: true,
            title: true
          }
        },
        reporter: {
          select: {
            id: true,
            email: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit
    })

    // 전체 신고 수 조회
    const totalCount = await db.report.count({ where: whereClause })

    // 프론트엔드 형식에 맞게 데이터 변환
    const formattedReports = reports.map(report => ({
      id: report.id,
      short: report.url.customCode || `cutlet.ly/${report.url.shortCode}`,
      original: report.url.originalUrl,
      reporter: report.reporter.email,
      reason: report.reason,
      status: report.status,
      reported: report.createdAt.toISOString().split('T')[0],
      description: report.description,
      adminNotes: report.adminNotes
    }))

    return NextResponse.json({
      reports: formattedReports,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit)
      }
    })
  } catch (error) {
    console.error('신고 목록 조회 실패:', error)
    return NextResponse.json(
      { error: 'INTERNAL_SERVER_ERROR', message: '신고 목록 조회에 실패했습니다.' },
      { status: 500 }
    )
  }
}

export const GET = requireAdminHandler(handler)
export const PATCH = requireAdminHandler(async (request: AdminRequest) => {
  try {
    const { searchParams } = new URL(request.url)
    const reportId = searchParams.get('id')
    const action = searchParams.get('action')
    const adminNotes = searchParams.get('notes')

    if (!reportId || !action) {
      return NextResponse.json(
        { error: 'MISSING_PARAMETERS', message: '필수 파라미터가 누락되었습니다.' },
        { status: 400 }
      )
    }

    // 신고 존재 확인
    const report = await db.report.findUnique({
      where: { id: reportId }
    })

    if (!report) {
      return NextResponse.json(
        { error: 'REPORT_NOT_FOUND', message: '신고를 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    let updateData: any = {}
    let message = ''

    switch (action) {
      case 'review':
        updateData = { 
          status: 'reviewed',
          adminNotes: adminNotes || '검토 완료'
        }
        message = '신고가 검토 상태로 변경되었습니다.'
        break
        
      case 'resolve':
        updateData = { 
          status: 'resolved',
          adminNotes: adminNotes || '해결 완료'
        }
        message = '신고가 해결 상태로 변경되었습니다.'
        break
        
      case 'dismiss':
        updateData = { 
          status: 'dismissed',
          adminNotes: adminNotes || '기각됨'
        }
        message = '신고가 기각되었습니다.'
        break
        
      default:
        return NextResponse.json(
          { error: 'INVALID_ACTION', message: '유효하지 않은 액션입니다.' },
          { status: 400 }
        )
    }

    // 신고 상태 업데이트
    await db.report.update({
      where: { id: reportId },
      data: updateData
    })

    return NextResponse.json({
      success: true,
      message
    })

  } catch (error) {
    console.error('신고 상태 변경 실패:', error)
    return NextResponse.json(
      { error: 'INTERNAL_SERVER_ERROR', message: '신고 상태 변경에 실패했습니다.' },
      { status: 500 }
    )
  }
})
