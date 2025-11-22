'use client'

import { useState, useMemo, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Save, X, Tag as TagIcon, FileText, Calendar, User, File } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useSections } from '@/lib/sections-context'
import { getAllFiles, findFileLocation, type FileItem, type Section, type Folder } from '@/lib/sections'
import BreadcrumbNavigation from '@/src/components/breadcrumb-navigation'
import { FileTypeIcon } from '@/src/components/file-type-icons'
import { cn } from '@/lib/utils'

export default function FileEditPage() {
  const params = useParams()
  const router = useRouter()
  const fileId = params.id as string
  const { sections, updateFile } = useSections()
  
  const [name, setName] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [newTag, setNewTag] = useState('')
  const [description, setDescription] = useState('')
  const [author, setAuthor] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  // Find file and its location
  const fileData = useMemo(() => {
    for (const section of sections) {
      const files = getAllFiles(section)
      const found = files.find((file: FileItem) => file.id === fileId)
      if (found) {
        const location = findFileLocation(sections, fileId)
        return { file: found, location }
      }
    }
    return null
  }, [sections, fileId])

  // Initialize form data
  useEffect(() => {
    if (fileData?.file) {
      setName(fileData.file.name)
      setTags(fileData.file.tags || [])
      setAuthor(fileData.file.author || '')
      setDescription('') // Description can be added to file type if needed
    }
  }, [fileData])

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
    if (!fileData || !name.trim()) return
    
    setIsSaving(true)
    try {
      updateFile(fileId, {
        name: name.trim(),
        tags,
        author: author.trim() || fileData.file.author,
      })
      
      // Navigate back to the file detail page
      router.push(`/documents/${fileId}`)
    } catch (error) {
      console.error('Error saving file:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    if (fileData) {
      router.push(`/documents/${fileId}`)
    } else {
      router.push('/documents')
    }
  }

  // Build breadcrumb
  const breadcrumbItems = useMemo(() => {
    if (!fileData?.location || !fileData.file || !fileData.location) return []
    
    const section = sections.find(s => s.id === fileData.location!.sectionId)
    if (!section) return []
    
    const items: Array<{ id: string; name: string; path: string[]; isFile?: boolean; fileType?: string; alwaysClickable?: boolean }> = [
      { id: section.id, name: section.name, path: [section.id], alwaysClickable: true }
    ]
    
    // Build path for each folder
    let currentItems: (Folder | FileItem)[] | undefined = section.items
    const currentPath: string[] = []
    
    for (const folderId of fileData.location.folderPath) {
      if (!currentItems) break
      const folder = currentItems.find((item): item is Folder => item.type === 'folder' && item.id === folderId)
      if (folder) {
        currentPath.push(folder.id)
        items.push({
          id: folder.id,
          name: folder.name,
          path: [fileData.location.sectionId, ...currentPath],
        })
        currentItems = folder.items
      } else {
        break
      }
    }
    
    // Add file
    items.push({
      id: fileData.file.id,
      name: fileData.file.name,
      path: [fileData.location.sectionId, ...fileData.location.folderPath, fileData.file.id],
      isFile: true,
      fileType: fileData.file.fileType,
    })
    
    return items
  }, [fileData, sections])

  if (!fileData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-background">
        <FileText className="h-16 w-16 text-muted-foreground mb-4" />
        <h1 className="text-2xl font-bold text-foreground mb-2">File nahi mila</h1>
        <p className="text-muted-foreground mb-4">Ye file exist nahi karta ya delete ho gaya hai.</p>
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
                const folderPathSegments = path.slice(1, path.length - (path[path.length - 1] === fileId ? 1 : 0))
                const folderQuery = folderPathSegments.length > 0 
                  ? `&folder=${folderPathSegments.join('/')}` 
                  : ''
                if (path[path.length - 1] === fileId) {
                  router.push(`/documents/${fileId}`)
                } else {
                  router.push(`/documents?section=${sectionId}${folderQuery}`)
                }
              }}
            />
          </div>
        )}

        {/* Header */}
        <div className="bg-card border border-border rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <FileTypeIcon fileType={fileData.file.fileType} className="h-6 w-6 text-primary" size={24} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-card-foreground">Edit File</h1>
                <p className="text-sm text-muted-foreground">Update file details and metadata</p>
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
              File Name *
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter file name"
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

          {/* Author */}
          <div className="space-y-2">
            <Label htmlFor="author" className="text-sm font-medium text-foreground">
              Author
            </Label>
            <Input
              id="author"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="Enter author name"
              className="w-full"
            />
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
              placeholder="Add a description for this file"
              className="w-full min-h-[100px]"
              rows={4}
            />
          </div>

          {/* File Info */}
          <div className="pt-4 border-t border-border">
            <h3 className="text-sm font-semibold text-foreground mb-3">File Information</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground flex items-center gap-2">
                  <File className="h-4 w-4" />
                  Size
                </p>
                <p className="text-foreground font-medium">{fileData.file.size}</p>
              </div>
              <div>
                <p className="text-muted-foreground flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Last Modified
                </p>
                <p className="text-foreground font-medium">
                  {new Date(fileData.file.lastModified).toLocaleDateString('en-IN', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Created At
                </p>
                <p className="text-foreground font-medium">
                  {new Date(fileData.file.createdAt).toLocaleDateString('en-IN', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Created By
                </p>
                <p className="text-foreground font-medium">{fileData.file.author}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

