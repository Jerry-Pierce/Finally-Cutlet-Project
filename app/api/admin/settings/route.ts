import { NextRequest, NextResponse } from 'next/server'
import { requireAdminHandler, AdminRequest } from '@/lib/admin-middleware'
import { db } from '@/lib/database'

async function handler(request: AdminRequest) {
  try {
    if (request.method === 'GET') {
      // 데이터베이스에서 시스템 설정 조회
      const settings = await db.systemSetting.findMany({
        orderBy: { category: 'asc' }
      })

      // 설정을 객체로 변환
      const systemSettings: any = {}
      settings.forEach(setting => {
        try {
          systemSettings[setting.key] = JSON.parse(setting.value)
        } catch {
          systemSettings[setting.key] = setting.value
        }
      })

      // 기본값 설정 (데이터베이스에 없으면 기본값 사용)
      const defaultSettings = {
        maintenance: false,
        allowRegistration: true,
        analytics: true,
        rateLimit: 100,
        require2FA: false,
        autoScan: true,
        sessionTimeout: 60,
        backupFrequency: 'daily'
      }

      const finalSettings = { ...defaultSettings, ...systemSettings }

      return NextResponse.json({
        settings: finalSettings
      })
    } else if (request.method === 'PATCH') {
      // 시스템 설정 업데이트
      const body = await request.json()
      const userId = request.user.id

      // 각 설정을 데이터베이스에 저장
      for (const [key, value] of Object.entries(body)) {
        await db.systemSetting.upsert({
          where: { key },
          update: {
            value: JSON.stringify(value),
            updatedBy: userId,
            updatedAt: new Date()
          },
          create: {
            key,
            value: JSON.stringify(value),
            description: getSettingDescription(key),
            category: getSettingCategory(key),
            updatedBy: userId
          }
        })
      }

      // 업데이트된 설정 반환
      const updatedSettings = await db.systemSetting.findMany({
        orderBy: { category: 'asc' }
      })

      const systemSettings: any = {}
      updatedSettings.forEach(setting => {
        try {
          systemSettings[setting.key] = JSON.parse(setting.value)
        } catch {
          systemSettings[setting.key] = setting.value
        }
      })

      return NextResponse.json({
        success: true,
        message: '시스템 설정이 업데이트되었습니다.',
        settings: systemSettings
      })
    } else {
      return NextResponse.json(
        { error: 'METHOD_NOT_ALLOWED', message: '지원하지 않는 HTTP 메서드입니다.' },
        { status: 405 }
      )
    }
  } catch (error) {
    console.error('시스템 설정 관리 실패:', error)
    return NextResponse.json(
      { error: 'INTERNAL_SERVER_ERROR', message: '시스템 설정 관리에 실패했습니다.' },
      { status: 500 }
    )
  }
}

// 설정 설명 반환 함수
function getSettingDescription(key: string): string {
  const descriptions: { [key: string]: string } = {
    maintenance: '시스템 유지보수 모드',
    allowRegistration: '사용자 등록 허용',
    analytics: '분석 데이터 수집',
    rateLimit: 'API 요청 제한',
    require2FA: '2단계 인증 필수',
    autoScan: '자동 보안 스캔',
    sessionTimeout: '세션 타임아웃 (분)',
    backupFrequency: '백업 빈도'
  }
  return descriptions[key] || '시스템 설정'
}

// 설정 카테고리 반환 함수
function getSettingCategory(key: string): string {
  const categories: { [key: string]: string } = {
    maintenance: 'system',
    allowRegistration: 'security',
    analytics: 'performance',
    rateLimit: 'security',
    require2FA: 'security',
    autoScan: 'security',
    sessionTimeout: 'security',
    backupFrequency: 'system'
  }
  return categories[key] || 'system'
}

export const GET = requireAdminHandler(handler)
export const PATCH = requireAdminHandler(handler)
