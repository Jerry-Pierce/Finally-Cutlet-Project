"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
import { 
  Plus, 
  Edit, 
  Trash2, 
  Tag, 
  Palette, 
  MoreVertical,
  Check,
  X
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface TagData {
  id: string
  name: string
  color: string
  description?: string
  _count?: {
    urlTags: number
  }
}

interface TagManagerProps {
  onTagsChange?: () => void
  className?: string
}

const PRESET_COLORS = [
  '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6',
  '#06b6d4', '#84cc16', '#f97316', '#ec4899', '#6b7280'
]

export default function TagManager({ onTagsChange, className }: TagManagerProps) {
  const { toast } = useToast()
  const [tags, setTags] = useState<TagData[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editingTag, setEditingTag] = useState<TagData | null>(null)
  
  // 폼 상태
  const [formData, setFormData] = useState({
    name: '',
    color: '#3b82f6',
    description: ''
  })

  // 태그 로드
  useEffect(() => {
    loadTags()
  }, [])

  const loadTags = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/tags', {
        credentials: 'include'
      })
      
      if (response.ok) {
        const result = await response.json()
        setTags(result.data)
      }
    } catch (error) {
      console.error('태그 로드 오류:', error)
      toast({
        title: "오류 발생",
        description: "태그를 불러오는데 실패했습니다.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateTag = async () => {
    if (!formData.name.trim()) {
      toast({
        title: "오류",
        description: "태그명을 입력해주세요.",
        variant: "destructive"
      })
      return
    }

    setIsCreating(true)
    try {
      const response = await fetch('/api/tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        const result = await response.json()
        toast({
          title: "성공!",
          description: result.message,
        })
        
        // 폼 초기화
        setFormData({
          name: '',
          color: '#3b82f6',
          description: ''
        })
        
        // 태그 목록 새로고침
        await loadTags()
        onTagsChange?.()
      } else {
        const error = await response.json()
        toast({
          title: "오류 발생",
          description: error.error || "태그 생성에 실패했습니다.",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('태그 생성 오류:', error)
      toast({
        title: "오류 발생",
        description: "네트워크 오류가 발생했습니다.",
        variant: "destructive"
      })
    } finally {
      setIsCreating(false)
    }
  }

  const handleEditTag = async () => {
    if (!editingTag || !formData.name.trim()) {
      toast({
        title: "오류",
        description: "태그명을 입력해주세요.",
        variant: "destructive"
      })
      return
    }

    setIsEditing(true)
    try {
      const response = await fetch('/api/tags', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          tags: [{
            id: editingTag.id,
            ...formData
          }]
        })
      })

      if (response.ok) {
        const result = await response.json()
        toast({
          title: "성공!",
          description: result.message,
        })
        
        // 편집 모드 종료
        setEditingTag(null)
        setFormData({
          name: '',
          color: '#3b82f6',
          description: ''
        })
        
        // 태그 목록 새로고침
        await loadTags()
        onTagsChange?.()
      } else {
        const error = await response.json()
        toast({
          title: "오류 발생",
          description: error.error || "태그 수정에 실패했습니다.",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('태그 수정 오류:', error)
      toast({
        title: "오류 발생",
        description: "네트워크 오류가 발생했습니다.",
        variant: "destructive"
      })
    } finally {
      setIsEditing(false)
    }
  }

  const handleDeleteTag = async (tagId: string, tagName: string) => {
    if (!confirm(`태그 "${tagName}"을(를) 삭제하시겠습니까?`)) {
      return
    }

    try {
      const response = await fetch(`/api/tags?id=${tagId}`, {
        method: 'DELETE',
        credentials: 'include'
      })

      if (response.ok) {
        const result = await response.json()
        toast({
          title: "삭제 완료",
          description: result.message,
        })
        
        // 태그 목록 새로고침
        await loadTags()
        onTagsChange?.()
      } else {
        const error = await response.json()
        toast({
          title: "오류 발생",
          description: error.error || "태그 삭제에 실패했습니다.",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('태그 삭제 오류:', error)
      toast({
        title: "오류 발생",
        description: "네트워크 오류가 발생했습니다.",
        variant: "destructive"
      })
    }
  }

  const startEdit = (tag: TagData) => {
    setEditingTag(tag)
    setFormData({
      name: tag.name,
      color: tag.color,
      description: tag.description || ''
    })
  }

  const cancelEdit = () => {
    setEditingTag(null)
    setFormData({
      name: '',
      color: '#3b82f6',
      description: ''
    })
  }

  const isSystemTag = (tag: TagData) => tag.id.startsWith('system_') || tag.id.includes('default')

  return (
    <div className={className}>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="flex items-center gap-2">
            <Tag className="w-5 h-5" />
            태그 관리
          </CardTitle>
          
          <Dialog>
            <DialogTrigger asChild>
              <Button size="sm" className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                새 태그
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>새 태그 생성</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="tagName">태그명</Label>
                  <Input
                    id="tagName"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="태그명을 입력하세요"
                    maxLength={50}
                  />
                </div>
                
                <div>
                  <Label>색상</Label>
                  <div className="flex items-center gap-3 mt-2">
                    <div
                      className="w-10 h-10 rounded-full border-2 border-border cursor-pointer"
                      style={{ backgroundColor: formData.color }}
                      onClick={() => {
                        const input = document.createElement('input')
                        input.type = 'color'
                        input.value = formData.color
                        input.onchange = (e) => {
                          const target = e.target as HTMLInputElement
                          setFormData({ ...formData, color: target.value })
                        }
                        input.click()
                      }}
                    />
                    
                    <div className="flex gap-2">
                      {PRESET_COLORS.map((color) => (
                        <button
                          key={color}
                          className="w-6 h-6 rounded-full border-2 border-border hover:scale-110 transition-transform"
                          style={{ backgroundColor: color }}
                          onClick={() => setFormData({ ...formData, color })}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="tagDescription">설명 (선택사항)</Label>
                  <Input
                    id="tagDescription"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="태그에 대한 설명을 입력하세요"
                    maxLength={200}
                  />
                </div>
                
                <div className="flex gap-2 pt-4">
                  <Button
                    onClick={handleCreateTag}
                    disabled={isCreating}
                    className="flex-1"
                  >
                    {isCreating ? "생성 중..." : "태그 생성"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>
        
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              태그를 불러오는 중...
            </div>
          ) : tags.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Tag className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
              <p>아직 생성된 태그가 없습니다.</p>
              <p className="text-sm">새 태그를 만들어보세요!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {tags.map((tag) => (
                <div
                  key={tag.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-border/50 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Badge
                      style={{ backgroundColor: tag.color, color: 'white' }}
                      className="border-0"
                    >
                      {tag.name}
                    </Badge>
                    
                    {tag.description && (
                      <span className="text-sm text-muted-foreground">
                        {tag.description}
                      </span>
                    )}
                    
                    <span className="text-xs text-muted-foreground">
                      {tag._count?.urlTags || 0}개 URL
                    </span>
                    
                    {isSystemTag(tag) && (
                      <Badge variant="secondary" className="text-xs">
                        시스템
                      </Badge>
                    )}
                  </div>
                  
                  {!isSystemTag(tag) && (
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => startEdit(tag)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteTag(tag.id, tag.name)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 태그 편집 다이얼로그 */}
      {editingTag && (
        <Dialog open={!!editingTag} onOpenChange={() => cancelEdit()}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>태그 편집</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="editTagName">태그명</Label>
                <Input
                  id="editTagName"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="태그명을 입력하세요"
                  maxLength={50}
                />
              </div>
              
              <div>
                <Label>색상</Label>
                <div className="flex items-center gap-3 mt-2">
                  <div
                    className="w-10 h-10 rounded-full border-2 border-border cursor-pointer"
                    style={{ backgroundColor: formData.color }}
                    onClick={() => {
                      const input = document.createElement('input')
                      input.type = 'color'
                      input.value = formData.color
                      input.onchange = (e) => {
                        const target = e.target as HTMLInputElement
                        setFormData({ ...formData, color: target.value })
                      }
                      input.click()
                    }}
                  />
                  
                  <div className="flex gap-2">
                    {PRESET_COLORS.map((color) => (
                      <button
                        key={color}
                        className="w-6 h-6 rounded-full border-2 border-border hover:scale-110 transition-transform"
                        style={{ backgroundColor: color }}
                        onClick={() => setFormData({ ...formData, color })}
                      />
                    ))}
                  </div>
                </div>
              </div>
              
              <div>
                <Label htmlFor="editTagDescription">설명 (선택사항)</Label>
                <Input
                  id="editTagDescription"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="태그에 대한 설명을 입력하세요"
                  maxLength={200}
                />
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={cancelEdit}
                  className="flex-1"
                >
                  취소
                </Button>
                <Button
                  onClick={handleEditTag}
                  disabled={isEditing}
                  className="flex-1"
                >
                  {isEditing ? "수정 중..." : "수정 완료"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
