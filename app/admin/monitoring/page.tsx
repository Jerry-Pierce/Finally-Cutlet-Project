"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { RefreshCw, Database, Users, Activity, Server, AlertTriangle } from "lucide-react"

interface SystemStatus {
  status: string
  uptime: number
  environment: string
  version: string
  checks: {
    database: {
      status: string
      responseTime: number
    }
    redis: {
      status: string
      responseTime: number
    }
    system: {
      status: string
      memory: {
        usage: number
      }
      cpu: {
        usage: number
      }
    }
  }
}

interface PerformanceMetrics {
  totalUsers: number
  totalUrls: number
  totalClicks: number
  activeUsers: number
  newUsersToday: number
  newUrlsToday: number
}

interface UserActivity {
  recentLogins: number
  recentRegistrations: number
  premiumUsers: number
  averageSessionTime: number
}

export default function MonitoringPage() {
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null)
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetrics | null>(null)
  const [userActivity, setUserActivity] = useState<UserActivity | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())

  const fetchSystemStatus = async () => {
    try {
      const response = await fetch('/api/health')
      if (response.ok) {
        const data = await response.json()
        setSystemStatus(data)
      }
    } catch (error) {
      console.error('시스템 상태 조회 실패:', error)
    }
  }

  const fetchPerformanceMetrics = async () => {
    try {
      const response = await fetch('/api/public/stats')
      if (response.ok) {
        const data = await response.json()
        setPerformanceMetrics({
          totalUsers: data.totalUsers || 0,
          totalUrls: data.totalUrls || 0,
          totalClicks: data.totalClicks || 0,
          activeUsers: data.activeUsers || 0,
          newUsersToday: data.newUsersToday || 0,
          newUrlsToday: data.newUrlsToday || 0
        })
      }
    } catch (error) {
      console.error('성능 지표 조회 실패:', error)
    }
  }

  const fetchUserActivity = async () => {
    try {
      // 실제 API가 구현되면 여기서 데이터를 가져옵니다
      // 현재는 더미 데이터로 표시
      setUserActivity({
        recentLogins: 15,
        recentRegistrations: 8,
        premiumUsers: 23,
        averageSessionTime: 12.5
      })
    } catch (error) {
      console.error('사용자 활동 조회 실패:', error)
    }
  }

  const refreshAllData = async () => {
    setIsLoading(true)
    await Promise.all([
      fetchSystemStatus(),
      fetchPerformanceMetrics(),
      fetchUserActivity()
    ])
    setIsLoading(false)
    setLastUpdated(new Date())
  }

  useEffect(() => {
    refreshAllData()
    
    // 30초마다 자동 새로고침
    const interval = setInterval(refreshAllData, 30000)
    return () => clearInterval(interval)
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'bg-green-500'
      case 'degraded': return 'bg-yellow-500'
      case 'unhealthy': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'healthy': return '정상'
      case 'degraded': return '성능 저하'
      case 'unhealthy': return '오류'
      default: return '알 수 없음'
    }
  }

  if (isLoading && !systemStatus) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* 헤더 */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold">시스템 모니터링</h1>
            <p className="text-muted-foreground">
              실시간 시스템 상태를 모니터링할 수 있습니다.
            </p>
          </div>
          <Button onClick={refreshAllData} disabled={isLoading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            새로고침
          </Button>
        </div>

        {/* 마지막 업데이트 */}
        <div className="text-sm text-muted-foreground">
          마지막 업데이트: {lastUpdated.toLocaleString('ko-KR')}
        </div>

        {/* 시스템 상태 카드 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="w-5 h-5" />
              시스템 상태
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {systemStatus && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">전체 상태</span>
                    <Badge className={getStatusColor(systemStatus.status)}>
                      {getStatusText(systemStatus.status)}
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    업타임: {Math.floor(systemStatus.uptime / 1000)}초
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">데이터베이스</span>
                    <Badge className={getStatusColor(systemStatus.checks.database.status)}>
                      {getStatusText(systemStatus.checks.database.status)}
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    응답시간: {systemStatus.checks.database.responseTime}ms
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Redis</span>
                    <Badge className={getStatusColor(systemStatus.checks.redis.status)}>
                      {getStatusText(systemStatus.checks.redis.status)}
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    응답시간: {systemStatus.checks.redis.responseTime}ms
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 성능 지표 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              성능 지표
            </CardTitle>
          </CardHeader>
          <CardContent>
            {performanceMetrics && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <div className="text-2xl font-bold">{performanceMetrics.totalUsers}</div>
                  <div className="text-sm text-muted-foreground">총 사용자</div>
                </div>
                <div className="space-y-2">
                  <div className="text-2xl font-bold">{performanceMetrics.totalUrls}</div>
                  <div className="text-sm text-muted-foreground">총 URL</div>
                </div>
                <div className="space-y-2">
                  <div className="text-2xl font-bold">{performanceMetrics.totalClicks}</div>
                  <div className="text-sm text-muted-foreground">총 클릭</div>
                </div>
                <div className="space-y-2">
                  <div className="text-2xl font-bold">{performanceMetrics.newUsersToday}</div>
                  <div className="text-sm text-muted-foreground">오늘 신규 사용자</div>
                </div>
                <div className="space-y-2">
                  <div className="text-2xl font-bold">{performanceMetrics.newUrlsToday}</div>
                  <div className="text-sm text-muted-foreground">오늘 신규 URL</div>
                </div>
                <div className="space-y-2">
                  <div className="text-2xl font-bold">{performanceMetrics.activeUsers}</div>
                  <div className="text-sm text-muted-foreground">활성 사용자</div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 상세 모니터링 탭 */}
        <Tabs defaultValue="system" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="system">시스템 리소스</TabsTrigger>
            <TabsTrigger value="users">사용자 활동</TabsTrigger>
            <TabsTrigger value="alerts">알림</TabsTrigger>
          </TabsList>
          
          <TabsContent value="system" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>시스템 리소스 사용량</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {systemStatus && (
                  <>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">메모리 사용률</span>
                        <span className="text-sm text-muted-foreground">
                          {systemStatus.checks.system.memory.usage.toFixed(1)}%
                        </span>
                      </div>
                      <Progress value={systemStatus.checks.system.memory.usage} />
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">CPU 사용률</span>
                        <span className="text-sm text-muted-foreground">
                          {systemStatus.checks.system.cpu.usage.toFixed(1)}%
                        </span>
                      </div>
                      <Progress value={systemStatus.checks.system.cpu.usage} />
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="users" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>사용자 활동 현황</CardTitle>
              </CardHeader>
              <CardContent>
                {userActivity && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="text-lg font-semibold">{userActivity.recentLogins}</div>
                      <div className="text-sm text-muted-foreground">최근 로그인</div>
                    </div>
                    <div className="space-y-2">
                      <div className="text-lg font-semibold">{userActivity.recentRegistrations}</div>
                      <div className="text-sm text-muted-foreground">최근 가입</div>
                    </div>
                    <div className="space-y-2">
                      <div className="text-lg font-semibold">{userActivity.premiumUsers}</div>
                      <div className="text-sm text-muted-foreground">프리미엄 사용자</div>
                    </div>
                    <div className="space-y-2">
                      <div className="text-lg font-semibold">{userActivity.averageSessionTime}분</div>
                      <div className="text-sm text-muted-foreground">평균 세션 시간</div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="alerts" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-yellow-500" />
                  시스템 알림
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {systemStatus && systemStatus.status === 'healthy' ? (
                    <div className="flex items-center gap-2 text-green-600">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm">모든 시스템이 정상 작동 중입니다.</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-yellow-600">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                      <span className="text-sm">일부 시스템에 성능 저하가 감지되었습니다.</span>
                    </div>
                  )}
                  
                  {systemStatus && systemStatus.checks.database.status === 'unhealthy' && (
                    <div className="flex items-center gap-2 text-red-600">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      <span className="text-sm">데이터베이스 연결에 문제가 있습니다.</span>
                    </div>
                  )}
                  
                  {systemStatus && systemStatus.checks.redis.status === 'unhealthy' && (
                    <div className="flex items-center gap-2 text-red-600">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      <span className="text-sm">Redis 연결에 문제가 있습니다.</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
