'use client'

// Documents Gallery View Component - Grid View with Document Previews

import { ZoomIn, List, Grid3X3, Folder as FolderIcon, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import type { DocumentItem } from './documents-list-view'
import { FileTypeIcon } from '@/src/components/file-type-icons'
import { cn } from '@/lib/utils'

interface FolderItem {
  id: string
  name: string
  folderCount?: number
  fileCount?: number
  itemCount?: number
}

interface DocumentsGalleryViewProps {
  documents: DocumentItem[]
  folders?: FolderItem[]
  onDocumentClick?: (doc: DocumentItem) => void
  onFolderClick?: (folder: FolderItem) => void
  onZoom?: (doc: DocumentItem) => void
  viewMode?: 'list' | 'grid'
  onViewModeChange?: (mode: 'list' | 'grid') => void
}

function formatDate(dateString: string) {
  const date = new Date(dateString)
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()
  return `${day}/${month}/${year}`
}

// Full document preview - uses actual document data
function DocumentPreview({ document }: { document: DocumentItem }) {
  // Generate document content based on document data
  const getDocumentTitle = () => {
    // Remove file extension and format as title
    const nameWithoutExt = document.name.replace(/\.[^/.]+$/, '')
    return nameWithoutExt
  }

  const getDocumentContent = () => {
    // Generate content based on document type and name
    const type = document.type.toLowerCase()
    const name = document.name.toLowerCase()
    
    if (type === 'pdf' || name.includes('proposal') || name.includes('report')) {
      return {
        title: getDocumentTitle(),
        sections: [
          {
            heading: 'Executive Summary',
            paragraphs: [
              `This ${document.type.toUpperCase()} document contains comprehensive information about ${getDocumentTitle()}.`,
              `The document was created by ${document.author} and includes detailed analysis and recommendations.`,
              `This file is ${document.size} in size and was last modified on ${formatDate(document.lastModified)}.`
            ]
          },
          {
            heading: 'Key Details',
            paragraphs: [
              `Document Type: ${document.type.toUpperCase()}`,
              `Author: ${document.author}`,
              `Size: ${document.size}`,
              `Tags: ${document.tags.join(', ')}`
            ]
          }
        ]
      }
    } else if (type === 'docx' || type === 'doc' || name.includes('notes') || name.includes('meeting')) {
      return {
        title: getDocumentTitle(),
        sections: [
          {
            heading: 'Document Overview',
            paragraphs: [
              `This document contains notes and information related to ${getDocumentTitle()}.`,
              `Prepared by ${document.author}, this document includes important details and discussions.`,
              `The document is ${document.size} and was last updated on ${formatDate(document.lastModified)}.`
            ]
          }
        ]
      }
    } else if (type === 'xlsx' || type === 'xls' || name.includes('analysis') || name.includes('budget')) {
      return {
        title: getDocumentTitle(),
        sections: [
          {
            heading: 'Data Overview',
            paragraphs: [
              `This spreadsheet contains data and analysis for ${getDocumentTitle()}.`,
              `Created by ${document.author}, this file includes calculations, charts, and data tables.`,
              `File size: ${document.size} | Last modified: ${formatDate(document.lastModified)}`
            ]
          }
        ]
      }
    } else {
      return {
        title: getDocumentTitle(),
        sections: [
          {
            heading: 'Document Information',
            paragraphs: [
              `File: ${document.name}`,
              `Type: ${document.type.toUpperCase()} | Size: ${document.size}`,
              `Author: ${document.author} | Modified: ${formatDate(document.lastModified)}`,
              `Tags: ${document.tags.join(', ')}`
            ]
          }
        ]
      }
    }
  }

  const content = getDocumentContent()

  return (
    <div className={cn(
      "bg-card border border-border rounded-lg overflow-hidden relative",
      "shadow-sm hover:shadow-md transition-shadow duration-200",
      "group-hover:border-primary/20"
    )} style={{ aspectRatio: '8.5/11', maxHeight: '500px' }}>
      {/* Document Page Content - Full View */}
      <div className="h-full p-8" style={{ fontSize: '11px', lineHeight: '1.6', fontFamily: 'serif' }}>
        {/* Main Title - Centered */}
        <div className="text-center mb-6">
          <h1 className="font-bold text-base mb-2 leading-tight text-card-foreground">
            {content.title}
          </h1>
        </div>
        
        {/* Dynamic Sections */}
        {content.sections.map((section, index) => (
          <div key={index} className="mb-5">
            <h2 className="font-semibold text-sm mb-3 text-card-foreground">
              {section.heading}
            </h2>
            <div className="space-y-3 text-card-foreground">
              {section.paragraphs.map((paragraph, pIndex) => (
                <p key={pIndex} className="text-justify leading-relaxed">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        ))}
      </div>
      
      {/* Zoom button at bottom right */}
      <div className="absolute bottom-3 right-3 z-10">
        <Button
          variant="ghost"
          size="sm"
          className="h-9 w-9 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-md border-0 p-0"
          onClick={(e) => {
            e.stopPropagation()
          }}
        >
          <ZoomIn className="h-5 w-5" />
        </Button>
      </div>
    </div>
  )
}

export default function DocumentsGalleryView({
  documents,
  folders = [],
  onDocumentClick,
  onFolderClick,
  onZoom,
  viewMode = 'grid',
  onViewModeChange,
}: DocumentsGalleryViewProps) {
  return (
    <div>
      {/* View Switcher Header */}
      <div className="flex items-center justify-end mb-4 pb-3 border-b border-border">
        <TooltipProvider>
          <div className="flex items-center gap-1">
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
      </div>

      {/* Gallery Grid - Folders first, then files */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {/* Folders */}
        {folders.map((folder) => (
          <div 
            key={`folder-${folder.id}`}
            onClick={() => onFolderClick?.(folder)}
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
              {/* File count badge */}
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

        {/* Files */}
        {documents.map((doc) => (
          <div 
            key={`file-${doc.id}`} 
            className={cn(
              "flex flex-col cursor-pointer group",
              "transition-all duration-200",
              "hover:scale-[1.02] hover:-translate-y-1"
            )}
            onClick={() => onDocumentClick?.(doc)}
          >
            {/* Document Preview */}
            <div className="mb-3 relative">
              <DocumentPreview document={doc} />
            </div>
            
            {/* Document Info */}
            <div className="flex items-start gap-2">
              <div className="mt-0.5 shrink-0">
                <FileTypeIcon fileType={doc.type} size={16} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-foreground mb-1 line-clamp-2 group-hover:text-primary transition-colors">
                  {doc.name}
            </h3>
            <p className="text-xs text-muted-foreground">
              {formatDate(doc.lastModified)}
            </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

