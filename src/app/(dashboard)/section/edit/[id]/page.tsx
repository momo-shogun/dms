'use client'

import { useState, useMemo, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Save, X, Tag as TagIcon, Folder } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useSections } from '@/lib/sections-context'
import { type Section } from '@/lib/sections'
import BreadcrumbNavigation from '@/src/components/breadcrumb-navigation'
import { cn } from '@/lib/utils'

export default function SectionEditPage() {
  const params = useParams()
  const router = useRouter()
  const sectionId = params.id as string
  const { sections, updateSection } = useSections()
  
  const [name, setName] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [newTag, setNewTag] = useState('')
  const [description, setDescription] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  // Find section
  const section = useMemo(() => {
    return sections.find(s => s.id === sectionId) || null
  }, [sections, sectionId])

  // Initialize form data
  useEffect(() => {
    if (section) {
      setName(section.name)
      // Tags and description can be added to section type if needed
      // For now, we'll use empty defaults
      setTags([])
      setDescription('')
    }
  }, [section])

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()])
      setNewTag('')
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove))
  }

  const handleSave = async () => {
    if (!section || !name.trim()) return
    
    setIsSaving(true)
    try {
      updateSection(sectionId, name.trim())
      // Navigate back to the section
      router.push(`/documents?section=${sectionId}`)
    } catch (error) {
      console.error('Error saving section:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    if (!section) {
      router.push('/documents')
      return
    }
    router.push(`/documents?section=${sectionId}`)
  }

  if (!section) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-background">
        <Folder className="h-16 w-16 text-muted-foreground mb-4" />
        <h1 className="text-2xl font-bold text-foreground mb-2">Section nahi mila</h1>
        <p className="text-muted-foreground mb-4">Ye section exist nahi karta ya delete ho gaya hai.</p>
        <Button onClick={() => router.push('/documents')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Documents pe wapas jao
        </Button>
      </div>
    )
  }

  // Count items in section
  const totalItems = section.items?.length || 0
  const folderCount = section.items?.filter(item => item.type === 'folder').length || 0
  const fileCount = section.items?.filter(item => item.type === 'file').length || 0

  // Build breadcrumb
  const breadcrumbItems = useMemo(() => {
    if (!section) return []
    
    return [
      { id: section.id, name: section.name, path: [section.id], alwaysClickable: true }
    ]
  }, [section])

  return (
    <div className="min-h-screen bg-background">
      <div className="w-full">
        {/* Breadcrumb */}
        {breadcrumbItems.length > 0 && (
          <div className="mb-4 px-6 pt-6">
            <BreadcrumbNavigation
              items={breadcrumbItems}
              onNavigate={(path) => {
                const sectionId = path[0]
                router.push(`/documents?section=${sectionId}`)
              }}
            />
          </div>
        )}

        {/* Header */}
        <div className="px-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <Folder className="h-5 w-5 text-muted-foreground" />
            <h1 className="text-2xl font-semibold text-foreground">{section.name}</h1>
          </div>
        </div>

        {/* Form */}
        <div className="px-6 pb-6 space-y-6">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium text-primary">
              Name
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter section name"
              className="w-full max-w-md"
              autoFocus
            />
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label htmlFor="tags" className="text-sm font-medium text-primary">
              Tags
            </Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="flex items-center gap-1 px-2 py-1"
                >
                  {tag}
                  <button
                    onClick={() => handleRemoveTag(tag)}
                    className="ml-1 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
            <Input
              id="tags"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  handleAddTag()
                }
              }}
              placeholder="Type or click here"
              className="w-full max-w-md"
            />
          </div>

          {/* Description/Notes */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium text-primary">
              Notes
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add notes"
              className="w-full max-w-2xl min-h-[120px]"
              rows={6}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 pt-4">
            <Button variant="outline" onClick={handleCancel} disabled={isSaving}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaving || !name.trim()}>
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

