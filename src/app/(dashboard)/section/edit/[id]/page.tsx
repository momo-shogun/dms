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
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        {/* Breadcrumb */}
        {breadcrumbItems.length > 0 && (
          <div className="mb-6">
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
        <div className="bg-card border border-border rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Folder className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-card-foreground">Edit Section</h1>
                <p className="text-sm text-muted-foreground">Update section details and metadata</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
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

        {/* Form */}
        <div className="bg-card border border-border rounded-lg p-6 space-y-6">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium text-foreground">
              Section Name *
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter section name"
              className="w-full"
              autoFocus
            />
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label htmlFor="tags" className="text-sm font-medium text-foreground">
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
            <div className="flex gap-2">
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
                placeholder="Add a tag and press Enter"
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleAddTag}
                disabled={!newTag.trim()}
              >
                <TagIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium text-foreground">
              Description
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add a description for this section"
              className="w-full min-h-[100px]"
              rows={4}
            />
          </div>

          {/* Section Info */}
          <div className="pt-4 border-t border-border">
            <h3 className="text-sm font-semibold text-foreground mb-3">Section Information</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Items</p>
                <p className="text-foreground font-medium">
                  {totalItems} items
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Folders</p>
                <p className="text-foreground font-medium">
                  {folderCount}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Files</p>
                <p className="text-foreground font-medium">
                  {fileCount}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

