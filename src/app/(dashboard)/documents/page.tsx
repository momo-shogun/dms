'use client'

// Documents Page with filtering and multiple view modes - Using Static Data

import { useState, Suspense, useMemo } from 'react'
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
} from 'lucide-react'
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
import { useSections, getAllFiles, type Section, type Folder, type FileItem } from '@/lib/sections'
import type { DocumentItem } from '@/src/components/documents-list-view'

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
  const { sections } = useSections()
  const [searchTerm, setSearchTerm] = useState(searchParams?.get('q') || '')
  const [sortBy, setSortBy] = useState('lastModified')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [filterType, setFilterType] = useState('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list')
  const [showUploadArea, setShowUploadArea] = useState(false)
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([])
  const [isFolderDialogOpen, setIsFolderDialogOpen] = useState(false)
  
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
  
  // Get documents from current section/folder
  const displayDocuments = useMemo(() => {
    if (!currentSection) return []
    
    const files = folderPath.length > 0 
      ? getFilesFromPath(currentSection, folderPath)
      : getAllFiles(currentSection)
    
    return files.map((file) => fileItemToDocumentItem(file, currentSection.id))
  }, [currentSection, folderPath])

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
    console.log('Move selected documents:', selectedDocuments)
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
        <div className="space-y-6 p-6">
          {/* Breadcrumb */}
          {(currentSection || currentFolder) && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              {currentSection && (
                <>
                  <span className="hover:text-foreground cursor-pointer" onClick={() => router.push(`/documents?section=${currentSection.id}`)}>
                    {currentSection.name}
                  </span>
                  {currentFolder && <ChevronRight className="h-4 w-4" />}
                </>
              )}
              {currentFolder && (
                <div className="flex items-center gap-2 text-foreground">
                  <FolderIcon className="h-4 w-4" />
                  <span className="font-medium">{currentFolder.name}</span>
                </div>
              )}
            </div>
          )}

          {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex space-x-2">
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-32">
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

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Sort by Name</SelectItem>
              <SelectItem value="lastModified">Sort by Modified</SelectItem>
              <SelectItem value="size">Sort by Size</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
          >
            {sortOrder === 'asc' ? (
              <SortAsc className="h-4 w-4" />
            ) : (
              <SortDesc className="h-4 w-4" />
            )}
          </Button>

        </div>
      </div>

      {/* Documents Display */}
          {showUploadArea || filteredDocuments.length === 0 ? (
            <DocumentsUploadArea
              onUploadComplete={handleUploadComplete}
              onFileRemove={(fileId) => {
                console.log('File removed:', fileId)
              }}
            />
      ) : (
        <div>
              {viewMode === 'grid' ? (
                <DocumentsGalleryView 
                  documents={filteredDocuments} 
                  onDocumentClick={handleDocumentClick}
                  onZoom={(doc) => {
                    console.log('Zoom:', doc.name)
                    // Open document in full screen or modal
                  }}
                  viewMode={viewMode}
                  onViewModeChange={setViewMode}
                />
              ) : (
                <DocumentsListView 
                  documents={filteredDocuments} 
                  onDocumentClick={handleDocumentClick}
                  onDownload={handleDownload}
                  onShare={handleShare}
                  onEditMetadata={handleEditMetadata}
                  onRetention={handleRetention}
                  onDuplicate={handleDuplicate}
                  onWatch={handleWatch}
                  onDelete={handleDelete}
                  viewMode={viewMode}
                  onViewModeChange={setViewMode}
                  sortBy={sortBy}
                  sortOrder={sortOrder}
                  onSortChange={handleSortChange}
                  selectedIds={selectedDocuments}
                  onSelectionChange={handleSelectionChange}
                />
              )}
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
