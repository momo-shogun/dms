'use client'

// Documents Page with filtering and multiple view modes - Using Static Data

import { useState, Suspense, useMemo, Fragment, useTransition } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import {
  Search,
  Grid3X3,
  List,
  Upload,
  SortAsc,
  SortDesc,
  Plus,
  ChevronRight,
  Folder as FolderIcon,
  FileText,
  X,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import DocumentsListView from '@/src/components/documents-list-view'
import DocumentsGalleryView from '@/src/components/documents-gallery-view'
import DocumentsUploadArea from '@/src/components/documents-upload-area'
import DocumentsHeader from '@/src/components/documents-header'
import { CreateFolderDialog } from '@/components/dialogs/create-folder-dialog'
import { MoveDialog } from '@/components/dialogs/move-dialog'
import { useSections } from '@/lib/sections-context'
import { getAllFiles, type Section, type Folder, type FileItem } from '@/lib/sections'
import type { DocumentItem, FolderItem } from '@/src/components/documents-list-view'
import BreadcrumbNavigation from '@/src/components/breadcrumb-navigation'
import { FileExplorerSkeleton, ListViewSkeleton, BreadcrumbSkeleton } from '@/src/components/skeleton-loader'

// Helper function to convert FileItem to DocumentItem
function fileItemToDocumentItem(file: FileItem, sectionId: string): DocumentItem {
  return {
    id: file.id,
    name: file.name,
    size: file.size,
    type: file.fileType,
    lastModified: file.lastModified,
    createdAt: file.createdAt,
    author: file.author,
    tags: file.tags,
    isStarred: file.isStarred,
    sectionId: sectionId,
  }
}

// Type for display items (can be folder or file)
export type DisplayItem = {
  type: 'folder' | 'file'
  id: string
  name: string
  sectionId: string
  path: string[]
  // File properties
  size?: string
  fileType?: string
  lastModified?: string
  createdAt?: string
  author?: string
  tags?: string[]
  isStarred?: boolean
  // Folder properties
  itemCount?: number
  folderCount?: number
  fileCount?: number
}

// Helper function to find folder by ID recursively (handles nested folders)
function findFolderByIdRecursive(items: (Folder | FileItem)[], folderId: string, currentPath: string[] = []): { folder: Folder; path: string[] } | null {
  for (const item of items) {
    if (item.type === 'folder') {
      const newPath = [...currentPath, item.id]
      
      if (item.id === folderId) {
        return { folder: item, path: newPath }
      }
      
      // Search in nested folders
      if (item.items) {
        const found = findFolderByIdRecursive(item.items, folderId, newPath)
        if (found) return found
      }
    }
  }
  return null
}

// Helper function to get all items (folders + files) from current location
function getDisplayItems(section: Section, folderPath: string[]): DisplayItem[] {
  const items: DisplayItem[] = []
  
  if (folderPath.length === 0) {
    // At section level - show folders and files directly in section
    if (section.items) {
      section.items.forEach(item => {
        if (item.type === 'folder') {
          const folderCount = item.items?.filter(i => i.type === 'folder').length || 0
          const fileCount = item.items?.filter(i => i.type === 'file').length || 0
          items.push({
            type: 'folder',
            id: item.id,
            name: item.name,
            sectionId: section.id,
            path: [section.id, item.id],
            itemCount: (item.items?.length || 0),
            folderCount,
            fileCount,
          })
        } else {
          items.push({
            type: 'file',
            id: item.id,
            name: item.name,
            sectionId: section.id,
            path: [section.id],
            size: item.size,
            fileType: item.fileType,
            lastModified: item.lastModified,
            createdAt: item.createdAt,
            author: item.author,
            tags: item.tags,
            isStarred: item.isStarred,
          })
        }
      })
    }
  } else {
    // Inside a folder - find folder using recursive search if needed
    let folder: Folder | null = null
    let actualPath = folderPath
    
    // First try direct path
    folder = findFolderInSection(section, folderPath)
    
    // If not found and path has only one item, search recursively
    if (!folder && folderPath.length === 1 && section.items) {
      const found = findFolderByIdRecursive(section.items, folderPath[0])
      if (found) {
        folder = found.folder
        actualPath = found.path
      }
    }
    
    if (folder && folder.items) {
      folder.items.forEach(item => {
        if (item.type === 'folder') {
          const folderCount = item.items?.filter(i => i.type === 'folder').length || 0
          const fileCount = item.items?.filter(i => i.type === 'file').length || 0
          items.push({
            type: 'folder',
            id: item.id,
            name: item.name,
            sectionId: section.id,
            path: [section.id, ...actualPath, item.id],
            itemCount: (item.items?.length || 0),
            folderCount,
            fileCount,
          })
        } else {
          items.push({
            type: 'file',
            id: item.id,
            name: item.name,
            sectionId: section.id,
            path: [section.id, ...actualPath],
            size: item.size,
            fileType: item.fileType,
            lastModified: item.lastModified,
            createdAt: item.createdAt,
            author: item.author,
            tags: item.tags,
            isStarred: item.isStarred,
          })
        }
      })
    }
  }
  
  return items
}

// Helper function to find folder by path in nested structure
function findFolderInSection(section: Section, path: string[]): Folder | null {
  if (path.length === 0) return null
  
  function findInItems(items: (Folder | FileItem)[], ids: string[]): Folder | null {
    if (ids.length === 0) return null
    const [id, ...remaining] = ids
    const item = items.find(i => i.id === id)
    if (!item || item.type !== 'folder') return null
    if (remaining.length === 0) return item
    if (item.items) {
      return findInItems(item.items, remaining)
    }
    return null
  }
  
  if (section.items) {
    return findInItems(section.items, path)
  }
  return null
}

// Helper function to get all files from a folder path
function getFilesFromPath(section: Section, path: string[]): FileItem[] {
  if (path.length === 0) {
    return getAllFiles(section)
  }
  
  const folder = findFolderInSection(section, path)
  if (!folder || !folder.items) return []
  
  const files: FileItem[] = []
  function traverse(items: (Folder | FileItem)[]) {
    for (const item of items) {
      if (item.type === 'file') {
        files.push(item)
      } else if (item.type === 'folder' && item.items) {
        traverse(item.items)
      }
    }
  }
  traverse(folder.items)
  return files
}

function DocumentsContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { sections, moveFiles } = useSections()
  const [isPending, startTransition] = useTransition()
  const [searchTerm, setSearchTerm] = useState(searchParams?.get('q') || '')
  const [sortBy, setSortBy] = useState('lastModified')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [filterType, setFilterType] = useState('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list')
  const [isViewTransitioning, setIsViewTransitioning] = useState(false)
  const [showUploadArea, setShowUploadArea] = useState(false)
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([])
  const [isFolderDialogOpen, setIsFolderDialogOpen] = useState(false)
  const [isMoveDialogOpen, setIsMoveDialogOpen] = useState(false)
  const [navigationDirection, setNavigationDirection] = useState<'forward' | 'back' | null>(null)
  
  // Get section ID and folder path from URL params
  const sectionId = searchParams?.get('section') || null
  const folderParam = searchParams?.get('folder')
  const folderPath = folderParam ? folderParam.split('/') : []
  
  // Get current section (default to first section if none specified)
  const currentSection = useMemo(() => {
    if (sectionId) {
      return sections.find(s => s.id === sectionId) || sections[0]
    }
    return sections[0] || null
  }, [sectionId, sections])

  // Get current folder if folderPath is provided
  const currentFolder = useMemo(() => {
    if (folderPath.length > 0 && currentSection) {
      return findFolderInSection(currentSection, folderPath)
    }
    return null
  }, [folderPath, currentSection])
  
  // Helper function to find full path to a folder by searching recursively
  function findFolderPath(items: (Folder | FileItem)[], targetId: string, currentPath: string[] = []): string[] | null {
    for (const item of items) {
      if (item.type === 'folder') {
        const newPath = [...currentPath, item.id]
        
        if (item.id === targetId) {
          return newPath
        }
        
        // Search in nested folders
        if (item.items) {
          const found = findFolderPath(item.items, targetId, newPath)
          if (found) return found
        }
      }
    }
    return null
  }

  // Get breadcrumb path (all folders in the path) - handles nested folders correctly
  const breadcrumbPath = useMemo(() => {
    if (!currentSection || folderPath.length === 0) return []
    
    const path: Array<{ id: string; name: string; path: string[] }> = []
    
    // If folderPath has only one item, check if it's nested and find full path
    let actualFolderPath = folderPath
    if (folderPath.length === 1 && currentSection.items) {
      // Check if folder exists at root level
      const rootFolder = currentSection.items.find(
        (item): item is Folder => item.type === 'folder' && item.id === folderPath[0]
      )
      
      // If not found at root, search recursively for full path
      if (!rootFolder) {
        const fullPath = findFolderPath(currentSection.items, folderPath[0])
        if (fullPath) {
          actualFolderPath = fullPath
        }
      }
    }
    
    // Build breadcrumb path sequentially
    let currentItems: (Folder | FileItem)[] | undefined = currentSection.items
    
    for (let i = 0; i < actualFolderPath.length; i++) {
      const folderId = actualFolderPath[i]
      if (!currentItems) break
      
      // Find the folder in current items
      const folder = currentItems.find(
        (item): item is Folder => item.type === 'folder' && item.id === folderId
      )
      
      if (folder) {
        // Build the full path up to this point (section + all previous folders + current)
        const fullPath = [currentSection.id, ...actualFolderPath.slice(0, i + 1)]
        
        path.push({
          id: folder.id,
          name: folder.name,
          path: fullPath,
        })
        
        // Move to next level
        currentItems = folder.items
      } else {
        // Folder not found - break to avoid showing incorrect path
        break
      }
    }
    
    return path
  }, [currentSection, folderPath])
  
  // Get display items (folders + files) from current section/folder
  const displayItems = useMemo(() => {
    if (!currentSection) return []
    return getDisplayItems(currentSection, folderPath)
  }, [currentSection, folderPath])
  
  // Separate folders and files for display
  const folders = useMemo(() => {
    const folderItems = displayItems
      .filter(item => item.type === 'folder')
      .map(item => ({
        type: 'folder' as const,
        id: item.id,
        name: item.name,
        sectionId: item.sectionId,
        path: item.path,
        folderCount: item.folderCount,
        fileCount: item.fileCount,
        itemCount: item.itemCount,
      }))
    
    // Remove duplicates based on id
    const seen = new Set<string>()
    return folderItems.filter(folder => {
      if (seen.has(folder.id)) {
        return false
      }
      seen.add(folder.id)
      return true
    })
  }, [displayItems])
  
  const files = useMemo(() => {
    const fileItems = displayItems
      .filter(item => item.type === 'file')
      .map(item => {
        const fileItem: FileItem = {
          id: item.id,
          name: item.name,
          size: item.size || '',
          type: 'file',
          fileType: item.fileType || '',
          lastModified: item.lastModified || '',
          createdAt: item.createdAt || '',
          author: item.author || '',
          tags: item.tags || [],
          isStarred: item.isStarred || false,
        }
        return fileItemToDocumentItem(fileItem, item.sectionId)
      })
    
    // Remove duplicates based on id
    const seen = new Set<string>()
    return fileItems.filter(doc => {
      if (seen.has(doc.id)) {
        return false
      }
      seen.add(doc.id)
      return true
    })
  }, [displayItems])
  
  // Combine folders and files for display (folders first, then files)
  const displayDocuments = useMemo(() => {
    // For now, we'll show files in the document views
    // Folders will be handled separately
    return files
  }, [files])

  // Filter and sort folders
  const filteredFolders = useMemo(() => {
    let filtered = folders.filter((folder) => {
      if (searchTerm) {
        return folder.name.toLowerCase().includes(searchTerm.toLowerCase())
    }
      return true
    })
    
    // Sort folders by name (same as files when sortBy is 'name')
    if (sortBy === 'name' || sortBy === 'lastModified') {
      filtered = filtered.sort((a, b) => {
        if (sortOrder === 'asc') {
          return a.name.toLowerCase() < b.name.toLowerCase() ? -1 : 1
        } else {
          return a.name.toLowerCase() > b.name.toLowerCase() ? -1 : 1
        }
      })
    }
    
    return filtered
  }, [folders, searchTerm, sortBy, sortOrder])

  // Filter files
  const filteredDocuments = useMemo(() => {
    return displayDocuments
    .filter((doc) => {
      if (searchTerm) {
        return (
          doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          doc.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
        )
      }
      return true
    })
    .filter((doc) => {
      if (filterType === 'all') return true
      return doc.type.toLowerCase() === filterType.toLowerCase()
    })
    .sort((a, b) => {
      let aValue: string | number | Date
      let bValue: string | number | Date

      switch (sortBy) {
        case 'name':
          aValue = a.name.toLowerCase()
          bValue = b.name.toLowerCase()
          break
        case 'size':
          aValue = parseFloat(a.size)
          bValue = parseFloat(b.size)
          break
        case 'lastModified':
          aValue = new Date(a.lastModified)
          bValue = new Date(b.lastModified)
          break
        default:
          aValue = a.name.toLowerCase()
          bValue = b.name.toLowerCase()
      }

      if (sortOrder === 'asc') {
        if (aValue < bValue) return -1
        if (aValue > bValue) return 1
        return 0
      } else {
        if (aValue > bValue) return -1
        if (aValue < bValue) return 1
        return 0
      }
      }) as DocumentItem[]
  }, [displayDocuments, searchTerm, filterType, sortBy, sortOrder])

  const fileTypes = [...new Set(displayDocuments.map(doc => doc.type))]

  const handleDocumentClick = (doc: DocumentItem) => {
    // Navigate to document detail page
    router.push(`/documents/${doc.id}`)
  }

  const handleFolderClick = (folder: DisplayItem) => {
    if (folder.type === 'folder') {
      // Navigate into folder with animation
      const newPath = folder.path.slice(1) // Remove section ID, keep folder IDs
      const currentPathLength = folderPath.length
      const newPathLength = newPath.length
      
      // Determine navigation direction
      const direction = newPathLength > currentPathLength ? 'forward' : 'back'
      setNavigationDirection(direction)
      
      // Navigate immediately - data will load first
      router.push(`/documents?section=${folder.sectionId}&folder=${newPath.join('/')}`)
      
      // Reset direction after animation completes
      setTimeout(() => {
        setNavigationDirection(null)
      }, 300)
    }
  }

  const handleDownload = (doc: DocumentItem) => {
    // Create a download link
    const link = document.createElement('a')
    link.href = `#` // In real app, use actual file URL
    link.download = doc.name
    link.click()
    console.log('Download:', doc.name)
  }

  const handleShare = (doc: DocumentItem) => {
    console.log('Share:', doc.name)
  }

  const handleEditMetadata = (doc: DocumentItem) => {
    console.log('Edit Metadata:', doc.name)
  }

  const handleRetention = (doc: DocumentItem) => {
    console.log('Retention:', doc.name)
  }

  const handleDuplicate = (doc: DocumentItem) => {
    console.log('Duplicate:', doc.name)
  }

  const handleWatch = (doc: DocumentItem) => {
    console.log('Watch:', doc.name)
  }

  const handleDelete = (doc: DocumentItem) => {
    console.log('Delete:', doc.name)
  }

  const handleSelectionChange = (selectedIds: string[]) => {
    setSelectedDocuments(selectedIds)
  }

  const handleMove = () => {
    if (selectedDocuments.length > 0) {
      setIsMoveDialogOpen(true)
    }
  }

  const handleMoveConfirm = (destination: { type: 'section' | 'folder'; id: string; path: string[] }) => {
    if (selectedDocuments.length > 0) {
      moveFiles(selectedDocuments, destination)
      setSelectedDocuments([])
      // Optionally show a success message
      console.log('Documents moved successfully')
    }
  }

  const handleBulkDownload = () => {
    console.log('Download selected documents:', selectedDocuments)
    selectedDocuments.forEach(id => {
      const doc = filteredDocuments.find(d => d.id === id)
      if (doc) handleDownload(doc)
    })
  }

  const handleBulkDelete = () => {
    console.log('Delete selected documents:', selectedDocuments)
    // In real app, show confirmation dialog
    setSelectedDocuments([])
  }

  const handleBulkDuplicate = () => {
    console.log('Duplicate selected documents:', selectedDocuments)
    selectedDocuments.forEach(id => {
      const doc = filteredDocuments.find(d => d.id === id)
      if (doc) handleDuplicate(doc)
    })
  }

  const handleSortChange = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(column)
      setSortOrder('asc')
    }
  }

  const handleUploadClick = () => {
    setShowUploadArea(true)
  }

  const handleUploadComplete = (files: File[]) => {
    // Handle upload complete - refresh documents list
    console.log('Files uploaded:', files)
    // In a real app, you would refresh the documents list here
    setShowUploadArea(false)
  }

  const handleSearch = (query: string) => {
    setSearchTerm(query)
  }

  const handleFolderCreate = () => {
    setIsFolderDialogOpen(true)
  }

  const handleFolderCreated = (name: string) => {
    // Folder creation will be handled by the dialog
    // Navigation can be added here if needed
  }

  return (
    <div className="flex flex-col h-full">
      {/* Documents Header */}
      <DocumentsHeader
        selectedCount={selectedDocuments.length}
        onFolderCreate={handleFolderCreate}
        onModify={() => console.log('Modify')}
        onColumns={() => console.log('Columns')}
        onMeta={() => console.log('Meta')}
        onRetention={() => console.log('Retention')}
        onWorkflow={() => console.log('Workflow')}
        onAuditLog={() => console.log('Audit Log')}
        onNumbering={() => console.log('Numbering')}
        onUpload={handleUploadClick}
        onSearch={handleSearch}
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        onMove={handleMove}
        onDownload={handleBulkDownload}
        onDelete={handleBulkDelete}
        onDuplicate={handleBulkDuplicate}
      />

      <div className="flex-1 overflow-auto">
        <div 
          key={`${sectionId}-${folderParam || 'root'}`}
          className={cn(
            "space-y-6 p-6",
            navigationDirection === 'forward' && "animate-slide-in-right",
            navigationDirection === 'back' && "animate-slide-in-left",
            !navigationDirection && ""
          )}
        >
          {/* Breadcrumb */}
          {isPending ? (
            <BreadcrumbSkeleton />
          ) : currentSection && (
            <BreadcrumbNavigation
              items={[
                { id: currentSection.id, name: currentSection.name, path: [currentSection.id] },
                ...breadcrumbPath,
              ]}
              onNavigate={(path) => {
                if (path.length === 1 && path[0] === currentSection.id) {
                  router.push(`/documents?section=${currentSection.id}`)
                } else {
                  const pathToFolder = path.slice(1) // Remove section ID
                  router.push(`/documents?section=${currentSection.id}&folder=${pathToFolder.join('/')}`)
                }
              }}
            />
              )}

          {/* Filters - macOS Finder Style Toolbar */}
          <div className="bg-muted/30 border border-border rounded-lg px-4 py-3">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              {/* Filter Type */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-muted-foreground">Type:</span>
          <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="h-8 w-32 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {fileTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type.toUpperCase()}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
                {filterType !== 'all' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                    onClick={() => setFilterType('all')}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>

              {/* Sort By */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-muted-foreground">Sort:</span>
          <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="h-8 w-36 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
                    <SelectItem value="name">Name</SelectItem>
                    <SelectItem value="lastModified">Modified</SelectItem>
                    <SelectItem value="size">Size</SelectItem>
            </SelectContent>
          </Select>
          <Button
                  variant="ghost"
            size="sm"
                  className={cn(
                    "h-8 w-8 p-0 transition-all duration-200",
                    "hover:bg-accent"
                  )}
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
          >
            {sortOrder === 'asc' ? (
                    <SortAsc className="h-4 w-4 text-primary" />
            ) : (
                    <SortDesc className="h-4 w-4 text-primary" />
            )}
          </Button>
              </div>

              {/* Active Filters Badges */}
              {(filterType !== 'all' || searchTerm) && (
                <div className="flex items-center gap-2 flex-wrap">
                  {filterType !== 'all' && (
                    <Badge variant="secondary" className="text-xs font-medium">
                      {filterType.toUpperCase()}
                      <button
                        onClick={() => setFilterType('all')}
                        className="ml-1.5 hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  )}
                  {searchTerm && (
                    <Badge variant="secondary" className="text-xs font-medium">
                      Search: {searchTerm}
                      <button
                        onClick={() => setSearchTerm('')}
                        className="ml-1.5 hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  )}
                </div>
              )}
        </div>
      </div>

      {/* Documents Display */}
          {showUploadArea || (filteredFolders.length === 0 && filteredDocuments.length === 0) ? (
            <DocumentsUploadArea
              onUploadComplete={handleUploadComplete}
              onFileRemove={(fileId) => {
                console.log('File removed:', fileId)
              }}
            />
      ) : isPending ? (
        <div className="relative">
          {viewMode === 'grid' ? (
            <FileExplorerSkeleton count={8} />
          ) : (
            <ListViewSkeleton count={10} />
          )}
        </div>
      ) : (
        <div className="relative">
              <div
                className={cn(
                  "transition-opacity duration-300",
                  isViewTransitioning && "opacity-0"
                )}
              >
              {viewMode === 'grid' ? (
                <>
                  {/* Folders in Grid */}
                  {filteredFolders.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-6">
                      {filteredFolders.map((folder) => (
                        <div
                          key={folder.id}
                          onClick={() => handleFolderClick(folder)}
                          className={cn(
                            "flex flex-col cursor-pointer group",
                            "bg-card border border-border rounded-lg p-6",
                            "shadow-sm hover:shadow-md",
                            "transition-all duration-200",
                            "hover:scale-[1.02] hover:-translate-y-1",
                            "hover:border-primary/20"
                          )}
                        >
                          {/* Folder Preview Area */}
                          <div className="relative mb-4 h-32 bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg flex items-center justify-center overflow-hidden">
                            <FolderIcon className="h-12 w-12 text-primary/60 group-hover:text-primary transition-colors" />
                            {/* Preview thumbnails - show first few file icons */}
                            <div className="absolute bottom-2 right-2 flex gap-1">
                              {folder.fileCount && folder.fileCount > 0 && (
                                <div className="bg-background/80 backdrop-blur-sm rounded px-2 py-1 text-xs font-medium text-foreground shadow-sm">
                                  {folder.fileCount} {folder.fileCount === 1 ? 'file' : 'files'}
                                </div>
                              )}
                            </div>
                          </div>
                          
                          {/* Folder Info */}
                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors mb-1">
                              {folder.name}
                            </h3>
                            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                              {folder.folderCount && folder.folderCount > 0 && (
                                <span className="flex items-center gap-1">
                                  <FolderIcon className="h-3 w-3" />
                                  {folder.folderCount}
                                </span>
                              )}
                              {folder.fileCount && folder.fileCount > 0 && (
                                <span className="flex items-center gap-1">
                                  <FileText className="h-3 w-3" />
                                  {folder.fileCount}
                                </span>
                              )}
                              {!folder.folderCount && !folder.fileCount && (
                                <span className="text-muted-foreground/70">Empty</span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  {/* Files in Grid */}
                  {filteredDocuments.length > 0 && (
                <DocumentsGalleryView 
                  documents={filteredDocuments} 
                  onDocumentClick={handleDocumentClick}
                  onZoom={(doc) => {
                    console.log('Zoom:', doc.name)
                  }}
                  viewMode={viewMode}
                  onViewModeChange={setViewMode}
                />
                  )}
                </>
              ) : (
                <DocumentsListView 
                  documents={filteredDocuments} 
                  folders={filteredFolders}
                  onDocumentClick={handleDocumentClick}
                  onFolderClick={handleFolderClick}
                  onDownload={handleDownload}
                  onShare={handleShare}
                  onEditMetadata={handleEditMetadata}
                  onRetention={handleRetention}
                  onDuplicate={handleDuplicate}
                  onWatch={handleWatch}
                  onDelete={handleDelete}
                  viewMode={viewMode}
                  onViewModeChange={(mode) => {
                    setIsViewTransitioning(true)
                    setTimeout(() => {
                      setViewMode(mode)
                      setTimeout(() => setIsViewTransitioning(false), 50)
                    }, 150)
                  }}
                  sortBy={sortBy}
                  sortOrder={sortOrder}
                  onSortChange={handleSortChange}
                  selectedIds={selectedDocuments}
                  onSelectionChange={handleSelectionChange}
                />
              )}
              </div>
          </div>
          )}
        </div>
      </div>

      {/* Create Folder Dialog */}
      {currentSection && (
        <CreateFolderDialog
          open={isFolderDialogOpen}
          onOpenChange={setIsFolderDialogOpen}
          sectionId={currentSection.id}
        />
      )}

      {/* Move Dialog */}
      <MoveDialog
        open={isMoveDialogOpen}
        onOpenChange={setIsMoveDialogOpen}
        selectedDocumentIds={selectedDocuments}
        onMove={handleMoveConfirm}
      />
    </div>
  )
}

export default function DocumentsPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <DocumentsContent />
    </Suspense>
  )
}
