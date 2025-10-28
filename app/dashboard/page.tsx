"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Search, 
  Filter, 
  Plus, 
  ExternalLink, 
  Copy, 
  Edit, 
  Trash2, 
  Heart, 
  Crown,
  Calendar,
  BarChart3,
  Tag,
  Eye,
  Globe,
  TrendingUp,
  Trophy,
  RefreshCw
} from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { useLanguage } from "@/contexts/language-context"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { GeoChart } from "@/components/ui/geo-chart"

interface UrlData {
  id: string
  originalUrl: string
  shortUrl: string
  shortCode: string
  customCode: string | null
  title: string | null
  description: string | null
  isFavorite: boolean
  expiresAt: string | null
  createdAt: string
  clickCount: number
  tags: Array<{
    id: string
    name: string
    color: string
  }>
}

interface PaginationData {
  page: number
  limit: number
  totalCount: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

export default function DashboardPage() {
  const { user, isLoading: authLoading } = useAuth()
  const { t } = useLanguage()
  const { toast } = useToast()
  const router = useRouter()
  
  // 인증 상태 모니터링 제거 (무한 루프 방지)
  
  const [urls, setUrls] = useState<UrlData[]>([])
  const [pagination, setPagination] = useState<PaginationData | null>(null)
  const [isLoading, setIsLoading] = useState(false) // 백그라운드 로딩으로 변경
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedTag, setSelectedTag] = useState("")
  const [showFavorites, setShowFavorites] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [activeTab, setActiveTab] = useState<'urls' | 'analytics' | 'geo'>('urls')
  // 기본 데이터로 즉시 표시 (백그라운드에서 실제 데이터 로드)
  const [geoData, setGeoData] = useState<any>({ countries: [] })
  const [isLoadingGeo, setIsLoadingGeo] = useState(false)
  const [deviceData, setDeviceData] = useState<any>({ desktop: 0, mobile: 0, tablet: 0 })
  const [isLoadingDevice, setIsLoadingDevice] = useState(false)

  // 인증 확인
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login')
    }
  }, [user, authLoading, router])

  // URL 목록 로드 (최적화된 버전)
  const loadUrls = async (page = 1, showLoading = false) => {
    if (!user) return

    // 첫 로딩이거나 명시적으로 요청한 경우만 로딩 표시
    if (showLoading) setIsLoading(true)
    
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10'
      })

      if (searchTerm) params.append('search', searchTerm)
      if (selectedTag) params.append('tag', selectedTag)
      if (showFavorites) params.append('favorite', 'true')

      const response = await fetch(`/api/urls?${params}`, {
        credentials: 'include'
      })

      if (response.ok) {
        const result = await response.json()
        setUrls(result.data.urls)
        setPagination(result.data.pagination)
        setCurrentPage(page)
      } else {
        toast({
          title: "오류 발생",
          description: t("urlListLoadFailed"),
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('URL 목록 로드 오류:', error)
      toast({
        title: "오류 발생",
        description: "네트워크 오류가 발생했습니다.",
        variant: "destructive"
      })
    } finally {
      if (showLoading) setIsLoading(false)
    }
  }

  // URL 삭제
  const handleDeleteUrl = async (urlId: string) => {
    if (!confirm(t("confirmDelete"))) return

    try {
      const response = await fetch(`/api/urls/${urlId}`, {
        method: 'DELETE',
        credentials: 'include'
      })

      if (response.ok) {
        toast({
          title: "삭제 완료",
          description: t("urlDeleted")
        })
        loadUrls(currentPage)
      } else {
        toast({
          title: "삭제 실패",
          description: t("urlDeleteFailed"),
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('URL 삭제 오류:', error)
      toast({
        title: "오류 발생",
        description: "네트워크 오류가 발생했습니다.",
        variant: "destructive"
      })
    }
  }

  // URL 복사
  const handleCopyUrl = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url)
      toast({
        title: "복사 완료",
        description: t("urlCopied")
      })
    } catch (error) {
      toast({
        title: "복사 실패",
        description: t("urlCopyFailed"),
        variant: "destructive"
      })
    }
  }

  // 검색 및 필터 적용 (초기 로딩만 스피너 표시)
  useEffect(() => {
    if (user) {
      // 첫 로딩시에만 로딩 스피너 표시
      const isFirstLoad = urls.length === 0
      loadUrls(1, isFirstLoad)
    }
  }, [user, searchTerm, selectedTag, showFavorites])

  // 자동 새로고침 제거 (무한 루프 방지)

  // 페이지 포커스 새로고침 제거 (무한 루프 방지)

  // 기본 통계 데이터 계산
  const calculateBasicStats = () => {
    if (!urls.length) return null

    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    
    // 최근 30일 데이터
    const recentUrls = urls.filter(url => new Date(url.createdAt) >= thirtyDaysAgo)
    const recentClicks = recentUrls.reduce((sum, url) => sum + url.clickCount, 0)
    
    // 일별 통계 (간단한 시뮬레이션)
    const dailyStats = []
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
      const dayUrls = urls.filter(url => {
        const urlDate = new Date(url.createdAt)
        return urlDate.toDateString() === date.toDateString()
      })
      const dayClicks = dayUrls.reduce((sum, url) => sum + url.clickCount, 0)
      dailyStats.push({ date: date.toDateString(), urls: dayUrls.length, clicks: dayClicks })
    }
    
    // 최고 성과 URL
    const topUrls = [...urls].sort((a, b) => b.clickCount - a.clickCount).slice(0, 5)
    
    // 평균 클릭
    const averageClicks = urls.length > 0 ? Math.round(urls.reduce((sum, url) => sum + url.clickCount, 0) / urls.length) : 0
    
    // 최고/최저 성과일
    const bestDay = dailyStats.reduce((best, current) => current.clicks > best.clicks ? current : best)
    const worstDay = dailyStats.reduce((worst, current) => current.clicks < worst.clicks ? current : worst)
    
    return {
      totalUrls: urls.length,
      totalClicks: urls.reduce((sum, url) => sum + url.clickCount, 0),
      recentGrowth: recentUrls.length,
      recentClicks,
      dailyStats,
      topUrls,
      averageClicks,
      bestDay,
      worstDay
    }
  }

  // 디바이스별 접속 통계 계산
  const calculateDeviceStats = () => {
    if (!deviceData) {
      // 데이터가 없는 경우 기본값 반환
      return {
        desktop: 45,
        mobile: 35,
        tablet: 20
      }
    }
    return {
      desktop: deviceData.desktop || 0,
      mobile: deviceData.mobile || 0,
      tablet: deviceData.tablet || 0
    }
  }

  // 디바이스 데이터 로드
  const loadDeviceData = async () => {
    if (!user) return

    setIsLoadingDevice(true)
    try {
      const response = await fetch('/api/analytics/device', {
        credentials: 'include'
      })

      if (response.ok) {
        const result = await response.json()
        setDeviceData(result.data)
      }
    } catch (error) {
      console.error('디바이스 데이터 로드 오류:', error)
    } finally {
      setIsLoadingDevice(false)
    }
  }

  // 지리적 데이터 로드
  const loadGeoData = async () => {
    if (!user) return

    setIsLoadingGeo(true)
    try {
      const response = await fetch('/api/analytics/geo', {
        credentials: 'include'
      })

      if (response.ok) {
        const result = await response.json()
        setGeoData(result.data)
      }
    } catch (error) {
      console.error('지리적 데이터 로드 오류:', error)
    } finally {
      setIsLoadingGeo(false)
    }
  }

  // 탭 변경 시 데이터 로드 (최적화된 버전)
  useEffect(() => {
    if (!user) return
    
    if (activeTab === 'geo' && (!geoData || geoData.countries.length === 0)) {
      loadGeoData()
    }
    if (activeTab === 'analytics' && deviceData.desktop === 0 && deviceData.mobile === 0 && deviceData.tablet === 0) {
      loadDeviceData()
    }
  }, [user, activeTab]) // 의존성 배열에서 data 제거

  // 페이지 레벨 로딩 스피너 제거 - 즉시 표시
  if (!user && !authLoading) {
    return null // 사용자가 없고 로딩도 끝났으면 리다이렉트됨
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-card to-background">
      <div className="container mx-auto px-4 py-8">
        {/* 헤더 */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="font-serif font-bold text-3xl text-foreground">
                {t("dashboard")}
              </h1>
              <p className="text-muted-foreground">
                {t("welcomeMessage").replace("{name}", user.username || user.email)}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => loadUrls(currentPage)}
                disabled={isLoading}
                className="flex items-center gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                {t("refresh")}
              </Button>
              <Link href="/shortener">
                <Button className="flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  {t("createUrl")}
                </Button>
              </Link>
            </div>
          </div>

          {/* 통계 카드 */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-blue-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">{t("totalUrls")}</p>
                    <p className="text-2xl font-bold">{pagination?.totalCount || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Eye className="w-5 h-5 text-green-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">{t("totalClicks")}</p>
                    <p className="text-2xl font-bold">
                      {urls.reduce((sum, url) => sum + url.clickCount, 0)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Heart className="w-5 h-5 text-pink-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">{t("favorites")}</p>
                    <p className="text-2xl font-bold">
                      {urls.filter(url => url.isFavorite).length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Crown className="w-5 h-5 text-amber-500" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* 탭 네비게이션 */}
        <div className="flex gap-2 mb-6">
          <Button
            variant={activeTab === 'urls' ? 'default' : 'outline'}
            onClick={() => setActiveTab('urls')}
            className="flex items-center gap-2"
          >
            <BarChart3 className="w-4 h-4" />
            {t("urlList")}
          </Button>
          <Button
            variant={activeTab === 'analytics' ? 'default' : 'outline'}
            onClick={() => setActiveTab('analytics')}
            className="flex items-center gap-2"
          >
            <BarChart3 className="w-4 h-4" />
            {t("basicStats")}
          </Button>
          <Button
            variant={activeTab === 'geo' ? 'default' : 'outline'}
            onClick={() => setActiveTab('geo')}
            className="flex items-center gap-2"
          >
            {/* 아이콘 간단화: Globe 대신 기본 아이콘 사용 */}
            <BarChart3 className="w-4 h-4" />
                          {t("geographicAnalysis")}
          </Button>
        </div>

        {/* 검색 및 필터 (URL 목록 탭에서만 표시) */}
        {activeTab === 'urls' && (
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder={t("searchPlaceholder")}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Select value={selectedTag || undefined} onValueChange={(v) => setSelectedTag(v === 'all' ? '' : v)}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder={t("selectTag")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t("allTags")}</SelectItem>
                      {Array.from(new Set(urls.flatMap(url => url.tags.map(tag => tag.name)))).map(tagName => (
                        <SelectItem key={tagName} value={tagName}>{tagName}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    variant={showFavorites ? "default" : "outline"}
                    onClick={() => setShowFavorites(!showFavorites)}
                    className="flex items-center gap-2"
                  >
                    <Heart className={`w-4 h-4 ${showFavorites ? "fill-current" : ""}`} />
                    {t("favorites")}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 탭별 콘텐츠 */}
        {activeTab === 'urls' && (
          <div className="space-y-4">
            {/* 기존 URL 목록 코드는 그대로 유지 */}
            {/* ... */}
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-6">
            {/* 기본 통계 요약 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-blue-500" />
                    <div>
                      <p className="text-sm text-muted-foreground">{t("urlGrowth")}</p>
                      <p className="text-2xl font-bold">
                        {calculateBasicStats()?.recentGrowth || 0}
                      </p>
                      <p className="text-xs text-muted-foreground">{t("recent30Days")}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-green-500" />
                    <div>
                      <p className="text-sm text-muted-foreground">{t("averageClicks")}</p>
                      <p className="text-2xl font-bold">
                        {calculateBasicStats()?.averageClicks || 0}
                      </p>
                      <p className="text-xs text-muted-foreground">{t("averagePerUrl")}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-purple-500" />
                    <div>
                      <p className="text-sm text-muted-foreground">{t("bestDay")}</p>
                      <p className="text-2xl font-bold">
                        {calculateBasicStats()?.bestDay?.clicks || 0}
                      </p>
                      <p className="text-xs text-muted-foreground">{t("clicks")}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* 최고 성과 URL */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-amber-500" />
                  {t("topPerformingUrls")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {calculateBasicStats()?.topUrls?.map((url, index) => (
                    <div key={url.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold">
                          {index + 1}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium truncate">
                            {url.title || url.originalUrl.substring(0, 40) + '...'}
                          </p>
                          <p className="text-sm text-muted-foreground font-mono">
                            {url.shortUrl}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg">{url.clickCount}</p>
                        <p className="text-xs text-muted-foreground">{t("clicks")}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* 일별 통계 차트 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-blue-500" />
                  {t("dailyStats")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80 flex items-end gap-2 justify-center px-4">
                  {calculateBasicStats()?.dailyStats?.slice(-7).map((day, index) => (
                    <div key={index} className="flex flex-col items-center gap-2 flex-1">
                      <div 
                        className="w-full max-w-16 bg-gradient-to-t from-primary to-primary/60 rounded-t-lg transition-all duration-300 hover:from-primary/80 hover:to-primary/40 hover:scale-105 cursor-pointer shadow-sm"
                        style={{ 
                          height: `${Math.max(day.clicks * 3, 8)}px`,
                          minHeight: '8px'
                        }}
                        title={`${day.date}: ${day.clicks} 클릭`}
                      />
                      <p className="text-xs text-muted-foreground font-medium">
                        {new Date(day.date).getDate()}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="text-center mt-6">
                  <p className="text-sm text-muted-foreground font-medium">
                    {t("recent7DaysClickStats")}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* 디바이스별 접속 분포 차트 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="w-5 h-5 text-purple-500" />
                  {t("deviceConnection")}
                </CardTitle>
                <CardDescription>
                  {t("userDeviceDistribution")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingDevice ? (
                  <div className="flex items-center justify-center h-48">
                    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-6">
                    {/* 도넛 차트 */}
                    <div className="relative w-64 h-64">

                      <svg className="w-full h-full" viewBox="0 0 100 100">
                        {/* 데스크톱 */}
                        <circle
                          cx="50"
                          cy="50"
                          r="40"
                          fill="none"
                          stroke="#ef4444"
                          strokeWidth="16"
                          strokeDasharray={`${calculateDeviceStats().desktop * 2.51} ${100 * 2.51}`}
                          strokeDashoffset="0"
                          className="transition-all duration-300 hover:stroke-[#dc2626]"
                        />
                        {/* 모바일 */}
                        <circle
                          cx="50"
                          cy="50"
                          r="40"
                          fill="none"
                          stroke="#f97316"
                          strokeWidth="16"
                          strokeDasharray={`${calculateDeviceStats().mobile * 2.51} ${100 * 2.51}`}
                          strokeDashoffset={`-${calculateDeviceStats().desktop * 2.51}`}
                          className="transition-all duration-300 hover:stroke-[#ea580c]"
                        />
                        {/* 태블릿 */}
                        <circle
                          cx="50"
                          cy="50"
                          r="40"
                          fill="none"
                          stroke="#22c55e"
                          strokeWidth="16"
                          strokeDasharray={`${calculateDeviceStats().tablet * 2.51} ${100 * 2.51}`}
                          strokeDashoffset={`-${(calculateDeviceStats().desktop + calculateDeviceStats().mobile) * 2.51}`}
                          className="transition-all duration-300 hover:stroke-[#16a34a]"
                        />
                        {/* 중앙 텍스트 */}
                        <text
                          x="50"
                          y="45"
                          textAnchor="middle"
                          className="text-[10px] font-bold fill-foreground"
                        >
                          {calculateDeviceStats().desktop + calculateDeviceStats().mobile + calculateDeviceStats().tablet}%
                        </text>
                        <text
                          x="50"
                          y="58"
                          textAnchor="middle"
                          className="text-[8px] fill-muted-foreground"
                        >
                          {t("total")}
                        </text>
                      </svg>
                    </div>

                    {/* 범례 */}
                    <div className="flex gap-6">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-red-500"></div>
                        <div>
                          <p className="font-medium text-sm">{t("desktop")}</p>
                          <p className="text-lg font-bold text-red-500">{calculateDeviceStats().desktop}%</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-orange-500"></div>
                        <div>
                          <p className="font-medium text-sm">{t("mobile")}</p>
                          <p className="text-lg font-bold text-orange-500">{calculateDeviceStats().mobile}%</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-green-500"></div>
                        <div>
                          <p className="font-medium text-sm">{t("tablet")}</p>
                          <p className="text-lg font-bold text-green-500">{calculateDeviceStats().tablet}%</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'geo' && (
          <div>
            {isLoadingGeo ? (
              <div className="text-center py-8">
                <div className="w-8 h-8 border-4 border-primary border-t-primary/30 rounded-full animate-spin mx-auto mb-4" />
                <p className="text-muted-foreground">지리적 데이터를 불러오는 중...</p>
              </div>
            ) : geoData ? (
              <GeoChart 
                countryStats={geoData.countryStats}
                cityStats={geoData.cityStats}
                summary={geoData.summary}
              />
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <div className="text-4xl mx-auto mb-4">🌐</div>
                  <h3 className="text-lg font-semibold mb-2">지리적 데이터가 없습니다</h3>
                  <p className="text-muted-foreground">
                    {t("urlShared")}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* URL 목록 */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">{t("urlListLoading")}</p>
            </div>
          ) : urls.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <BarChart3 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">{t("noUrlsMessage")}</h3>
                <p className="text-muted-foreground mb-4">
                  {t("createFirstUrl")}
                </p>
                <Link href="/shortener">
                  <Button>{t("createUrl")}</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            urls.map((url) => (
              <Card key={url.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-4">
                  <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                    {/* URL 정보 */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-2 mb-2">
                        {url.isFavorite && (
                          <Heart className="w-4 h-4 text-pink-500 fill-current" />
                        )}
                        <h3 className="font-semibold truncate">
                          {url.title || url.originalUrl.substring(0, 50) + '...'}
                        </h3>
                      </div>
                      
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground truncate">
                          {url.originalUrl}
                        </p>
                        <p className="font-mono text-sm text-primary">
                          {url.shortUrl}
                        </p>
                        {url.description && (
                          <p className="text-sm text-muted-foreground">
                            {url.description}
                          </p>
                        )}
                      </div>

                      {/* 태그 */}
                      {url.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {url.tags.map((tag) => (
                            <Badge key={tag.id} variant="secondary" className="text-xs">
                              <Tag className="w-3 h-3 mr-1" />
                              {tag.name}
                            </Badge>
                          ))}
                        </div>
                      )}

                      {/* 메타 정보 */}
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          {url.clickCount} {t("clicks")}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(url.createdAt).toLocaleDateString()}
                        </span>
                        {url.expiresAt && (
                          <span className="flex items-center gap-1 text-orange-500">
                            <Calendar className="w-3 h-3" />
                            {new Date(url.expiresAt).toLocaleDateString()} {t("expiresAt")}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* 액션 버튼 */}
                    <div className="flex flex-col sm:flex-row gap-2 lg:flex-col">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCopyUrl(url.shortUrl)}
                        className="flex items-center gap-1"
                      >
                        <Copy className="w-3 h-3" />
                        {t("copy")}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(url.shortUrl, '_blank')}
                        className="flex items-center gap-1"
                      >
                        <ExternalLink className="w-3 h-3" />
                        {t("open")}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/dashboard/edit/${url.id}`)}
                        className="flex items-center gap-1"
                      >
                        <Edit className="w-3 h-3" />
                        {t("edit")}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteUrl(url.id)}
                        className="flex items-center gap-1 text-red-500 hover:text-red-600"
                      >
                        <Trash2 className="w-3 h-3" />
                        {t("delete")}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* 페이지네이션 */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            <Button
              variant="outline"
              onClick={() => loadUrls(currentPage - 1)}
              disabled={!pagination.hasPrev}
            >
              이전
            </Button>
            
            <span className="text-sm text-muted-foreground">
              {pagination.page} / {pagination.totalPages}
            </span>
            
            <Button
              variant="outline"
              onClick={() => loadUrls(currentPage + 1)}
              disabled={!pagination.hasNext}
            >
              다음
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
