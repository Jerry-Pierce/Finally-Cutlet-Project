"use client"

import { useState, useEffect, useRef } from "react"
import { Bell, X, Check, AlertCircle, Info, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { useLanguage } from "@/contexts/language-context"

interface Notification {
  id: string
  type: 'url_click' | 'url_expired' | 'system'
  title: string
  message: string
  data?: any
  isRead: boolean
  createdAt: string
}

export function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const { user } = useAuth()
  const { toast } = useToast()
  const { t } = useLanguage()
  const wsRef = useRef<WebSocket | null>(null)

  // 알림 목록 로드
  const loadNotifications = async () => {
    if (!user) return

    setIsLoading(true)
    try {
      console.log('알림 로드 시작, 사용자:', user.id)
      
      const response = await fetch('/api/notifications', {
        credentials: 'include'
      })

      console.log('알림 API 응답 상태:', response.status)

      if (response.ok) {
        const result = await response.json()
        console.log('알림 API 응답 데이터:', result)
        
        setNotifications(result.data)
        const unreadCount = result.data.filter((n: Notification) => !n.isRead).length
        setUnreadCount(unreadCount)
        
        console.log('설정된 알림 개수:', result.data.length)
        console.log('읽지 않은 알림 개수:', unreadCount)
      } else {
        console.error('알림 API 오류 응답:', response.status)
      }
    } catch (error) {
      console.error('알림 로드 오류:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // WebSocket 연결
  useEffect(() => {
    if (!user) return

    // WebSocket 연결 (실제로는 Next.js API Routes에서 처리)
    const connectWebSocket = () => {
      try {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
        const wsUrl = `${protocol}//${window.location.host}/api/notifications`
        
        const ws = new WebSocket(wsUrl)
        wsRef.current = ws

        ws.onopen = () => {
          console.log('WebSocket 연결됨')
        }

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data)
            
            if (data.type === 'notification') {
              // 새 알림 추가
              const newNotification: Notification = {
                id: Date.now().toString(),
                type: data.data.type,
                title: data.data.title,
                message: data.data.message,
                data: data.data.data,
                isRead: false,
                createdAt: new Date().toISOString()
              }
              
              setNotifications(prev => [newNotification, ...prev])
              setUnreadCount(prev => prev + 1)
              
              // 토스트 알림 표시
              toast({
                title: data.data.title,
                description: data.data.message,
              })
            }
          } catch (error) {
            console.error('WebSocket 메시지 파싱 오류:', error)
          }
        }

        ws.onclose = () => {
          console.log('WebSocket 연결 해제됨')
          // 재연결 시도 (로그인된 사용자만, 더 긴 간격으로)
          if (user) {
            setTimeout(connectWebSocket, 10000) // 10초 후 재시도
          }
        }

        ws.onerror = (error) => {
          console.error('WebSocket 오류:', error)
          // 오류 발생 시 연결 종료하여 무한 재시도 방지
          if (wsRef.current) {
            wsRef.current.close()
            wsRef.current = null
          }
        }
      } catch (error) {
        console.error('WebSocket 연결 오류:', error)
      }
    }

    // WebSocket 연결은 나중에 구현 예정
    // connectWebSocket()

    return () => {
      if (wsRef.current) {
        wsRef.current.close()
        wsRef.current = null
      }
    }
  }, [user, toast])

  // 알림 메시지 번역 처리
  const translateNotificationMessage = (message: string) => {
    return message
      .replace('{welcomeNotificationTitle}', t('welcomeNotificationTitle'))
      .replace('{welcomeToCutlet}', t('welcomeToCutlet'))
      .replace('{shortenLongUrls}', t('shortenLongUrls'))
      .replace('{qrCodeAndClickAnalysis}', t('qrCodeAndClickAnalysis'))
      .replace('{startNow}', t('startNow'))
      .replace('{premiumUpdateTitle}', t('premiumUpdateTitle'))
      .replace('{premiumUpdateScheduled}', t('premiumUpdateScheduled'))
      .replace('{workingForBetterService}', t('workingForBetterService'))
      .replace('{pleaseSupportWithDonation}', t('pleaseSupportWithDonation'))
  }

  // 알림 제목 번역 처리
  const translateNotificationTitle = (title: string) => {
    if (title === 'welcomeNotificationTitle') return t('welcomeNotificationTitle')
    if (title === 'premiumUpdateTitle') return t('premiumUpdateTitle')
    return title
  }

  // 알림 읽음 처리
  const markAsRead = async (notificationId: string) => {
    try {
      console.log('알림 읽음 처리 시작, ID:', notificationId)
      console.log('현재 사용자:', user)
      console.log('쿠키 확인:', document.cookie)
      
      const response = await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      console.log('읽음 처리 API 응답 상태:', response.status)

      if (response.ok) {
        try {
          const result = await response.json()
          console.log('읽음 처리 성공:', result)
          
          setNotifications(prev => 
            prev.map(n => 
              n.id === notificationId ? { ...n, isRead: true } : n
            )
          )
          setUnreadCount(prev => Math.max(0, prev - 1))
        } catch (parseError) {
          console.error('응답 파싱 오류:', parseError)
          // 파싱 실패해도 UI는 업데이트
          setNotifications(prev => 
            prev.map(n => 
              n.id === notificationId ? { ...n, isRead: true } : n
            )
          )
          setUnreadCount(prev => Math.max(0, prev - 1))
        }
      } else {
        try {
          const errorData = await response.json()
          console.error('읽음 처리 API 오류:', errorData)
        } catch (parseError) {
          console.error('오류 응답 파싱 실패:', parseError)
        }
      }
    } catch (error) {
      console.error('알림 읽음 처리 오류:', error)
    }
  }

  // 모든 알림 읽음 처리
  const markAllAsRead = async () => {
    try {
      const response = await fetch('/api/notifications/read-all', {
        method: 'PATCH',
        credentials: 'include'
      })

      if (response.ok) {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
        setUnreadCount(0)
      }
    } catch (error) {
      console.error('모든 알림 읽음 처리 오류:', error)
    }
  }

  // 알림 타입별 아이콘
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'url_click':
        return <ExternalLink className="w-4 h-4 text-blue-500" />
      case 'url_expired':
        return <AlertCircle className="w-4 h-4 text-orange-500" />
      case 'welcome':
        return <span className="text-2xl">🎉</span>
      case 'premium':
        return <span className="text-2xl">🚀</span>
      case 'system':
        return <Info className="w-4 h-4 text-gray-500" />
      default:
        return <Info className="w-4 h-4 text-gray-500" />
    }
  }

  // 알림 타입별 색상
  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'url_click':
        return 'border-blue-200 bg-blue-50 dark:bg-blue-950/20'
      case 'url_expired':
        return 'border-orange-200 bg-orange-50 dark:bg-blue-950/20'
      case 'welcome':
        return 'border-green-200 bg-green-50 dark:bg-green-950/20'
      case 'premium':
        return 'border-purple-200 bg-purple-50 dark:bg-purple-950/20'
      case 'system':
        return 'border-gray-200 bg-gray-50 dark:bg-gray-950/20'
      default:
        return 'border-gray-200 bg-gray-50 dark:bg-gray-950/20'
    }
  }

  if (!user) return null

  return (
    <div className="relative">
      {/* 알림벨 버튼 */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => {
          const newIsOpen = !isOpen
          setIsOpen(newIsOpen)
          if (newIsOpen) {
            loadNotifications()
          }
        }}
        className="relative p-2"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <Badge 
            variant="destructive" 
            className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </Badge>
        )}
      </Button>

      {/* 알림 패널 */}
      {isOpen && (
        <Card className="absolute right-0 top-12 w-80 max-h-96 overflow-hidden shadow-xl z-50">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">{t("notifications")}</CardTitle>
              <div className="flex gap-2">
                {unreadCount > 0 && (
                                  <Button
                  variant="outline"
                  size="sm"
                  onClick={markAllAsRead}
                  className="text-xs"
                >
                  {t("markAllAsRead")}
                </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  className="p-1 h-8 w-8"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {isLoading ? (
              <div className="text-center py-8">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">{t("loadingNotifications")}</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-8">
                <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-2 opacity-50" />
                <p className="text-sm text-muted-foreground">{t("noNewNotifications")}</p>
              </div>
            ) : (
              <div className="max-h-64 overflow-y-auto">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-3 border-l-4 ${getNotificationColor(notification.type)} ${
                      !notification.isRead ? 'border-l-primary' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className={`text-sm font-medium ${
                            !notification.isRead ? 'text-foreground' : 'text-muted-foreground'
                          }`}>
                            {translateNotificationTitle(notification.title)}
                          </h4>
                          {!notification.isRead && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => markAsRead(notification.id)}
                              className="p-1 h-6 w-6"
                            >
                              <Check className="w-3 h-3" />
                            </Button>
                          )}
                        </div>
                                        <div className="text-sm text-muted-foreground mt-1 whitespace-pre-line">
                  {translateNotificationMessage(notification.message)}
                </div>
                        <p className="text-xs text-muted-foreground mt-2">
                          {new Date(notification.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
