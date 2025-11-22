'use client'

// Documents List View Component - Table View

import { useState } from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Badge } from '@/components/ui/badge'
import { Share, Download, Settings, ChevronUp, List, Grid3X3, FileEdit, Clock, Copy, Eye, Trash2, Folder, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { FileTypeIcon } from '@/src/components/file-type-icons'

export interface DocumentItem {
  id: string
  name: string
  size: string
  type: string
  lastModified: string
  createdAt: string
  author: string
  tags: string[]
  isStarred: boolean
  sectionId: string
}

interface DocumentTableRowProps {
  document: DocumentItem
  onDocumentClick?: (doc: DocumentItem) => void
  onDownload?: (doc: DocumentItem) => void
  onShare?: (doc: DocumentItem) => void
  onEditMetadata?: (doc: DocumentItem) => void
  onRetention?: (doc: DocumentItem) => void
  onDuplicate?: (doc: DocumentItem) => void
  onWatch?: (doc: DocumentItem) => void
  onDelete?: (doc: DocumentItem) => void
  isSelected?: boolean
  onSelect?: (id: string, selected: boolean) => void
}

function DocumentTableRow({ 
  document, 
  onDocumentClick,
  onDownload,
  onShare,
  onEditMetadata,
  onRetention,
  onDuplicate,
  onWatch,
  onDelete,
  isSelected = false,
  onSelect,
}: DocumentTableRowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: document.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const day = String(date.getDate()).padStart(2, '0')
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const year = date.getFullYear()
    return `${day}/${month}/${year}`
  }

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation()
    onDownload?.(document)
  }

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation()
    onShare?.(document)
  }

  const handleCheckboxChange = (checked: boolean) => {
    onSelect?.(document.id, checked)
  }

  return (
    <tr 
      ref={setNodeRef} 
      style={style} 
      className={cn(
        "border-b border-border cursor-pointer",
        "transition-all duration-200",
        "hover:bg-accent/70 hover:shadow-sm",
        isSelected && "bg-accent/50",
        isDragging && "opacity-50"
      )}
      onClick={() => onDocumentClick?.(document)}
    >
      <td className="py-2 px-3">
        <Checkbox 
          checked={isSelected}
          onCheckedChange={handleCheckboxChange}
          onClick={(e) => e.stopPropagation()} 
        />
      </td>
      <td className="py-3 px-4">
        <div className="flex items-center gap-3">
          <div className="p-1.5 rounded-md bg-muted shrink-0">
            <FileTypeIcon fileType={document.type} size={20} />
          </div>
          <span className="text-sm font-semibold text-foreground">{document.name}</span>
        </div>
      </td>
      <td className="py-3 px-4">
        <div className="flex flex-wrap gap-1.5">
          {document.tags.slice(0, 2).map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs font-medium">
              {tag}
            </Badge>
          ))}
          {document.tags.length > 2 && (
            <Badge variant="outline" className="text-xs">
              +{document.tags.length - 2}
            </Badge>
          )}
        </div>
      </td>
      <td className="py-3 px-4 text-sm text-muted-foreground">
        {formatDate(document.lastModified)}
      </td>
      <td className="py-3 px-4">
        <TooltipProvider>
          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                  onClick={handleShare}
                >
                  <Share className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Share</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEditMetadata?.(document)}>
                      <FileEdit className="mr-2 h-4 w-4" />
                      Edit Metadata
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onRetention?.(document)}>
                      <Clock className="mr-2 h-4 w-4" />
                      Retention
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onShare?.(document)}>
                      <Share className="mr-2 h-4 w-4" />
                      Share
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onDuplicate?.(document)}>
                      <Copy className="mr-2 h-4 w-4" />
                      Duplicate
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onWatch?.(document)}>
                      <Eye className="mr-2 h-4 w-4" />
                      Watch
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={() => onDelete?.(document)}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TooltipTrigger>
              <TooltipContent>Settings</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                  onClick={handleDownload}
                >
                  <Download className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Download</TooltipContent>
            </Tooltip>
          </div>
        </TooltipProvider>
      </td>
    </tr>
  )
}

function getFileIcon(type: string) {
  switch (type.toLowerCase()) {
    case 'pdf':
      return '📄'
    case 'docx':
    case 'doc':
      return '📝'
    case 'xlsx':
    case 'xls':
      return '📊'
    case 'zip':
    case 'rar':
      return '🗜️'
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif':
      return '🖼️'
    case 'pptx':
    case 'ppt':
      return '📊'
    case 'csv':
      return '📈'
    default:
      return '📎'
  }
}

export interface FolderItem {
  type: 'folder'
  id: string
  name: string
  sectionId: string
  path: string[]
  folderCount?: number
  fileCount?: number
  itemCount?: number
}

interface DocumentsListViewProps {
  documents: DocumentItem[]
  folders?: FolderItem[]
  onDocumentClick?: (doc: DocumentItem) => void
  onFolderClick?: (folder: FolderItem) => void
  onDownload?: (doc: DocumentItem) => void
  onShare?: (doc: DocumentItem) => void
  onEditMetadata?: (doc: DocumentItem) => void
  onRetention?: (doc: DocumentItem) => void
  onDuplicate?: (doc: DocumentItem) => void
  onWatch?: (doc: DocumentItem) => void
  onDelete?: (doc: DocumentItem) => void
  viewMode?: 'list' | 'grid'
  onViewModeChange?: (mode: 'list' | 'grid') => void
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  onSortChange?: (column: string) => void
  selectedIds?: string[]
  onSelectionChange?: (selectedIds: string[]) => void
}

// Folder row component
function FolderTableRow({
  folder,
  onFolderClick,
  isSelected = false,
  onSelect,
}: {
  folder: FolderItem
  onFolderClick?: (folder: FolderItem) => void
  isSelected?: boolean
  onSelect?: (id: string, selected: boolean) => void
}) {
  const handleCheckboxChange = (checked: boolean) => {
    onSelect?.(folder.id, checked)
  }

  const formatDate = () => {
    // Folders don't have dates, show empty or current date
    return '-'
  }

  const itemCount = (folder.folderCount || 0) + (folder.fileCount || 0)
  const metadataText = itemCount > 0 
    ? `${itemCount} item${itemCount > 1 ? 's' : ''}`
    : 'Empty folder'

  return (
    <tr 
      className={cn(
        "border-b border-border cursor-pointer",
        "transition-all duration-200",
        "hover:bg-accent/70 hover:shadow-sm",
        isSelected && "bg-accent/50"
      )}
      onClick={() => onFolderClick?.(folder)}
    >
      <td className="py-3 px-4">
        <Checkbox 
          checked={isSelected}
          onCheckedChange={handleCheckboxChange}
          onClick={(e) => e.stopPropagation()} 
        />
      </td>
      <td className="py-3 px-4">
        <div className="flex items-center gap-3">
          <div className="p-1.5 rounded-md bg-primary/10 group-hover:bg-primary/20 transition-colors">
            <Folder className="h-5 w-5 text-primary shrink-0" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-sm font-semibold text-foreground block truncate">
              {folder.name}
            </span>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {metadataText}
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <div className="space-y-1">
                    {folder.folderCount && folder.folderCount > 0 && (
                      <div>{folder.folderCount} folder{folder.folderCount > 1 ? 's' : ''}</div>
                    )}
                    {folder.fileCount && folder.fileCount > 0 && (
                      <div>{folder.fileCount} file{folder.fileCount > 1 ? 's' : ''}</div>
                    )}
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </td>
      <td className="py-3 px-4">
        <div className="flex items-center gap-2">
          {folder.folderCount && folder.folderCount > 0 && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-primary/10 text-primary text-xs font-medium">
              <Folder className="h-3 w-3" />
              {folder.folderCount}
            </span>
          )}
          {folder.fileCount && folder.fileCount > 0 && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-secondary text-secondary-foreground text-xs font-medium">
              {folder.fileCount}
            </span>
          )}
        </div>
      </td>
      <td className="py-3 px-4 text-sm text-muted-foreground">
        {formatDate()}
      </td>
      <td className="py-3 px-4">
        <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
          <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
        </div>
      </td>
    </tr>
  )
}

export default function DocumentsListView({
  documents: initialDocuments,
  folders = [],
  onDocumentClick,
  onFolderClick,
  onDownload,
  onShare,
  onEditMetadata,
  onRetention,
  onDuplicate,
  onWatch,
  onDelete,
  viewMode = 'list',
  onViewModeChange,
  sortBy = 'name',
  sortOrder = 'asc',
  onSortChange,
  selectedIds = [],
  onSelectionChange,
}: DocumentsListViewProps) {
  const [documents, setDocuments] = useState(initialDocuments)
  
  // Virtualization threshold - only virtualize if we have many items
  const totalItems = folders.length + documents.length
  const shouldVirtualize = totalItems > 50 // Threshold for virtualization
  const allSelected = totalItems > 0 && selectedIds.length === totalItems
  const someSelected = selectedIds.length > 0 && selectedIds.length < totalItems

  const handleSelect = (id: string, selected: boolean) => {
    if (onSelectionChange) {
      if (selected) {
        onSelectionChange([...selectedIds, id])
      } else {
        onSelectionChange(selectedIds.filter(selectedId => selectedId !== id))
      }
    }
  }

  const handleSelectAll = (checked: boolean) => {
    if (onSelectionChange) {
      if (checked) {
        const allIds = [...folders.map(f => f.id), ...documents.map(doc => doc.id)]
        onSelectionChange(allIds)
      } else {
        onSelectionChange([])
      }
    }
  }

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      setDocuments((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id)
        const newIndex = items.findIndex((item) => item.id === over.id)
        return arrayMove(items, oldIndex, newIndex)
      })
    }
  }

  const handleSort = (column: string) => {
    onSortChange?.(column)
  }

  return (
    <div className={cn(
      "overflow-auto border rounded-lg",
      shouldVirtualize && "relative" // Prepare for virtualization
    )}>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <table className="w-full">
          {/* Note: For large lists (>50 items), consider implementing @tanstack/react-virtual
              Example implementation:
              import { useVirtualizer } from '@tanstack/react-virtual'
              const parentRef = useRef<HTMLDivElement>(null)
              const virtualizer = useVirtualizer({
                count: totalItems,
                getScrollElement: () => parentRef.current,
                estimateSize: () => 50,
                overscan: 5,
              })
          */}
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="py-3 px-4 text-left w-10">
                <Checkbox 
                  checked={allSelected}
                  onCheckedChange={handleSelectAll}
                  className={someSelected ? 'data-[state=indeterminate]:bg-primary' : ''}
                />
              </th>
              <th 
                className="py-3 px-4 text-left text-sm font-semibold cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => handleSort('name')}
              >
                <div className="flex items-center gap-1.5">
                  <span className={sortBy === 'name' ? 'text-primary font-semibold' : 'text-foreground'}>Name</span>
                  {sortBy === 'name' && (
                    <ChevronUp className={`h-3.5 w-3.5 text-primary transition-transform ${sortOrder === 'desc' ? 'rotate-180' : ''}`} />
                  )}
                </div>
              </th>
              <th className="py-3 px-4 text-left text-sm font-semibold text-muted-foreground">Tags</th>
              <th className="py-3 px-4 text-left text-sm font-semibold text-muted-foreground">Date</th>
              <th className="py-3 px-4 text-right">
                <TooltipProvider>
                  <div className="flex items-center justify-end gap-1">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className={cn(
                            "h-8 w-8 p-0 transition-all duration-200",
                            viewMode === 'list' 
                              ? 'text-primary bg-primary/10 scale-110' 
                              : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                          )}
                          onClick={() => onViewModeChange?.('list')}
                        >
                          <List className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>List View</TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className={cn(
                            "h-8 w-8 p-0 transition-all duration-200",
                            viewMode === 'grid' 
                              ? 'text-primary bg-primary/10 scale-110' 
                              : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                          )}
                          onClick={() => onViewModeChange?.('grid')}
                        >
                          <Grid3X3 className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Grid View</TooltipContent>
                    </Tooltip>
                  </div>
                </TooltipProvider>
              </th>
            </tr>
          </thead>
          <tbody>
            <SortableContext items={[...folders.map(f => `folder-${f.id}`), ...documents.map((d) => `file-${d.id}`)]} strategy={verticalListSortingStrategy}>
              {/* Folders first */}
              {folders.map((folder, index) => (
                <FolderTableRow
                  key={`folder-${folder.id}-${index}`}
                  folder={folder}
                  onFolderClick={onFolderClick}
                  isSelected={selectedIds.includes(folder.id)}
                  onSelect={handleSelect}
                />
              ))}
              {/* Then files */}
              {documents.map((doc, index) => (
                <DocumentTableRow 
                  key={`file-${doc.id}-${index}`} 
                  document={doc} 
                  onDocumentClick={onDocumentClick}
                  onDownload={onDownload}
                  onShare={onShare}
                  onEditMetadata={onEditMetadata}
                  onRetention={onRetention}
                  onDuplicate={onDuplicate}
                  onWatch={onWatch}
                  onDelete={onDelete}
                  isSelected={selectedIds.includes(doc.id)}
                  onSelect={handleSelect}
                />
              ))}
            </SortableContext>
          </tbody>
        </table>
      </DndContext>
    </div>
  )
}

