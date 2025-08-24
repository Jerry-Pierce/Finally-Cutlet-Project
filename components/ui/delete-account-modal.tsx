"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Trash2, AlertTriangle, Eye, EyeOff } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"

interface DeleteAccountModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (password: string) => void
  isLoading?: boolean
}

export function DeleteAccountModal({ isOpen, onClose, onConfirm, isLoading = false }: DeleteAccountModalProps) {
  const { t } = useLanguage()
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [step, setStep] = useState<"password" | "confirm">("password")
  const [dataSummary, setDataSummary] = useState<any>(null)

  const handlePasswordSubmit = async () => {
    if (!password.trim()) return
    
    try {
      // 계정 삭제 확인 API 호출
      const response = await fetch('/api/user/delete-account/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ password })
      })

      if (response.ok) {
        const result = await response.json()
        setDataSummary(result.dataSummary)
        setStep("confirm")
      } else {
        const error = await response.json()
        alert(error.error || "비밀번호가 올바르지 않습니다.")
      }
    } catch (error) {
      alert("계정 삭제 확인 중 오류가 발생했습니다.")
    }
  }

  const handleFinalConfirm = () => {
    onConfirm(password)
  }

  const handleClose = () => {
    setPassword("")
    setStep("password")
    setDataSummary(null)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <Trash2 className="h-5 w-5" />
            {t("accountDeletion")}
          </DialogTitle>
          <DialogDescription>
            {step === "password" 
              ? t("enterPasswordToDeleteAccount")
              : t("reallyDeleteAccount")
            }
          </DialogDescription>
        </DialogHeader>

        {step === "password" ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">{t("password")}</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t("enterCurrentPassword")}
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                {t("accountDeletionWarning")}
              </AlertDescription>
            </Alert>
          </div>
        ) : (
          <div className="space-y-4">
            <Alert className="border-destructive bg-destructive/10">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              <AlertDescription className="text-destructive">
                {t("deleteDataSummary")}
              </AlertDescription>
            </Alert>
            
            {dataSummary && (
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>{t("shortenedUrls")}:</span>
                  <span className="font-medium">{dataSummary.urlCount}개</span>
                </div>
                <div className="flex justify-between">
                  <span>{t("clickRecords")}:</span>
                  <span className="font-medium">{dataSummary.clickCount}개</span>
                </div>
                <div className="flex justify-between">
                  <span>{t("tags")}:</span>
                  <span className="font-medium">{dataSummary.tagCount}개</span>
                </div>
                <div className="flex justify-between">
                  <span>{t("favorites")}:</span>
                  <span className="font-medium">{dataSummary.favoriteCount}개</span>
                </div>
              </div>
            )}

            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                {t("thisActionCannotBeUndone")}
              </AlertDescription>
            </Alert>
          </div>
        )}

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleClose}>
            {t("cancel")}
          </Button>
          {step === "password" ? (
            <Button 
              onClick={handlePasswordSubmit}
              disabled={!password.trim() || isLoading}
              variant="destructive"
            >
              {isLoading ? t("checking") : t("next")}
            </Button>
          ) : (
            <Button 
              onClick={handleFinalConfirm}
              disabled={isLoading}
              variant="destructive"
            >
              {isLoading ? t("deleting") : t("deleteAccount")}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
