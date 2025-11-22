'use client'

// File Preview Popover Component - Shows file metadata on hover/click

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { FileTypeIcon } from '@/src/components/file-type-icons'
import { Badge } from '@/components/ui/badge'
import { Calendar, User, HardDrive, Tag } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface FilePreviewData {
  id: string
  name: string
  type: string
  size: string
  lastModified: string
  createdAt?: string
  author: string
  tags: string[]
}

interface FilePreviewPopoverProps {
  file: FilePreviewData
  children: React.ReactNode
  trigger?: 'hover' | 'click'
  className?: string
}

function formatDate(dateString: string) {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function FilePreviewPopover({
  file,
  children,
  trigger = 'hover',
  className,
}: FilePreviewPopoverProps) {
  return (
    <Popover>
      <PopoverTrigger asChild className={className}>
        {children}
      </PopoverTrigger>
      <PopoverContent 
        className={cn(
          "w-80 p-4",
          trigger === 'hover' && "data-[state=open]:animate-in data-[state=closed]:animate-out"
        )}
        side="right"
        align="start"
      >
        <div className="space-y-4">
          {/* File Header */}
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-muted shrink-0">
              <FileTypeIcon fileType={file.type} size={32} />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-sm text-foreground truncate">
                {file.name}
              </h4>
              <p className="text-xs text-muted-foreground mt-0.5">
                {file.type.toUpperCase()} File
              </p>
            </div>
          </div>

          {/* File Metadata */}
          <div className="space-y-2.5">
            <div className="flex items-center gap-2 text-sm">
              <HardDrive className="h-4 w-4 text-muted-foreground shrink-0" />
              <span className="text-muted-foreground">Size:</span>
              <span className="font-medium text-foreground">{file.size}</span>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
              <span className="text-muted-foreground">Modified:</span>
              <span className="font-medium text-foreground">
                {formatDate(file.lastModified)}
              </span>
            </div>

            {file.createdAt && (
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="text-muted-foreground">Created:</span>
                <span className="font-medium text-foreground">
                  {formatDate(file.createdAt)}
                </span>
              </div>
            )}

            <div className="flex items-center gap-2 text-sm">
              <User className="h-4 w-4 text-muted-foreground shrink-0" />
              <span className="text-muted-foreground">Author:</span>
              <span className="font-medium text-foreground">{file.author}</span>
            </div>
          </div>

          {/* Tags */}
          {file.tags && file.tags.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs font-medium text-muted-foreground">Tags</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {file.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}

