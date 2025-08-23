"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { 
  Activity, 
  Users, 
  Link, 
  BarChart3, 
  Database, 
  Server, 
  TrendingUp, 
  TrendingDown,
  Clock,
  Cpu,
  HardDrive,
  Network,
  RefreshCw,
  AlertCircle,
  CheckCircle
} from "lucide-react"

interface MonitoringData {
  system: {
    platform: string
    arch: string
    nodeVersion: string
    uptime: number
    hostname: string
    cpus: number
    totalMemory: number
    freeMemory: number
  }
  users: {
    total: number
    active: number
    premium: number
  }
  urls: {
    total: number
    active: number
    expired: number
  }
  analytics: {
    totalClicks: number
    todayClicks: number
    weeklyGrowth: number
  }
  rateLimiting: {
    activeConnections: number
    rateLimitConfigs: any
  }
  uptime: number
  memory: {
    rss: number
    heapTotal: number
    heapUsed: number
    external: number
  }
  timestamp: string
}

interface PerformanceData {
  performance: {
    databaseResponseTime: number
    apiResponseTime: number
    totalResponseTime: number
  }
  system: {
    cpuUsage: number[]
    memoryUsage: {
      total: number
      free: number
      used: number
      percentage: number
    }
    uptime: number
  }
  timestamp: string
}

interface DatabaseData {
  tables: {
    users: number
    shortenedUrls: number
    urlClicks: number
    tags: number
    favorites: number
    notifications: number
  }
  tableSizes: Record<string, string>
  totalRecords: number
  timestamp: string
}

export function MonitoringDashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'performance' | 'database' | 'users' | 'urls' | 'analytics'>('overview')
  const [overviewData, setOverviewData] = useState<MonitoringData | null>(null)
  const [performanceData, setPerformanceData] = useState<PerformanceData | null>(null)
  const [databaseData, setDatabaseData] = useState<DatabaseData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  // 모니터링 데이터 로드
  const loadMonitoringData = async (type: string) => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/admin/monitoring?type=${type}`, {
        credentials: 'include'
      })

      if (response.ok) {
        const result = await response.json()
        
        switch (type) {
          case 'overview':
            setOverviewData(result.data)
            break
          case 'performance':
            setPerformanceData(result.data)
            break
          case 'database':
            setDatabaseData(result.data)
            break
        }
        
        setLastUpdated(new Date())
      }
    } catch (error) {
      console.error('모니터링 데이터 로드 오류:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // 탭 변경 시 데이터 로드
  useEffect(() => {
    loadMonitoringData(activeTab)
  }, [activeTab])

  // 자동 새로고침 (30초마다)
  useEffect(() => {
    const interval = setInterval(() => {
      loadMonitoringData(activeTab)
    }, 30000)

    return () => clearInterval(interval)
  }, [activeTab])

  // 시간 포맷팅
  const formatUptime = (seconds: number): string => {
    const days = Math.floor(seconds / 86400)
    const hours = Math.floor((seconds % 86400) / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    
    if (days > 0) return `${days}일 ${hours}시간`
    if (hours > 0) return `${hours}시간 ${minutes}분`
    return `${minutes}분`
  }

  // 메모리 크기 포맷팅
  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  // 성장률 표시
  const renderGrowthRate = (rate: number) => {
    const isPositive = rate >= 0
    const Icon = isPositive ? TrendingUp : TrendingDown
    const color = isPositive ? 'text-green-600' : 'text-red-600'
    
    return (
      <div className={`flex items-center gap-1 ${color}`}>
        <Icon className="w-4 h-4" />
        <span className="font-medium">{Math.abs(rate).toFixed(1)}%</span>
      </div>
    )
  }

  // 시스템 상태 표시
  const getSystemStatus = () => {
    if (!overviewData) return 'unknown'
    
    const memoryUsage = (overviewData.memory.heapUsed / overviewData.memory.heapTotal) * 100
    const uptimeHours = overviewData.uptime / 3600
    
    if (memoryUsage > 90 || uptimeHours < 1) return 'critical'
    if (memoryUsage > 70 || uptimeHours < 24) return 'warning'
    return 'healthy'
  }

  const systemStatus = getSystemStatus()
  const statusInfo = {
    healthy: { color: 'text-green-600', bgColor: 'bg-green-50 dark:bg-green-950/20', icon: CheckCircle, text: '정상' },
    warning: { color: 'text-orange-600', bgColor: 'bg-orange-50 dark:bg-orange-950/20', icon: AlertCircle, text: '주의' },
    critical: { color: 'text-red-600', bgColor: 'bg-red-50 dark:bg-red-950/20', icon: AlertCircle, text: '위험' },
    unknown: { color: 'text-gray-600', bgColor: 'bg-gray-50 dark:bg-gray-950/20', icon: AlertCircle, text: '알 수 없음' }
  }

  const currentStatus = statusInfo[systemStatus as keyof typeof statusInfo]

  return (
    <div className="space-y-6">
      {/* 탭 네비게이션 */}
      <div className="flex flex-wrap gap-2">
        {[
          { key: 'overview', label: '시스템 개요', icon: Activity },
          { key: 'performance', label: '성능 메트릭', icon: Server },
          { key: 'database', label: '데이터베이스', icon: Database },
          { key: 'users', label: '사용자 통계', icon: Users },
          { key: 'urls', label: 'URL 통계', icon: Link },
          { key: 'analytics', label: '분석 통계', icon: BarChart3 }
        ].map(({ key, label, icon: Icon }) => (
          <Button
            key={key}
            variant={activeTab === key ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTab(key as any)}
            className="flex items-center gap-2"
          >
            <Icon className="w-4 h-4" />
            {label}
          </Button>
        ))}
      </div>

      {/* 새로고침 버튼 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`flex items-center gap-2 p-2 rounded-lg ${currentStatus.bgColor}`}>
            <currentStatus.icon className={`w-5 h-5 ${currentStatus.color}`} />
            <span className={`text-sm font-medium ${currentStatus.color}`}>
              시스템 상태: {currentStatus.text}
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          {lastUpdated && (
            <span>마지막 업데이트: {lastUpdated.toLocaleTimeString()}</span>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => loadMonitoringData(activeTab)}
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            새로고침
          </Button>
        </div>
      </div>

      {/* 탭별 콘텐츠 */}
      {activeTab === 'overview' && overviewData && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* 시스템 정보 */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Server className="w-4 h-4" />
                시스템 정보
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">플랫폼:</span>
                <span>{overviewData.system.platform}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">아키텍처:</span>
                <span>{overviewData.system.arch}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Node.js:</span>
                <span>{overviewData.system.nodeVersion}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">CPU 코어:</span>
                <span>{overviewData.system.cpus}개</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">호스트명:</span>
                <span>{overviewData.system.hostname}</span>
              </div>
            </CardContent>
          </Card>

          {/* 사용자 통계 */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Users className="w-4 h-4" />
                사용자 통계
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-center">
                <div className="text-2xl font-bold">{overviewData.users.total.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">총 사용자</div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="text-center">
                  <div className="font-medium">{overviewData.users.active.toLocaleString()}</div>
                  <div className="text-xs text-muted-foreground">활성</div>
                </div>
                <div className="text-center">
                  <div className="font-medium">{overviewData.users.premium.toLocaleString()}</div>
                  <div className="text-xs text-muted-foreground">프리미엄</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* URL 통계 */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Link className="w-4 h-4" />
                URL 통계
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-center">
                <div className="text-2xl font-bold">{overviewData.urls.total.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">총 URL</div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="text-center">
                  <div className="font-medium">{overviewData.urls.active.toLocaleString()}</div>
                  <div className="text-xs text-muted-foreground">활성</div>
                </div>
                <div className="text-center">
                  <div className="font-medium">{overviewData.urls.expired.toLocaleString()}</div>
                  <div className="text-xs text-muted-foreground">만료</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 분석 통계 */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm">
                <BarChart3 className="w-4 h-4" />
                분석 통계
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-center">
                <div className="text-2xl font-bold">{overviewData.analytics.totalClicks.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">총 클릭</div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="text-center">
                  <div className="font-medium">{overviewData.analytics.todayClicks.toLocaleString()}</div>
                  <div className="text-xs text-muted-foreground">오늘</div>
                </div>
                <div className="text-center">
                  {renderGrowthRate(overviewData.analytics.weeklyGrowth)}
                  <div className="text-xs text-muted-foreground">주간 성장</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'performance' && performanceData && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 성능 메트릭 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                성능 메트릭
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>데이터베이스 응답 시간</span>
                  <span className="font-medium">{performanceData.performance.databaseResponseTime}ms</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>API 응답 시간</span>
                  <span className="font-medium">{performanceData.performance.apiResponseTime}ms</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>총 응답 시간</span>
                  <span className="font-medium">{performanceData.performance.totalResponseTime}ms</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 시스템 리소스 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Server className="w-5 h-5" />
                시스템 리소스
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>메모리 사용률</span>
                    <span>{performanceData.system.memoryUsage.percentage.toFixed(1)}%</span>
                  </div>
                  <Progress value={performanceData.system.memoryUsage.percentage} className="h-2" />
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">총 메모리:</span>
                    <div className="font-medium">{formatBytes(performanceData.system.memoryUsage.total)}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">사용 중:</span>
                    <div className="font-medium">{formatBytes(performanceData.system.memoryUsage.used)}</div>
                  </div>
                </div>
                <div className="text-sm">
                  <span className="text-muted-foreground">시스템 가동 시간:</span>
                  <div className="font-medium">{formatUptime(performanceData.system.uptime)}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'database' && databaseData && (
        <div className="space-y-6">
          {/* 테이블 통계 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5" />
                테이블 통계
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {Object.entries(databaseData.tables).map(([table, count]) => (
                  <div key={table} className="text-center p-3 bg-muted/50 rounded-lg">
                    <div className="text-lg font-bold">{count.toLocaleString()}</div>
                    <div className="text-sm text-muted-foreground capitalize">
                      {table.replace(/([A-Z])/g, ' $1').trim()}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 text-center">
                <div className="text-2xl font-bold">{databaseData.totalRecords.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">총 레코드 수</div>
              </div>
            </CardContent>
          </Card>

          {/* 테이블 크기 */}
          {databaseData.tableSizes && Object.keys(databaseData.tableSizes).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HardDrive className="w-5 h-5" />
                  테이블 크기
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(databaseData.tableSizes).map(([table, size]) => (
                    <div key={table} className="flex justify-between items-center p-2 bg-muted/30 rounded">
                      <span className="font-medium capitalize">
                        {table.replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                      <Badge variant="secondary">{size}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* 로딩 상태 */}
      {isLoading && (
        <div className="text-center py-8">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2" />
          <p className="text-muted-foreground">모니터링 데이터를 불러오는 중...</p>
        </div>
      )}
    </div>
  )
}
