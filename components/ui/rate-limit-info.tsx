"use client"

import { useState, useEffect } from "react"
import { AlertCircle, Clock, CheckCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"

interface RateLimitInfo {
  limit: number
  remaining: number
  reset: number
  retryAfter?: number
}

interface RateLimitInfoProps {
  limit: number
  remaining: number
  reset: number
  endpoint?: string
}

export function RateLimitInfo({ limit, remaining, reset, endpoint }: RateLimitInfoProps) {
  const [timeLeft, setTimeLeft] = useState<number>(0)
  const [isExpired, setIsExpired] = useState<boolean>(false)

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = Date.now()
      const timeLeftMs = reset - now
      
      if (timeLeftMs <= 0) {
        setIsExpired(true)
        setTimeLeft(0)
      } else {
        setTimeLeft(Math.ceil(timeLeftMs / 1000))
      }
    }

    calculateTimeLeft()
    const interval = setInterval(calculateTimeLeft, 1000)

    return () => clearInterval(interval)
  }, [reset])

  // 사용률 계산
  const usagePercentage = ((limit - remaining) / limit) * 100
  const isHighUsage = usagePercentage > 80
  const isCriticalUsage = usagePercentage > 95

  // 시간 포맷팅
  const formatTimeLeft = (seconds: number): string => {
    if (seconds < 60) {
      return `${seconds}초`
    } else if (seconds < 3600) {
      const minutes = Math.floor(seconds / 60)
      return `${minutes}분 ${seconds % 60}초`
    } else {
      const hours = Math.floor(seconds / 3600)
      const minutes = Math.floor((seconds % 3600) / 60)
      return `${hours}시간 ${minutes}분`
    }
  }

  // 상태에 따른 색상 및 아이콘
  const getStatusInfo = () => {
    if (isCriticalUsage) {
      return {
        color: 'text-red-600',
        bgColor: 'bg-red-50 dark:bg-red-950/20',
        borderColor: 'border-red-200',
        icon: <AlertCircle className="w-4 h-4 text-red-600" />,
        status: '위험'
      }
    } else if (isHighUsage) {
      return {
        color: 'text-orange-600',
        bgColor: 'bg-orange-50 dark:bg-orange-950/20',
        borderColor: 'border-orange-200',
        icon: <Clock className="w-4 h-4 text-orange-600" />,
        status: '주의'
      }
    } else {
      return {
        color: 'text-green-600',
        bgColor: 'bg-green-50 dark:bg-green-950/20',
        borderColor: 'border-green-200',
        icon: <CheckCircle className="w-4 h-4 text-green-600" />,
        status: '정상'
      }
    }
  }

  const statusInfo = getStatusInfo()

  if (isExpired) {
    return null // 만료된 경우 표시하지 않음
  }

  return (
    <div className={`p-3 rounded-lg border ${statusInfo.bgColor} ${statusInfo.borderColor}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {statusInfo.icon}
          <span className={`text-sm font-medium ${statusInfo.color}`}>
            API 사용량 {statusInfo.status}
          </span>
          {endpoint && (
            <Badge variant="outline" className="text-xs">
              {endpoint}
            </Badge>
          )}
        </div>
        <span className="text-xs text-muted-foreground">
          {formatTimeLeft(timeLeft)} 후 리셋
        </span>
      </div>

      {/* 사용량 진행률 */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>사용량</span>
          <span>{limit - remaining} / {limit}</span>
        </div>
        <Progress 
          value={usagePercentage} 
          className="h-2"
          style={{
            '--progress-background': isCriticalUsage ? 'rgb(239 68 68)' : 
                                   isHighUsage ? 'rgb(249 115 22)' : 'rgb(34 197 94)'
          } as React.CSSProperties}
        />
      </div>

      {/* 남은 요청 수 */}
      <div className="mt-2 text-center">
        <span className="text-sm text-muted-foreground">
          남은 요청: <span className="font-semibold text-foreground">{remaining}회</span>
        </span>
      </div>

      {/* 경고 메시지 */}
      {isHighUsage && (
        <Alert className="mt-3 border-orange-200 bg-orange-50 dark:bg-orange-950/20">
          <AlertCircle className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800 dark:text-orange-200">
            {isCriticalUsage 
              ? 'API 사용량이 거의 한계에 도달했습니다. 잠시 후 다시 시도해주세요.'
              : 'API 사용량이 높습니다. 요청을 줄여주세요.'
            }
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}

// Rate Limit 오류 메시지 컴포넌트
interface RateLimitErrorProps {
  retryAfter?: number
  limit: number
  reset: number
}

export function RateLimitError({ retryAfter, limit, reset }: RateLimitErrorProps) {
  const formatRetryAfter = (seconds?: number): string => {
    if (!seconds) return '잠시 후'
    
    if (seconds < 60) {
      return `${seconds}초 후`
    } else if (seconds < 3600) {
      const minutes = Math.ceil(seconds / 60)
      return `${minutes}분 후`
    } else {
      const hours = Math.ceil(seconds / 3600)
      return `${hours}시간 후`
    }
  }

  return (
    <Alert className="border-red-200 bg-red-50 dark:bg-red-950/20">
      <AlertCircle className="h-4 w-4 text-red-600" />
      <AlertDescription className="text-red-800 dark:text-red-200">
        요청이 너무 많습니다. {formatRetryAfter(retryAfter)} 다시 시도해주세요.
        <br />
        <span className="text-xs text-red-600 dark:text-red-400">
          제한: {limit}회 / 시간당
        </span>
      </AlertDescription>
    </Alert>
  )
}
