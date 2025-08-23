"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check, Crown, Shield, BarChart3, Link2, Loader2, Zap } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { useLanguage } from "@/contexts/language-context"

interface SubscriptionData {
  currentPlan: 'free' | 'premium'
  planDetails: {
    name: string
    price: number
    features: string[]
    limits: {
      urlsPerMonth: number
      customDomains: number
      advancedAnalytics: boolean
      prioritySupport: boolean
    }
  }
  usage: {
    urlsThisMonth: number
    totalUrls: number
    totalClicks: number
    limit: number
    remaining: number
  }
  isActive: boolean
  nextBillingDate: string | null
}

export default function PricingPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const router = useRouter()
  const { t } = useLanguage()

  const [subscription, setSubscription] = useState<SubscriptionData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isUpgrading, setIsUpgrading] = useState(false)

  const plans = [
    {
      id: "free",
      name: t("free"),
      price: 0,
      period: t("monthly"),
      description: t("freeDescription"),
      features: [
        t("monthly100Urls"),
        t("basicStats"),
        t("qrCodeGeneration"),
        t("tagManagement"),
        t("linkStorage7Days"),
        t("standardSupport")
      ],
      limitations: [t("customUrlNotAvailable"), t("advancedAnalyticsLimited"), t("apiAccessNotAvailable")],
      buttonText: t("startFree"),
      popular: false,
      color: "muted",
    },
    {
      id: "premium",
      name: t("premium"),
      price: 9900,
      period: t("monthly"),
      description: t("premiumDescription"),
      features: [
        t("unlimitedUrls"),
        t("customUrl"),
        t("advancedStats"),
        t("geographicAnalysis"),
        t("customDomain"),
        t("expirationDate"),
        t("favoriteManagement"),
        t("prioritySupport"),
        t("apiAccess"),
        t("bulkUrlManagement")
      ],
      buttonText: t("startPremium"),
      popular: true,
      color: "primary",
    },
  ]

  const features = [
    {
      icon: Link2,
      title: t("unlimitedUrlShortening"),
      description: t("unlimitedUrlShorteningDesc"),
      color: "primary",
    },
    {
      icon: Crown,
      title: t("customUrlTitle"),
      description: t("customUrlDesc"),
      color: "accent",
    },
    {
      icon: BarChart3,
      title: t("detailedAnalytics"),
      description: t("detailedAnalyticsDesc"),
      color: "secondary",
    },
    {
      icon: Shield,
      title: t("secureLinks"),
      description: t("secureLinksDesc"),
      color: "primary",
    },
  ]



  // 강제로 상태를 초기화하는 함수
  const forceResetUpgradingState = () => {
    console.log('강제 상태 초기화 실행')
    setIsUpgrading(false)
    
    // 추가 안전장치: setTimeout으로 한 번 더 확인
    setTimeout(() => {
      if (isUpgrading) {
        console.log('추가 안전장치 실행: isUpgrading 강제 초기화')
        setIsUpgrading(false)
      }
    }, 100)
  }

  // 상태 초기화 함수
  const resetUpgradingState = useCallback(() => {
    console.log('상태 초기화: isUpgrading을 false로 설정')
    setIsUpgrading(false)
  }, [])

  const loadSubscription = useCallback(async () => {
    if (!user) return
    
    setIsLoading(true)
    try {
      const response = await fetch('/api/subscription', {
        credentials: 'include'
      })
      
      if (response.ok) {
        const result = await response.json()
        setSubscription(result.data)
        // 구독 정보 로드 후 상태 초기화
        forceResetUpgradingState()
      }
    } catch (error) {
      console.error('구독 정보 로드 오류:', error)
      forceResetUpgradingState()
    } finally {
      setIsLoading(false)
    }
  }, [user])

  // 구독 정보 로드
  useEffect(() => {
    if (user) {
      loadSubscription()
      // 사용자가 변경되면 isUpgrading 상태 초기화
      forceResetUpgradingState()
    }
  }, [user, loadSubscription])

  // 컴포넌트 언마운트 시 상태 초기화
  useEffect(() => {
    return () => {
      forceResetUpgradingState()
    }
  }, [])

  // 주기적으로 상태 확인 및 초기화 (안전장치)
  useEffect(() => {
    const interval = setInterval(() => {
      if (isUpgrading) {
        console.log('주기적 상태 확인: isUpgrading이 true로 남아있음, 강제 초기화')
        forceResetUpgradingState()
      }
    }, 3000) // 3초마다 확인

    return () => clearInterval(interval)
  }, [isUpgrading])

  // 디버깅을 위한 상태 로깅
  useEffect(() => {
    console.log('isUpgrading 상태 변경:', isUpgrading)
  }, [isUpgrading])

  const handlePlanChange = useCallback(async (planId: string) => {
    if (!user) {
      router.push('/auth/login')
      return
    }

    if (planId === subscription?.currentPlan) {
      toast({
        title: "알림",
        description: "이미 현재 플랜입니다.",
      })
      return
    }

    console.log('플랜 변경 시작:', planId, '현재 상태:', isUpgrading)
    setIsUpgrading(true)
    
    try {
      const response = await fetch('/api/subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ plan: planId })
      })

      if (response.ok) {
        const result = await response.json()
        console.log('플랜 변경 성공:', result)
        toast({
          title: "성공!",
          description: result.message,
        })
        
        // 구독 정보 새로고침
        await loadSubscription()
        
        // 사용자 정보 업데이트 (실제로는 context에서 처리)
        if (user && typeof user.updateUser === 'function') {
          try {
            user.updateUser({ isPremium: planId === 'premium' })
          } catch (error) {
            console.error('사용자 정보 업데이트 오류:', error)
          }
        }
      } else {
        const error = await response.json()
        console.error('플랜 변경 실패:', error)
        toast({
          title: "오류 발생",
          description: error.error || "플랜 변경에 실패했습니다.",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('플랜 변경 오류:', error)
      toast({
        title: "오류 발생",
        description: "네트워크 오류가 발생했습니다.",
        variant: "destructive"
      })
    } finally {
      console.log('플랜 변경 완료, isUpgrading을 false로 설정')
      setIsUpgrading(false)
    }
  }, [user, subscription, toast, router, loadSubscription])

  const handleCancelSubscription = useCallback(async () => {
    if (!user || !subscription) return
    
    if (subscription.currentPlan === 'free') {
      toast({
        title: "알림",
        description: t("freePlanCannotCancel"),
      })
      return
    }

    if (!confirm(t("confirmPremiumCancel"))) {
      return
    }

    setIsUpgrading(true)
    try {
      const response = await fetch('/api/subscription', {
        method: 'DELETE',
        credentials: 'include'
      })

      if (response.ok) {
        const result = await response.json()
        toast({
          title: "구독 취소 완료",
          description: result.message,
        })
        
        await loadSubscription()
        
        if (user && typeof user.updateUser === 'function') {
          try {
            user.updateUser({ isPremium: false })
          } catch (error) {
            console.error('사용자 정보 업데이트 오류:', error)
          }
        }
      } else {
        const error = await response.json()
        toast({
          title: "오류 발생",
          description: error.error || "구독 취소에 실패했습니다.",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('구독 취소 오류:', error)
      toast({
        title: "오류 발생",
        description: "네트워크 오류가 발생했습니다.",
        variant: "destructive"
      })
    } finally {
      setIsUpgrading(false)
    }
  }, [user, subscription, toast, loadSubscription])

  const getCurrentPlan = useCallback(() => {
    if (!subscription) return null
    return plans.find(plan => plan.id === subscription.currentPlan)
  }, [subscription])

  const currentPlan = getCurrentPlan()

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-background relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-32 left-20 w-40 h-40 bg-accent/10 rounded-full blur-2xl opacity-60" />
        <div className="absolute top-60 right-32 w-32 h-32 bg-primary/10 rounded-full blur-xl opacity-60" />
        <div className="absolute bottom-40 left-1/3 w-48 h-48 bg-secondary/10 rounded-full blur-3xl opacity-60" />
      </div>

      <div className="container mx-auto px-4 py-12 relative z-10">
        <div className="max-w-6xl mx-auto space-y-12">
          {/* Header */}
          <div className="text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/10 rounded-full border border-accent/20 backdrop-blur-sm shadow-lg shadow-accent/10">
              <Crown className="w-4 h-4 text-accent" />
              <span className="text-sm font-medium text-accent">간단하고 투명한 요금제</span>
            </div>
            <h1 className="font-serif font-bold text-4xl md:text-5xl text-foreground">
              당신에게 맞는{" "}
              <span className="text-primary bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                플랜
              </span>
              을 선택하세요
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t("personalUsers")}부터 {t("businessUsers")}까지, {t("allRequirements")}에 맞는 플랜을 제공합니다
            </p>
          </div>

          {/* Current Plan Status */}
          {user && subscription && (
            <div className="max-w-2xl mx-auto">
              <Card className="border-primary/20 bg-primary/5 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="text-center space-y-4">
                    <div className="flex items-center justify-center gap-2">
                      <Crown className="w-5 h-5 text-primary" />
                      <h3 className="text-lg font-semibold">현재 플랜: {subscription.planDetails.name}</h3>
                    </div>
                    
                    {subscription.currentPlan === 'premium' && (
                      <p className="text-sm text-muted-foreground">
                        다음 결제일: {subscription.nextBillingDate ? new Date(subscription.nextBillingDate).toLocaleDateString() : 'N/A'}
                      </p>
                    )}
                    
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">{t("currentMonthUrls")}</p>
                        <p className="font-semibold">
                          {subscription.usage.urlsThisMonth}
                          {subscription.usage.limit !== -1 && ` / ${subscription.usage.limit}`}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">{t("totalUrls")}</p>
                        <p className="font-semibold">{subscription.usage.totalUrls}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">총 클릭</p>
                        <p className="font-semibold">{subscription.usage.totalClicks}</p>
                      </div>
                    </div>
                    
                    {subscription.currentPlan === 'premium' && (
                      <Button
                        variant="outline"
                        onClick={handleCancelSubscription}
                        disabled={isUpgrading}
                        className="text-red-600 border-red-600 hover:bg-red-600 hover:text-white"
                      >
                        {isUpgrading ? <Loader2 className="w-4 h-4 animate-spin" /> : "구독 취소"}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {plans.map((plan, index) => {
              const isCurrentPlan = subscription?.currentPlan === plan.id
              const canUpgrade = plan.id === 'premium' && subscription?.currentPlan === 'free'
              
              return (
                <Card
                  key={plan.id}
                  className={`relative border-border/50 shadow-2xl shadow-black/10 backdrop-blur-sm bg-card/95 will-change-transform hover:scale-[1.02] transition-all duration-300 hover:shadow-3xl hover:shadow-black/20 ${
                    plan.popular ? 'ring-2 ring-primary/50 shadow-primary/20' : ''
                  } ${isCurrentPlan ? 'ring-2 ring-green-500/50 shadow-green-500/20' : ''}`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-primary text-primary-foreground px-3 py-1">
                        <Crown className="w-3 h-3 mr-1" />
                        인기
                      </Badge>
                    </div>
                  )}
                  
                  {isCurrentPlan && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-green-500 text-white px-3 py-1">
                        <Check className="w-3 h-3 mr-1" />
                        현재 플랜
                      </Badge>
                    </div>
                  )}

                  <CardHeader className="text-center pb-4">
                    <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                    <CardDescription>{plan.description}</CardDescription>
                    <div className="mt-4">
                      <span className="text-4xl font-bold text-primary">
                        {plan.price === 0 ? t("free") : `₩${plan.price.toLocaleString()}`}
                      </span>
                      {plan.price > 0 && (
                        <span className="text-muted-foreground">/{t(plan.period)}</span>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      {plan.features.map((feature, featureIndex) => (
                        <div key={featureIndex} className="flex items-center gap-3">
                          <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                          <span className="text-sm">{feature}</span>
                        </div>
                      ))}
                    </div>

                    {plan.limitations && plan.limitations.length > 0 && (
                      <div className="space-y-3 pt-4 border-t border-border/50">
                        <p className="text-sm font-medium text-muted-foreground">제한사항:</p>
                        {plan.limitations.map((limitation, limitationIndex) => (
                          <div key={limitationIndex} className="flex items-center gap-3">
                            <div className="w-4 h-4 text-red-500 flex-shrink-0">×</div>
                            <span className="text-sm text-muted-foreground">{limitation}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="pt-4">
                      {isCurrentPlan ? (
                        <Button
                          className="w-full bg-green-600 hover:bg-green-700"
                          disabled
                        >
                          <Check className="w-4 h-4 mr-2" />
                          현재 플랜
                        </Button>
                      ) : (
                        <Button
                          onClick={() => {
                            console.log('버튼 클릭됨, 현재 isUpgrading:', isUpgrading)
                            handlePlanChange(plan.id)
                          }}
                          disabled={isUpgrading}
                          className="w-full"
                        >
                          {isUpgrading ? (
                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                          ) : (
                            <Zap className="w-4 h-4 mr-2" />
                          )}
                          {isUpgrading ? t("processing") : plan.buttonText}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Features Section */}
          <div className="text-center space-y-8">
            <div>
              <h2 className="font-serif font-bold text-3xl text-foreground mb-4">
                {t("allRequirements")}
              </h2>
              <p className="text-muted-foreground">
                {t("basicToAdvanced")}
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature, index) => (
                <Card key={index} className="border-border/50 shadow-lg shadow-black/5 backdrop-blur-sm bg-card/95">
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <feature.icon className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="font-semibold mb-2">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* FAQ Section */}
          <div className="text-center space-y-8">
            <div>
              <h2 className="font-serif font-bold text-3xl text-foreground mb-4">
                {t("faq")}
              </h2>
            </div>

            <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              <Card className="border-border/50 shadow-lg shadow-black/5 backdrop-blur-sm bg-card/95">
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-2">{t("canChangePlanAnytime")}</h3>
                  <p className="text-sm text-muted-foreground">
                    {t("canChangePlanAnytimeDesc")}
                  </p>
                </CardContent>
              </Card>

              <Card className="border-border/50 shadow-lg shadow-black/5 backdrop-blur-sm bg-card/95">
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-2">{t("freePlanLimitations")}</h3>
                  <p className="text-sm text-muted-foreground">
                    {t("freePlanLimitationsDesc")}
                  </p>
                </CardContent>
              </Card>

              <Card className="border-border/50 shadow-lg shadow-black/5 backdrop-blur-sm bg-card/95">
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-2">{t("whatArePremiumFeatures")}</h3>
                  <p className="text-sm text-muted-foreground">
                    {t("whatArePremiumFeaturesDesc")}
                  </p>
                </CardContent>
              </Card>

              <Card className="border-border/50 shadow-lg shadow-black/5 backdrop-blur-sm bg-card/95">
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-2">{t("howIsPaymentProcessed")}</h3>
                  <p className="text-sm text-muted-foreground">
                    {t("howIsPaymentProcessedDesc")}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
