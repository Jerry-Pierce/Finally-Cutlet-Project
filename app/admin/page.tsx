"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts"
import {
  Users,
  Link,
  Server,
  Shield,
  AlertTriangle,
  TrendingUp,
  Activity,
  Settings,
  UserCheck,
  UserX,
  Ban,
  CheckCircle,
  XCircle,
  Search,
  Filter,
  Download,
  RefreshCw,
  Crown,
  Mail,
  ExternalLink,
  Trash2,
  Edit,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"

export default function AdminPage() {
  const { user } = useAuth()
  const router = useRouter()
  
  // 모든 Hook을 먼저 호출 (React 규칙 준수)
  const [activeTab, setActiveTab] = useState("overview")
  const [searchTerm, setSearchTerm] = useState("")
  const { toast } = useToast()
  
  // 상태 관리
  const [overviewData, setOverviewData] = useState<any>(null)
  const [users, setUsers] = useState<any[]>([])
  const [links, setLinks] = useState<any[]>([])
  const [reports, setReports] = useState<any[]>([])
  const [settings, setSettings] = useState<any>({
    maintenance: false,
    allowRegistration: true,
    analytics: true,
    rateLimit: 100,
    require2FA: false,
    autoScan: true,
    sessionTimeout: 60,
    backupFrequency: 'daily'
  })
  const [loading, setLoading] = useState(false)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  })
  
  // 각 탭별 개별 로딩 상태
  const [tabLoading, setTabLoading] = useState({
    overview: false,
    users: false,
    links: false,
    reports: false,
    settings: false
  })
  
  // 관리자 계정이 아닌 경우 접근 차단
  useEffect(() => {
    if (user && user.email !== 'cutlet.service@gmail.com') {
      router.push('/')
    }
  }, [user, router])



  // API 호출 함수들
  const fetchOverviewData = async () => {
    try {
      setTabLoading(prev => ({ ...prev, overview: true }))
      const response = await fetch('/api/admin/overview')
      if (response.ok) {
        const data = await response.json()
        setOverviewData(data)
      } else {
        toast({
          title: "오류 발생",
          description: "개요 데이터를 불러오는데 실패했습니다.",
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "오류 발생",
        description: "네트워크 오류가 발생했습니다.",
        variant: "destructive"
      })
    } finally {
      setTabLoading(prev => ({ ...prev, overview: false }))
    }
  }

  const fetchUsers = async (page = 1, search = '') => {
    try {
      setTabLoading(prev => ({ ...prev, users: true }))
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        ...(search && { search })
      })
      
      const response = await fetch(`/api/admin/users?${params}`)
      if (response.ok) {
        const data = await response.json()
        setUsers(data.users)
        setPagination(data.pagination)
      } else {
        toast({
          title: "오류 발생",
          description: "사용자 목록을 불러오는데 실패했습니다.",
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "오류 발생",
        description: "네트워크 오류가 발생했습니다.",
        variant: "destructive"
      })
    } finally {
      setTabLoading(prev => ({ ...prev, users: false }))
    }
  }

  const fetchLinks = async (page = 1, search = '') => {
    try {
      setTabLoading(prev => ({ ...prev, links: true }))
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        ...(search && { search })
      })
      
      const response = await fetch(`/api/admin/links?${params}`)
      if (response.ok) {
        const data = await response.json()
        setLinks(data.links)
        setPagination(data.pagination)
      } else {
        toast({
          title: "오류 발생",
          description: "링크 목록을 불러오는데 실패했습니다.",
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "오류 발생",
        description: "네트워크 오류가 발생했습니다.",
        variant: "destructive"
      })
    } finally {
      setTabLoading(prev => ({ ...prev, links: false }))
    }
  }

  const fetchReports = async (page = 1) => {
    try {
      setTabLoading(prev => ({ ...prev, reports: true }))
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10'
      })
      
      const response = await fetch(`/api/admin/reports?${params}`)
      if (response.ok) {
        const data = await response.json()
        setReports(data.reports || []) // 빈 배열로 기본값 설정
        setPagination(data.pagination)
      } else {
        toast({
          title: "오류 발생",
          description: "신고 목록을 불러오는데 실패했습니다.",
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "오류 발생",
        description: "네트워크 오류가 발생했습니다.",
        variant: "destructive"
      })
    } finally {
      setTabLoading(prev => ({ ...prev, reports: false }))
    }
  }

  const fetchSettings = async () => {
    try {
      setTabLoading(prev => ({ ...prev, settings: true }))
      const response = await fetch('/api/admin/settings')
      if (response.ok) {
        const data = await response.json()
        console.log('설정 데이터 로드:', data.settings) // 디버깅 로그
        
        // 기본값과 병합하여 설정
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
        
        const mergedSettings = { ...defaultSettings, ...data.settings }
        console.log('병합된 설정:', mergedSettings) // 디버깅 로그
        setSettings(mergedSettings)
      } else {
        toast({
          title: "오류 발생",
          description: "설정을 불러오는데 실패했습니다.",
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "오류 발생",
        description: "네트워크 오류가 발생했습니다.",
        variant: "destructive"
      })
    } finally {
      setTabLoading(prev => ({ ...prev, settings: false }))
    }
  }

  // 사용자 액션 처리
  const handleUserAction = async (action: string, userId: string) => {
    try {
      // action 파라미터를 올바르게 인코딩
      const encodedAction = encodeURIComponent(action)
      const response = await fetch(`/api/admin/users/${userId}?action=${encodedAction}`, {
        method: 'PATCH'
      })
      
      if (response.ok) {
        const data = await response.json()
        toast({
          title: "성공",
          description: data.message,
        })
        // 사용자 목록 새로고침
        fetchUsers(pagination.page, searchTerm)
      } else {
        const error = await response.json()
        toast({
          title: "오류 발생",
          description: error.message || "작업에 실패했습니다.",
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "오류 발생",
        description: "네트워크 오류가 발생했습니다.",
        variant: "destructive"
      })
    }
  }

  // 알림 생성 처리
  const handleCreateNotification = async (type: string, targetUsers: string) => {
    try {
      let message = ''
      if (type === 'welcome') {
        message = "🎉 {welcomeNotificationTitle}\n{welcomeToCutlet}\n{shortenLongUrls}\n{qrCodeAndClickAnalysis}\n{startNow} ദ്ദി ˉ͈̀꒳ˉ͈́ )✧"
      } else if (type === 'premium') {
        message = "🚀 {premiumUpdateTitle}\n{premiumUpdateScheduled}\n{workingForBetterService}\n{pleaseSupportWithDonation}"
      }

      const response = await fetch('/api/notifications/create-system', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, message, targetUsers })
      })

      if (response.ok) {
        const data = await response.json()
        toast({
          title: "알림 전송 성공",
          description: data.message,
        })
      } else {
        const error = await response.json()
        toast({
          title: "오류 발생",
          description: error.message || "알림 전송에 실패했습니다.",
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "오류 발생",
        description: "네트워크 오류가 발생했습니다.",
        variant: "destructive"
      })
    }
  }

  // 링크 액션 처리
  const handleLinkAction = async (action: string, linkId: string) => {
    try {
      const response = await fetch(`/api/admin/links/${linkId}?action=${action}`, {
        method: 'PATCH'
      })
      
      if (response.ok) {
        const data = await response.json()
        toast({
          title: "성공",
          description: data.message,
        })
        // 링크 목록 새로고침
        fetchLinks(pagination.page, searchTerm)
      } else {
        const error = await response.json()
        toast({
          title: "오류 발생",
          description: error.message || "작업에 실패했습니다.",
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "오류 발생",
        description: "네트워크 오류가 발생했습니다.",
        variant: "destructive"
      })
    }
  }

  // 설정 업데이트
  const handleSettingUpdate = async (setting: string, value: any) => {
    try {
      // 즉시 로컬 상태 업데이트 (낙관적 업데이트)
      console.log('설정 업데이트 전:', setting, value) // 디버깅 로그
      setSettings(prev => {
        const currentSettings = prev || {
          maintenance: false,
          allowRegistration: true,
          analytics: true,
          rateLimit: 100,
          require2FA: false,
          autoScan: true,
          sessionTimeout: 60,
          backupFrequency: 'daily'
        }
        const newSettings = { ...currentSettings, [setting]: value }
        console.log('새로운 설정 상태:', newSettings) // 디버깅 로그
        return newSettings
      })

      const response = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ [setting]: value })
      })
      
      if (response.ok) {
        const data = await response.json()
        toast({
          title: "성공",
          description: "설정이 업데이트되었습니다.",
        })
        // 서버에서 최신 설정 데이터 가져와서 동기화
        const updatedResponse = await fetch('/api/admin/settings')
        if (updatedResponse.ok) {
          const updatedData = await updatedResponse.json()
          setSettings(updatedData.settings)
        }
      } else {
        // 실패 시 원래 상태로 되돌리기
        const error = await response.json()
        toast({
          title: "오류 발생",
          description: error.message || "설정 업데이트에 실패했습니다.",
          variant: "destructive"
        })
        // 원래 상태로 되돌리기
        fetchSettings()
      }
    } catch (error) {
      // 네트워크 오류 시에도 원래 상태로 되돌리기
      toast({
        title: "오류 발생",
        description: "네트워크 오류가 발생했습니다.",
        variant: "destructive"
      })
      fetchSettings()
    }
  }

  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    if (user && user.email === 'cutlet.service@gmail.com') {
      fetchOverviewData()
      fetchUsers()
      fetchLinks()
      fetchReports()
      fetchSettings()
    }
  }, [user])

  // 탭 변경 시 해당 데이터 로드 (이미 로드된 데이터가 있으면 재로드하지 않음)
  useEffect(() => {
    if (user && user.email === 'cutlet.service@gmail.com') {
      const loadTabData = async () => {
        // 탭 전환 시 즉시 표시하고, 필요한 경우에만 데이터 로드
        if (activeTab === 'overview' && !overviewData) {
          fetchOverviewData()
        } else if (activeTab === 'users' && !users.length) {
          fetchUsers()
        } else if (activeTab === 'links' && !links.length) {
          fetchLinks()
        } else if (activeTab === 'reports' && reports.length === 0) {
          // 신고 데이터는 빈 배열일 때만 로드 (null 체크 대신 length 체크)
          fetchReports()
        } else if (activeTab === 'settings' && !settings) {
          fetchSettings()
        }
      }
      
      loadTabData()
    }
  }, [activeTab, user])

  // 관리자 계정이 아닌 경우 빈 화면 표시
  if (!user || user.email !== 'cutlet.service@gmail.com') {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-destructive/5 to-background relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-32 left-20 w-44 h-44 bg-destructive/10 rounded-full blur-2xl opacity-60" />
        <div className="absolute top-64 right-28 w-36 h-36 bg-primary/10 rounded-full blur-xl opacity-60" />
        <div className="absolute bottom-32 left-1/3 w-52 h-52 bg-accent/10 rounded-full blur-3xl opacity-60" />
      </div>

      <div className="container mx-auto px-4 py-8 relative z-10">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="font-serif font-bold text-3xl text-foreground flex items-center gap-3">
                <div className="w-10 h-10 bg-destructive/10 rounded-lg flex items-center justify-center shadow-lg shadow-destructive/20">
                  <Shield className="w-5 h-5 text-destructive" />
                </div>
                관리자 대시보드
              </h1>
              <p className="text-muted-foreground">시스템 전체를 모니터링하고 관리하세요</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="bg-transparent">
                <Download className="w-4 h-4 mr-2" />
                리포트 다운로드
              </Button>
              <Button 
                variant="outline" 
                className="bg-transparent"
                onClick={() => {
                  if (activeTab === 'overview') fetchOverviewData()
                  else if (activeTab === 'users') fetchUsers()
                  else if (activeTab === 'links') fetchLinks()
                  else if (activeTab === 'reports') fetchReports()
                  else if (activeTab === 'settings') fetchSettings()
                }}
                disabled={loading}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                새로고침
              </Button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <Card className="border-border/50 shadow-lg shadow-black/5 backdrop-blur-sm bg-card/95 will-change-transform hover:scale-105 transition-all duration-300">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">총 사용자</p>
                    <p className="text-2xl font-bold text-foreground">
                      {loading ? '...' : (overviewData?.stats?.totalUsers?.toLocaleString() || '0')}
                    </p>
                  </div>
                  <Users className="w-8 h-8 text-primary" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50 shadow-lg shadow-black/5 backdrop-blur-sm bg-card/95 will-change-transform hover:scale-105 transition-all duration-300">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">총 링크</p>
                    <p className="text-2xl font-bold text-foreground">
                      {loading ? '...' : (overviewData?.stats?.totalUrls?.toLocaleString() || '0')}
                    </p>
                  </div>
                  <Link className="w-8 h-8 text-accent" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50 shadow-lg shadow-black/5 backdrop-blur-sm bg-card/95 will-change-transform hover:scale-105 transition-all duration-300">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">서버 상태</p>
                    <p className="text-2xl font-bold text-green-600">
                      {loading ? '...' : (overviewData?.systemStatus?.api === 'healthy' ? '정상' : '점검')}
                    </p>
                  </div>
                  <Server className="w-8 h-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50 shadow-lg shadow-black/5 backdrop-blur-sm bg-card/95 will-change-transform hover:scale-105 transition-all duration-300">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">신고 대기</p>
                    <p className="text-2xl font-bold text-destructive">
                      {tabLoading.reports ? '...' : (reports.filter(r => r.status === 'pending').length || '0')}
                    </p>
                  </div>
                  <AlertTriangle className="w-8 h-8 text-destructive" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50 shadow-lg shadow-black/5 backdrop-blur-sm bg-card/95 will-change-transform hover:scale-105 transition-all duration-300">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">수익 (월)</p>
                    <p className="text-2xl font-bold text-foreground">
                      {loading ? '...' : '$0'}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">결제 시스템 미구현</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-secondary" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-5 bg-card/50 backdrop-blur-sm border border-border/50">
              <TabsTrigger
                value="overview"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                disabled={tabLoading.overview}
              >
                <Activity className={`w-4 h-4 mr-2 ${tabLoading.overview ? 'animate-spin' : ''}`} />
                개요
              </TabsTrigger>
              <TabsTrigger
                value="users"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                disabled={tabLoading.users}
              >
                <Users className={`w-4 h-4 mr-2 ${tabLoading.users ? 'animate-spin' : ''}`} />
                사용자
              </TabsTrigger>
              <TabsTrigger
                value="links"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                disabled={tabLoading.links}
              >
                <Link className={`w-4 h-4 mr-2 ${tabLoading.links ? 'animate-spin' : ''}`} />
                링크
              </TabsTrigger>
              <TabsTrigger
                value="reports"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                disabled={tabLoading.reports}
              >
                <AlertTriangle className={`w-4 h-4 mr-2 ${tabLoading.reports ? 'animate-spin' : ''}`} />
                신고
              </TabsTrigger>
              <TabsTrigger
                value="settings"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                disabled={tabLoading.settings}
              >
                <Settings className={`w-4 h-4 mr-2 ${tabLoading.settings ? 'animate-spin' : ''}`} />
                설정
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid lg:grid-cols-2 gap-6">
                <Card className="border-border/50 shadow-lg shadow-black/5 backdrop-blur-sm bg-card/95">
                  <CardHeader>
                    <CardTitle className="font-serif">월별 성장 추이</CardTitle>
                    <CardDescription>사용자, 링크, 클릭 수 변화</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart data={overviewData?.monthlyStats || []}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
                        <YAxis stroke="hsl(var(--muted-foreground))" />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "hsl(var(--card))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "8px",
                          }}
                        />
                        <Area
                          type="monotone"
                          dataKey="users"
                          stackId="1"
                          stroke="hsl(var(--primary))"
                          fill="hsl(var(--primary))"
                          fillOpacity={0.3}
                        />
                        <Area
                          type="monotone"
                          dataKey="links"
                          stackId="2"
                          stroke="hsl(var(--accent))"
                          fill="hsl(var(--accent))"
                          fillOpacity={0.3}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card className="border-border/50 shadow-lg shadow-black/5 backdrop-blur-sm bg-card/95">
                  <CardHeader>
                    <CardTitle className="font-serif">시스템 상태</CardTitle>
                    <CardDescription>실시간 서버 모니터링</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                        <span className="font-medium">API 서버</span>
                      </div>
                      <Badge variant="secondary" className="bg-green-500/10 text-green-600 border-green-500/20">
                        정상
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                        <span className="font-medium">데이터베이스</span>
                      </div>
                      <Badge variant="secondary" className="bg-green-500/10 text-green-600 border-green-500/20">
                        정상
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse" />
                        <span className="font-medium">캐시 서버</span>
                      </div>
                      <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20">
                        주의
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-foreground">99.9%</p>
                        <p className="text-sm text-muted-foreground">가동률</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-foreground">45ms</p>
                        <p className="text-sm text-muted-foreground">평균 응답시간</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="users" className="space-y-6">
              <Card className="border-border/50 shadow-lg shadow-black/5 backdrop-blur-sm bg-card/95">
                <CardHeader>
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <CardTitle className="font-serif">사용자 관리</CardTitle>
                      <CardDescription>등록된 사용자들을 관리하세요</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          placeholder="사용자 검색..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              fetchUsers(1, searchTerm)
                            }
                          }}
                          className="pl-10 w-64 shadow-inner shadow-black/5"
                        />
                      </div>
                      <Button variant="outline" size="sm" className="bg-transparent">
                        <Filter className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>사용자</TableHead>
                        <TableHead>플랜</TableHead>
                        <TableHead>상태</TableHead>
                        <TableHead>링크 수</TableHead>
                        <TableHead>가입일</TableHead>
                        <TableHead>마지막 활동</TableHead>
                        <TableHead className="text-right">작업</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loading ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8">
                            <div className="flex items-center justify-center">
                              <RefreshCw className="w-6 h-6 animate-spin mr-2" />
                              데이터를 불러오는 중...
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : users.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                            사용자가 없습니다.
                          </TableCell>
                        </TableRow>
                      ) : (
                        users.map((user) => (
                          <TableRow key={user.id} className="hover:bg-muted/50 transition-colors">
                            <TableCell>
                              <div>
                                <p className="font-medium">{user.email}</p>
                                {user.username && (
                                  <p className="text-sm text-muted-foreground">@{user.username}</p>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={user.plan === "premium" ? "default" : "secondary"}
                                className={
                                  user.plan === "premium"
                                    ? "bg-accent/10 text-accent border-accent/20"
                                    : "bg-muted text-muted-foreground"
                                }
                              >
                                {user.plan === "premium" && <Crown className="w-3 h-3 mr-1" />}
                                {user.plan === "premium" ? "프리미엄" : "무료"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={user.status === "active" ? "default" : "destructive"}
                                className={
                                  user.status === "active"
                                    ? "bg-green-500/10 text-green-600 border-green-500/20"
                                    : "bg-destructive/10 text-destructive border-destructive/20"
                                }
                              >
                                {user.status === "active" ? (
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                ) : (
                                  <XCircle className="w-3 h-3 mr-1" />
                                )}
                                {user.status === "active" ? "활성" : user.status === "suspended" ? "정지" : "대기"}
                              </Badge>
                            </TableCell>
                            <TableCell>{user.urlCount}</TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {new Date(user.createdAt).toLocaleDateString('ko-KR')}
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {user.lastLogin 
                                ? new Date(user.lastLogin).toLocaleDateString('ko-KR')
                                : '활동 없음'
                              }
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex gap-1 justify-end">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleUserAction("이메일 발송", user.id)}
                                  className="will-change-transform hover:scale-110"
                                >
                                  <Mail className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleUserAction(user.status === "active" ? "suspend" : "activate", user.id)}
                                  className="will-change-transform hover:scale-110"
                                >
                                  {user.status === "active" ? (
                                    <UserX className="w-4 h-4" />
                                  ) : (
                                    <UserCheck className="w-4 h-4" />
                                  )}
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="links" className="space-y-6">
              <Card className="border-border/50 shadow-lg shadow-black/5 backdrop-blur-sm bg-card/95">
                <CardHeader>
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <CardTitle className="font-serif">링크 관리</CardTitle>
                      <CardDescription>생성된 모든 링크를 관리하세요</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          placeholder="링크 검색..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              fetchLinks(1, searchTerm)
                            }
                          }}
                          className="pl-10 w-64 shadow-inner shadow-black/5"
                        />
                      </div>
                      <Button variant="outline" size="sm" className="bg-transparent">
                        <Filter className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>단축 URL</TableHead>
                        <TableHead>원본 URL</TableHead>
                        <TableHead>생성자</TableHead>
                        <TableHead>태그</TableHead>
                        <TableHead>클릭 수</TableHead>
                        <TableHead>생성일</TableHead>
                        <TableHead>만료일</TableHead>
                        <TableHead className="text-right">작업</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loading ? (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center py-8">
                            <div className="flex items-center justify-center">
                              <RefreshCw className="w-6 h-6 animate-spin mr-2" />
                              데이터를 불러오는 중...
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : links.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                            생성된 링크가 없습니다.
                          </TableCell>
                        </TableRow>
                      ) : (
                        links.map((link) => (
                          <TableRow key={link.id} className="hover:bg-muted/50 transition-colors">
                            <TableCell>
                              <code className="text-sm bg-muted px-2 py-1 rounded">{link.short}</code>
                            </TableCell>
                            <TableCell className="max-w-xs">
                              <span className="truncate block" title={link.original}>
                                {link.original}
                              </span>
                            </TableCell>
                            <TableCell className="text-sm">{link.user}</TableCell>
                            <TableCell>
                              <div className="flex flex-wrap gap-1">
                                {link.title && link.title !== '제목 없음' ? (
                                  <Badge variant="outline" className="text-xs">
                                    {link.title}
                                  </Badge>
                                ) : (
                                  <span className="text-muted-foreground text-xs">-</span>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>{link.clicks}</TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {new Date(link.createdAt).toLocaleDateString('ko-KR')}
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {link.expiresAt 
                                ? new Date(link.expiresAt).toLocaleDateString('ko-KR')
                                : '만료 없음'
                              }
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex gap-1 justify-end">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => window.open(`https://${link.short}`, '_blank')}
                                  className="will-change-transform hover:scale-110"
                                >
                                  <ExternalLink className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleLinkAction("삭제", link.id)}
                                  className="will-change-transform hover:scale-110 text-red-500 hover:text-red-600"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="reports" className="space-y-6">
              <Card className="border-border/50 shadow-lg shadow-black/5 backdrop-blur-sm bg-card/95">
                <CardHeader>
                  <CardTitle className="font-serif">신고된 링크</CardTitle>
                  <CardDescription>사용자가 신고한 링크들을 검토하고 처리하세요</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>단축 URL</TableHead>
                        <TableHead>원본 URL</TableHead>
                        <TableHead>신고자</TableHead>
                        <TableHead>신고 사유</TableHead>
                        <TableHead>상태</TableHead>
                        <TableHead>신고일</TableHead>
                        <TableHead className="text-right">작업</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loading ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8">
                            <div className="flex items-center justify-center">
                              <RefreshCw className="w-6 h-6 animate-spin mr-2" />
                              데이터를 불러오는 중...
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : reports.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                            신고된 링크가 없습니다.
                          </TableCell>
                        </TableRow>
                      ) : (
                        reports.map((link) => (
                          <TableRow key={link.id} className="hover:bg-muted/50 transition-colors">
                            <TableCell>
                              <code className="text-sm bg-muted px-2 py-1 rounded">{link.short}</code>
                            </TableCell>
                            <TableCell className="max-w-xs">
                              <span className="truncate block" title={link.original}>
                                {link.original}
                              </span>
                            </TableCell>
                            <TableCell className="text-sm">{link.reporter}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className="text-xs">
                                {link.reason}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={link.status === "pending" ? "destructive" : "default"}
                                className={
                                  link.status === "pending"
                                    ? "bg-yellow-500/10 text-yellow-600 border-yellow-500/20"
                                    : "bg-green-500/10 text-green-600 border-green-500/20"
                                }
                              >
                                {link.status === "pending" ? "대기중" : "처리완료"}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">{link.reported}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex gap-1 justify-end">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleLinkAction("승인", link.id)}
                                  className="will-change-transform hover:scale-110"
                                >
                                  <CheckCircle className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleLinkAction("차단", link.id)}
                                  className="will-change-transform hover:scale-110"
                                >
                                  <Ban className="w-4 h-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="settings" className="space-y-6">
              <div className="grid lg:grid-cols-2 gap-6">
                <Card className="border-border/50 shadow-lg shadow-black/5 backdrop-blur-sm bg-card/95">
                  <CardHeader>
                    <CardTitle className="font-serif">시스템 설정</CardTitle>
                    <CardDescription>전체 시스템 동작을 제어합니다</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="maintenance">유지보수 모드</Label>
                        <p className="text-sm text-muted-foreground">시스템을 일시적으로 중단합니다</p>
                      </div>
                      <Switch 
                        id="maintenance" 
                        checked={settings?.maintenance ?? false}
                        onCheckedChange={(checked) => handleSettingUpdate('maintenance', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="registration">신규 가입 허용</Label>
                        <p className="text-sm text-muted-foreground">새로운 사용자 등록을 허용합니다</p>
                      </div>
                      <Switch 
                        id="registration" 
                        checked={settings?.allowRegistration ?? true}
                        onCheckedChange={(checked) => handleSettingUpdate('allowRegistration', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="analytics">분석 데이터 수집</Label>
                        <p className="text-sm text-muted-foreground">사용자 행동 분석을 위한 데이터를 수집합니다</p>
                      </div>
                      <Switch 
                        id="analytics" 
                        checked={settings?.analytics ?? true}
                        onCheckedChange={(checked) => handleSettingUpdate('analytics', checked)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="rate-limit">API 요청 제한 (분당)</Label>
                      <Input 
                        id="rate-limit" 
                        type="number" 
                        value={settings?.rateLimit || 100}
                        onChange={(e) => handleSettingUpdate('rateLimit', parseInt(e.target.value))}
                        className="shadow-inner shadow-black/5" 
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-border/50 shadow-lg shadow-black/5 backdrop-blur-sm bg-card/95">
                  <CardHeader>
                    <CardTitle className="font-serif">보안 설정</CardTitle>
                    <CardDescription>시스템 보안을 강화합니다</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="2fa-required">2단계 인증 필수</Label>
                        <p className="text-sm text-muted-foreground">모든 사용자에게 2FA를 요구합니다</p>
                      </div>
                      <Switch 
                        id="2fa-required" 
                        checked={settings?.require2FA ?? false}
                        onCheckedChange={(checked) => handleSettingUpdate('require2FA', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="auto-scan">자동 링크 스캔</Label>
                        <label className="text-sm text-muted-foreground">악성 링크를 자동으로 감지합니다</label>
                      </div>
                      <Switch 
                        id="auto-scan" 
                        checked={settings?.autoScan ?? true}
                        onCheckedChange={(checked) => handleSettingUpdate('autoScan', checked)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="session-timeout">세션 만료 시간 (분)</Label>
                      <Input
                        id="session-timeout"
                        type="number"
                        value={settings?.sessionTimeout || 60}
                        onChange={(e) => handleSettingUpdate('sessionTimeout', parseInt(e.target.value))}
                        className="shadow-inner shadow-black/5"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="backup-frequency">백업 주기</Label>
                      <Select 
                        value={settings?.backupFrequency || 'daily'}
                        onValueChange={(value) => handleSettingUpdate('backupFrequency', value)}
                      >
                        <SelectTrigger className="shadow-inner shadow-black/5">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="hourly">매시간</SelectItem>
                          <SelectItem value="daily">매일</SelectItem>
                          <SelectItem value="weekly">매주</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-border/50 shadow-lg shadow-black/5 backdrop-blur-sm bg-card/95">
                  <CardHeader>
                    <CardTitle className="font-serif">시스템 알림</CardTitle>
                    <CardDescription>사용자들에게 중요한 공지사항을 전달합니다</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <Button 
                          onClick={() => handleCreateNotification('welcome', 'new')}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Mail className="w-4 h-4 mr-2" />
                          신규 사용자 환영 알림
                        </Button>
                        <span className="text-sm text-muted-foreground">
                          최근 7일 내 가입한 사용자에게
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button 
                          onClick={() => handleCreateNotification('premium', 'all')}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          <Mail className="w-4 h-4 mr-2" />
                          프리미엄 기능 준비 중 알림
                        </Button>
                        <span className="text-sm text-muted-foreground">
                          모든 활성 사용자에게
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
