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
import { type Section, type Folder as FolderType } from '@/lib/sections'
import BreadcrumbNavigation from '@/src/components/breadcrumb-navigation'
import { cn } from '@/lib/utils'

export default function FolderEditPage() {
  const params = useParams()
  const router = useRouter()
  const folderId = params.id as string
  const { sections, updateFolder } = useSections()
  
  const [name, setName] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [newTag, setNewTag] = useState('')
  const [description, setDescription] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  // Find folder and its location
  const folderData = useMemo(() => {
    for (const section of sections) {
      function findFolder(items: (FolderType | any)[], path: string[] = []): { folder: FolderType; sectionId: string; path: string[] } | null {
        for (const item of items || []) {
          if (item.type === 'folder' && item.id === folderId) {
            return { folder: item, sectionId: section.id, path }
          }
          if (item.type === 'folder' && item.items) {
            const found = findFolder(item.items, [...path, item.id])
            if (found) return found
          }
        }
        return null
      }
      
      if (section.items) {
        const found = findFolder(section.items)
        if (found) return found
      }
    }
    return null
  }, [sections, folderId])

  // Initialize form data
  useEffect(() => {
    if (folderData) {
      setName(folderData.folder.name)
      // Tags and description can be added to folder type if needed
      // For now, we'll use empty defaults
      setTags([])
      setDescription('')
    }
  }, [folderData])

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
    if (!folderData || !name.trim()) return
    
    setIsSaving(true)
    try {
      updateFolder(folderData.sectionId, folderData.path, name.trim())
      // Navigate back to the folder
      const folderPath = folderData.path.length > 0 
        ? `&folder=${folderData.path.join('/')}` 
        : ''
      router.push(`/documents?section=${folderData.sectionId}${folderPath}`)
    } catch (error) {
      console.error('Error saving folder:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    if (!folderData) {
      router.push('/documents')
      return
    }
    const folderPath = folderData.path.length > 0 
      ? `&folder=${folderData.path.join('/')}` 
      : ''
    router.push(`/documents?section=${folderData.sectionId}${folderPath}`)
  }

  // Build breadcrumb
  const breadcrumbItems = useMemo(() => {
    if (!folderData) return []
    
    const section = sections.find(s => s.id === folderData.sectionId)
    if (!section) return []
    
    const items: Array<{ id: string; name: string; path: string[]; alwaysClickable?: boolean }> = [
      { id: section.id, name: section.name, path: [section.id], alwaysClickable: true }
    ]
    
    // Build path for each folder
    let currentItems: (FolderType | any)[] | undefined = section.items
    const currentPath: string[] = []
    
    for (const folderIdInPath of folderData.path) {
      if (!currentItems) break
      const folder = currentItems.find((item): item is FolderType => item.type === 'folder' && item.id === folderIdInPath)
      if (folder) {
        currentPath.push(folder.id)
        items.push({
          id: folder.id,
          name: folder.name,
          path: [folderData.sectionId, ...currentPath],
        })
        currentItems = folder.items
      } else {
        break
      }
    }
    
    // Add current folder being edited
    if (folderData.folder) {
      items.push({
        id: folderData.folder.id,
        name: folderData.folder.name,
        path: [folderData.sectionId, ...folderData.path, folderData.folder.id],
      })
    }
    
    return items
  }, [folderData, sections])

  if (!folderData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-background">
        <Folder className="h-16 w-16 text-muted-foreground mb-4" />
        <h1 className="text-2xl font-bold text-foreground mb-2">Folder nahi mila</h1>
        <p className="text-muted-foreground mb-4">Ye folder exist nahi karta ya delete ho gaya hai.</p>
        <Button onClick={() => router.push('/documents')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Documents pe wapas jao
        </Button>
      </div>
    )
  }

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
                const folderPathSegments = path.slice(1)
                const folderQuery = folderPathSegments.length > 0 
                  ? `&folder=${folderPathSegments.join('/')}` 
                  : ''
                router.push(`/documents?section=${sectionId}${folderQuery}`)
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
                <h1 className="text-2xl font-bold text-card-foreground">Edit Folder</h1>
                <p className="text-sm text-muted-foreground">Update folder details and metadata</p>
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
              Folder Name *
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter folder name"
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
              placeholder="Add a description for this folder"
              className="w-full min-h-[100px]"
              rows={4}
            />
          </div>

          {/* Folder Info */}
          <div className="pt-4 border-t border-border">
            <h3 className="text-sm font-semibold text-foreground mb-3">Folder Information</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Items</p>
                <p className="text-foreground font-medium">
                  {folderData.folder.items?.length || 0} items
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Folders</p>
                <p className="text-foreground font-medium">
                  {folderData.folder.items?.filter((item: any) => item.type === 'folder').length || 0}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Files</p>
                <p className="text-foreground font-medium">
                  {folderData.folder.items?.filter((item: any) => item.type === 'file').length || 0}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

