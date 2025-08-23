"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useLanguage } from "@/contexts/language-context"
// Globe 아이콘 사용 대신 텍스트로 대체하여 런타임 오류 회피

const languages = [
  { code: "en", name: "English", flag: "🇺🇸" },
  { code: "ko", name: "한국어", flag: "🇰🇷" },
  { code: "ja", name: "日本語", flag: "🇯🇵" },
  { code: "zh", name: "中文", flag: "🇨🇳" },
  { code: "ru", name: "Русский", flag: "🇷🇺" },
  { code: "fr", name: "Français", flag: "🇫🇷" },
  { code: "de", name: "Deutsch", flag: "🇩🇪" },
] as const

export function LanguageSelector() {
  const { language, setLanguage } = useLanguage()

  return (
    <Select value={language} onValueChange={setLanguage}>
      <SelectTrigger className="w-[140px] bg-card/50 border-border/50 shadow-md hover:shadow-lg transition-all duration-300">
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">🌐</span>
          <SelectValue />
        </div>
      </SelectTrigger>
      <SelectContent>
        {languages.map((lang) => (
          <SelectItem key={lang.code} value={lang.code}>
            <div className="flex items-center gap-2">
              <span>{lang.flag}</span>
              <span>{lang.name}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
