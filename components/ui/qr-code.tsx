"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { QrCode, Download, Copy, Check } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface QRCodeProps {
  url: string
  code: string
  title?: string
}

export function QRCode({ url, code, title }: QRCodeProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const { toast } = useToast()

  const qrImageUrl = `/api/qr/${code}`

  const handleDownload = async () => {
    try {
      setIsLoading(true)
      
      const response = await fetch(qrImageUrl)
      const blob = await response.blob()
      
      const downloadUrl = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = `qr-code-${code}.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(downloadUrl)
      
      toast({
        title: "다운로드 완료",
        description: "QR 코드가 성공적으로 다운로드되었습니다.",
      })
    } catch (error) {
      console.error('QR 코드 다운로드 오류:', error)
      toast({
        title: "다운로드 실패",
        description: "QR 코드 다운로드에 실패했습니다.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      
      toast({
        title: "복사 완료",
        description: "URL이 클립보드에 복사되었습니다.",
      })
      
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      toast({
        title: "복사 실패",
        description: "URL 복사에 실패했습니다.",
        variant: "destructive"
      })
    }
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader className="text-center pb-4">
        <CardTitle className="flex items-center justify-center gap-2">
          <QrCode className="w-5 h-5 text-primary" />
          QR 코드
        </CardTitle>
        {title && (
          <p className="text-sm text-muted-foreground">{title}</p>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {/* QR 코드 이미지 */}
        <div className="flex justify-center">
          <div className="relative">
            <img
              src={qrImageUrl}
              alt={`QR Code for ${url}`}
              className="w-48 h-48 border border-border/50 rounded-lg shadow-lg"
            />
            <div className="absolute inset-0 bg-black/5 rounded-lg" />
          </div>
        </div>

        {/* URL 표시 */}
        <div className="text-center">
          <p className="text-xs text-muted-foreground mb-1">단축된 URL</p>
          <p className="font-mono text-sm text-primary break-all">
            {url}
          </p>
        </div>

        {/* 액션 버튼들 */}
        <div className="flex gap-2">
          <Button
            onClick={handleDownload}
            disabled={isLoading}
            variant="outline"
            className="flex-1"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                다운로드
              </>
            )}
          </Button>
          
          <Button
            onClick={handleCopyUrl}
            variant="outline"
            className="flex-1"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 mr-2" />
                복사됨
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 mr-2" />
                URL 복사
              </>
            )}
          </Button>
        </div>

        {/* 사용법 안내 */}
        <div className="text-center text-xs text-muted-foreground">
          <p>QR 코드를 스캔하여 링크에 접속하세요</p>
        </div>
      </CardContent>
    </Card>
  )
}
