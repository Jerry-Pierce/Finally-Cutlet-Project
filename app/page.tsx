"use client"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowRight, Zap, Shield, BarChart3, Crown, Scissors, TrendingUp, TrendingDown } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"
import Link from "next/link"

interface PublicStats {
  users: {
    total: number
    premium: number
    premiumPercentage: number
  }
  urls: {
    total: number
    active: number
    today: number
    thisWeek: number
    growthRate: number
  }
  clicks: {
    total: number
    today: number
    thisWeek: number
    growthRate: number
  }
  engagement: {
    averageClicksPerUrl: number
    activeUrlPercentage: number
  }
  trends: {
    popularTags: Array<{ name: string; count: number }>
    topCountries: Array<{ country: string; clicks: number }>
  }
  system: {
    uptime: number
    timestamp: string
  }
}

export default function LandingPage() {
  const { t } = useLanguage()
  const [stats, setStats] = useState<PublicStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // 통계 데이터 로드
  useEffect(() => {
    const loadStats = async () => {
      try {
        const response = await fetch('/api/public/stats')
        if (response.ok) {
          const result = await response.json()
          setStats(result.data)
        }
      } catch (error) {
        console.error('통계 데이터 로드 오류:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadStats()
  }, [])

  // 성장률 표시
  const renderGrowthRate = (rate: number) => {
    if (rate === 0) return null
    
    const isPositive = rate > 0
    const Icon = isPositive ? TrendingUp : TrendingDown
    const color = isPositive ? 'text-green-500' : 'text-red-500'
    
    return (
      <div className={`flex items-center gap-1 ${color} text-sm`}>
        <Icon className="w-4 h-4" />
        <span>{Math.abs(rate).toFixed(1)}%</span>
      </div>
    )
  }

  // 숫자 포맷팅
  const formatNumber = (num: number): string => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M+'
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K+'
    return num.toString()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-card to-background relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-primary/5 rounded-full blur-xl opacity-60" />
        <div className="absolute top-40 right-20 w-24 h-24 bg-accent/5 rounded-full blur-lg opacity-60" />
        <div className="absolute bottom-32 left-1/4 w-40 h-40 bg-secondary/5 rounded-full blur-2xl opacity-60" />
        <div className="absolute top-1/2 right-1/3 w-28 h-28 bg-primary/3 rounded-full blur-2xl opacity-40" />
      </div>

      <div className="container mx-auto px-4 py-12 relative z-10">
        <div className="max-w-4xl mx-auto text-center space-y-8 mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/10 rounded-full border border-accent/20 backdrop-blur-sm shadow-lg shadow-accent/10 will-change-transform hover:scale-105 transition-transform duration-300">
            <Zap className="w-4 h-4 text-accent" />
            <span className="text-sm font-medium text-accent">{t("fastUrlShortening")}</span>
          </div>

          <h1 className="font-serif font-bold text-5xl md:text-7xl text-foreground drop-shadow-lg">
            {t("shortenLong")}{" "}
            <span className="text-primary bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
              {t("links")}
            </span>
          </h1>

          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">{t("landingDescription")}</p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/auth/login">
              <Button
                size="lg"
                className="px-8 py-6 text-lg shadow-xl shadow-primary/25 hover:shadow-2xl hover:shadow-primary/30 will-change-transform hover:scale-105 active:scale-95 transition-all duration-200"
              >
                {t("getStarted")}
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link href="/pricing">
              <Button
                variant="outline"
                size="lg"
                className="px-8 py-6 text-lg shadow-lg hover:shadow-xl will-change-transform hover:scale-105 active:scale-95 transition-all duration-200 bg-transparent"
              >
                {t("viewPricing")}
              </Button>
            </Link>
          </div>
        </div>

        <div className="max-w-6xl mx-auto mb-16">
          <div className="text-center mb-12">
            <h2 className="font-serif font-bold text-3xl md:text-4xl text-foreground mb-4">{t("whyChooseCutlet")}</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">{t("featuresDescription")}</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-border/50 shadow-xl shadow-black/5 backdrop-blur-sm bg-card/95 will-change-transform hover:scale-105 transition-all duration-300 hover:shadow-2xl hover:shadow-primary/10 group">
              <CardContent className="pt-8">
                <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center mb-6 shadow-lg shadow-primary/20 group-hover:shadow-xl group-hover:shadow-primary/30 will-change-transform group-hover:scale-110 transition-all duration-300">
                  <Zap className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-serif font-semibold text-xl mb-3">{t("fastProcessing")}</h3>
                <p className="text-muted-foreground">{t("fastProcessingDesc")}</p>
              </CardContent>
            </Card>

            <Card className="border-border/50 shadow-xl shadow-black/5 backdrop-blur-sm bg-card/95 will-change-transform hover:scale-105 transition-all duration-300 hover:shadow-2xl hover:shadow-accent/10 group">
              <CardContent className="pt-8">
                <div className="w-16 h-16 bg-accent/10 rounded-xl flex items-center justify-center mb-6 shadow-lg shadow-accent/20 group-hover:shadow-xl group-hover:shadow-accent/30 will-change-transform group-hover:scale-110 transition-all duration-300">
                  <Shield className="w-8 h-8 text-accent" />
                </div>
                <h3 className="font-serif font-semibold text-xl mb-3">{t("secureLinks")}</h3>
                <p className="text-muted-foreground">{t("secureLinksDesc")}</p>
              </CardContent>
            </Card>

            <Card className="border-border/50 shadow-xl shadow-black/5 backdrop-blur-sm bg-card/95 will-change-transform hover:scale-105 transition-all duration-300 hover:shadow-2xl hover:shadow-secondary/10 group">
              <CardContent className="pt-8">
                <div className="w-16 h-16 bg-secondary/10 rounded-xl flex items-center justify-center mb-6 shadow-lg shadow-secondary/20 group-hover:shadow-xl group-hover:shadow-secondary/30 will-change-transform group-hover:scale-110 transition-all duration-300">
                  <Scissors className="w-8 h-8 text-secondary" />
                </div>
                <h3 className="font-serif font-semibold text-xl mb-3">{t("easyToUse")}</h3>
                <p className="text-muted-foreground">{t("easyToUseDesc")}</p>
              </CardContent>
            </Card>

            <Card className="border-border/50 shadow-xl shadow-black/5 backdrop-blur-sm bg-card/95 will-change-transform hover:scale-105 transition-all duration-300 hover:shadow-2xl hover:shadow-green-500/10 group">
              <CardContent className="pt-8">
                <div className="w-16 h-16 bg-green-500/10 rounded-xl flex items-center justify-center mb-6 shadow-lg shadow-green-500/20 group-hover:shadow-xl group-hover:shadow-green-500/30 will-change-transform group-hover:scale-110 transition-all duration-300">
                  <BarChart3 className="w-8 h-8 text-green-500" />
                </div>
                <h3 className="font-serif font-semibold text-xl mb-3">{t("analytics")}</h3>
                <p className="text-muted-foreground">{t("analyticsDesc")}</p>
              </CardContent>
            </Card>

            <Card className="border-border/50 shadow-xl shadow-black/5 backdrop-blur-sm bg-card/95 will-change-transform hover:scale-105 transition-all duration-300 hover:shadow-2xl hover:shadow-amber-500/10 group">
              <CardContent className="pt-8">
                <div className="w-16 h-16 bg-amber-500/10 rounded-xl flex items-center justify-center mb-6 shadow-lg shadow-amber-500/20 group-hover:shadow-xl group-hover:shadow-amber-500/30 will-change-transform group-hover:scale-110 transition-all duration-300">
                  <Crown className="w-8 h-8 text-amber-500" />
                </div>
                <h3 className="font-serif font-semibold text-xl mb-3">{t("customUrls")}</h3>
                <p className="text-muted-foreground">{t("customUrlsDesc")}</p>
              </CardContent>
            </Card>

            <Card className="border-border/50 shadow-xl shadow-black/5 backdrop-blur-sm bg-card/95 will-change-transform hover:scale-105 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/10 group">
              <CardContent className="pt-8">
                <div className="w-16 h-16 bg-blue-500/10 rounded-xl flex items-center justify-center mb-6 shadow-lg shadow-blue-500/20 group-hover:shadow-xl group-hover:shadow-blue-500/30 will-change-transform group-hover:scale-110 transition-all duration-300">
                  <span className="text-blue-500 text-2xl">🌐</span>
                </div>
                <h3 className="font-serif font-semibold text-xl mb-3">{t("globalAccess")}</h3>
                <p className="text-muted-foreground">{t("globalAccessDesc")}</p>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="max-w-4xl mx-auto mb-16">
          <Card className="border-border/50 shadow-2xl shadow-black/10 backdrop-blur-sm bg-card/95 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 pointer-events-none" />
            <CardContent className="pt-12 pb-12 relative z-10">
              <div className="text-center mb-8">
                <h2 className="font-serif font-bold text-3xl text-foreground mb-2">{t("trustedByThousands")}</h2>
                <p className="text-muted-foreground">{t("joinCommunity")}</p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-2">
                    {isLoading ? '...' : formatNumber(stats?.urls.total || 0)}
                  </div>
                  <div className="text-sm text-muted-foreground">{t("linksShortened")}</div>
                  {stats?.urls.growthRate && renderGrowthRate(stats.urls.growthRate)}
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-accent mb-2">
                    {isLoading ? '...' : formatNumber(stats?.users.total || 0)}
                  </div>
                  <div className="text-sm text-muted-foreground">{t("activeUsers")}</div>
                  {stats?.users.premiumPercentage > 0 && (
                    <div className="text-xs text-muted-foreground">
                      {stats.users.premiumPercentage.toFixed(1)}% {t("premiumPercentage")}
                    </div>
                  )}
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-secondary mb-2">
                    {isLoading ? '...' : formatNumber(stats?.clicks.total || 0)}
                  </div>
                  <div className="text-sm text-muted-foreground">{t("totalClicks")}</div>
                  {stats?.clicks.growthRate && renderGrowthRate(stats.clicks.growthRate)}
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-500 mb-2">
                    {isLoading ? '...' : (stats?.engagement.activeUrlPercentage || 0).toFixed(1) + '%'}
                  </div>
                  <div className="text-sm text-muted-foreground">{t("activeUrls")}</div>
                  <div className="text-xs text-muted-foreground">
                    {stats?.engagement.averageClicksPerUrl.toFixed(1) || 0} {t("clicksPerUrl")}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="max-w-2xl mx-auto text-center">
          <Card className="border-border/50 shadow-2xl shadow-black/10 backdrop-blur-sm bg-card/95 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/10 pointer-events-none" />
            <CardContent className="pt-12 pb-12 relative z-10">
              <h2 className="font-serif font-bold text-3xl text-foreground mb-4">{t("readyToStart")}</h2>
              <p className="text-lg text-muted-foreground mb-8">{t("startShorteningToday")}</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/auth/login">
                  <Button
                    size="lg"
                    className="px-8 py-6 text-lg shadow-xl shadow-primary/25 hover:shadow-2xl hover:shadow-primary/30 will-change-transform hover:scale-105 active:scale-95 transition-all duration-200"
                  >
                    {t("createAccount")}
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
                <Link href="/pricing">
                  <Button
                    variant="outline"
                    size="lg"
                    className="px-8 py-6 text-lg shadow-lg hover:shadow-xl will-change-transform hover:scale-105 active:scale-95 transition-all duration-200 bg-transparent"
                  >
                    {t("learnMore")}
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
