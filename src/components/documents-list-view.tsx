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
import { Share, Download, Settings, ChevronUp, List, Grid3X3, FileEdit, Clock, Copy, Eye, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
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
      className="border-b border-border hover:bg-accent/50 cursor-pointer"
      onClick={() => onDocumentClick?.(document)}
    >
      <td className="py-2 px-3">
        <Checkbox 
          checked={isSelected}
          onCheckedChange={handleCheckboxChange}
          onClick={(e) => e.stopPropagation()} 
        />
      </td>
      <td className="py-2 px-3">
        <div className="flex items-center gap-2">
          <span className="text-base">{getFileIcon(document.type)}</span>
          <span className="text-sm font-medium">{document.name}</span>
        </div>
      </td>
      <td className="py-2 px-3">
        <div className="flex flex-wrap gap-1">
          {document.tags.slice(0, 2).map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
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
      <td className="py-2 px-3 text-sm text-muted-foreground">
        {formatDate(document.lastModified)}
      </td>
      <td className="py-2 px-3">
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

interface DocumentsListViewProps {
  documents: DocumentItem[]
  onDocumentClick?: (doc: DocumentItem) => void
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

export default function DocumentsListView({
  documents: initialDocuments,
  onDocumentClick,
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
        onSelectionChange(documents.map(doc => doc.id))
      } else {
        onSelectionChange([])
      }
    }
  }

  const allSelected = documents.length > 0 && selectedIds.length === documents.length
  const someSelected = selectedIds.length > 0 && selectedIds.length < documents.length

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
    <div className="overflow-auto border rounded-lg">
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="py-2 px-3 text-left w-10">
                <Checkbox 
                  checked={allSelected}
                  onCheckedChange={handleSelectAll}
                  className={someSelected ? 'data-[state=indeterminate]:bg-primary' : ''}
                />
              </th>
              <th 
                className="py-2 px-3 text-left text-sm font-medium cursor-pointer hover:bg-muted/70 transition-colors"
                onClick={() => handleSort('name')}
              >
                <div className="flex items-center gap-1.5">
                  <span className={sortBy === 'name' ? 'text-blue-600' : 'text-gray-700'}>Name</span>
                  {sortBy === 'name' && (
                    <ChevronUp className={`h-3 w-3 text-blue-600 ${sortOrder === 'desc' ? 'rotate-180' : ''}`} />
                  )}
                </div>
              </th>
              <th className="py-2 px-3 text-left text-sm font-medium text-gray-500">Tags</th>
              <th className="py-2 px-3 text-left text-sm font-medium text-gray-500">Date</th>
              <th className="py-2 px-3 text-right">
                <TooltipProvider>
                  <div className="flex items-center justify-end gap-1">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className={`h-7 w-7 p-0 ${viewMode === 'list' ? 'text-blue-600' : 'text-gray-400'}`}
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
                          className={`h-7 w-7 p-0 ${viewMode === 'grid' ? 'text-blue-600' : 'text-gray-400'}`}
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
            <SortableContext items={documents.map((d) => d.id)} strategy={verticalListSortingStrategy}>
              {documents.map((doc) => (
                <DocumentTableRow 
                  key={doc.id} 
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

