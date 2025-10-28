"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, Users, TrendingUp } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"

// 아이콘 안전하게 사용
const GlobeIcon = () => (
  <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 102 2 2 2 0 012 2v.5a2.5 2.5 0 002.5 2.5h.614M8 3.935A2.5 2.5 0 015.5 3.5h-.614M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 102 2 2 2 0 012 2v.5a2.5 2.5 0 002.5 2.5h.614" />
  </svg>
)

interface GeoChartProps {
  countryStats: Array<{ country: string; clicks: number }>
  cityStats: Array<{ city: string; clicks: number }>
  summary: {
    totalCountries: number
    totalCities: number
    uniqueVisitors: number
  }
}

export function GeoChart({ countryStats, cityStats, summary }: GeoChartProps) {
  const { t } = useLanguage()
  
  // 안전한 데이터 처리
  const safeCountryStats = countryStats || []
  const safeCityStats = cityStats || []
  const safeSummary = summary || { totalCountries: 0, totalCities: 0, uniqueVisitors: 0 }
  
  // 국가 코드를 국가명으로 변환
  const getCountryName = (code: string) => {
    const countryNames: { [key: string]: string } = {
      'KR': '대한민국',
      'US': '미국',
      'JP': '일본',
      'CN': '중국',
      'GB': '영국',
      'DE': '독일',
      'FR': '프랑스',
      'CA': '캐나다',
      'AU': '호주',
      'BR': '브라질',
      'IN': '인도',
      'RU': '러시아',
      'Unknown': '알 수 없음'
    }
    return countryNames[code] || code
  }

  // 상위 5개 국가만 표시 (안전하게)
  const topCountries = safeCountryStats.slice(0, 5)
  // 상위 10개 도시만 표시 (안전하게)
  const topCities = safeCityStats.slice(0, 10)

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* 요약 통계 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GlobeIcon />
            {t("geographicAnalysisSummary")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {safeSummary.totalCountries}
              </div>
              <div className="text-sm text-muted-foreground">{t("countries")}</div>
            </div>
            <div className="text-center p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {safeSummary.totalCities}
              </div>
              <div className="text-sm text-muted-foreground">{t("cities")}</div>
            </div>
            <div className="text-center p-3 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {safeSummary.uniqueVisitors}
              </div>
              <div className="text-sm text-muted-foreground">{t("visitors")}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 상위 국가 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-red-500" />
            {t("topCountryClicks")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {topCountries.length > 0 ? (
            <div className="space-y-3">
              {topCountries.map((stat, index) => (
                <div key={stat.country} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold">
                      {index + 1}
                    </Badge>
                    <span className="font-medium">
                      {getCountryName(stat.country)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-green-500" />
                    <span className="font-semibold text-green-600 dark:text-green-400">
                      {stat.clicks.toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <GlobeIcon />
              <p>{t("noGeographicDataYet")}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 상위 도시 */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-500" />
            {t("topCityClicks")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {topCities.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {topCities.map((stat, index) => (
                <div key={stat.city} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary" className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">
                      {index + 1}
                    </Badge>
                    <span className="font-medium">{stat.city}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-indigo-500" />
                    <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                      {stat.clicks.toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>{t("noCityDataYet")}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
