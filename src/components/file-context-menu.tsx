'use client'

// File Context Menu Component - Right-click context menu for files and folders

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@/components/ui/context-menu'
import {
  Download,
  Share,
  FileEdit,
  Clock,
  Copy,
  Eye,
  Trash2,
  FolderOpen,
  FolderPlus,
  Move,
  Star,
  StarOff,
} from 'lucide-react'
import { cn } from '@/lib/utils'

export interface FileContextMenuProps {
  children: React.ReactNode
  type: 'file' | 'folder'
  onDownload?: () => void
  onShare?: () => void
  onEditMetadata?: () => void
  onRetention?: () => void
  onDuplicate?: () => void
  onWatch?: () => void
  onDelete?: () => void
  onOpen?: () => void
  onMove?: () => void
  onStar?: () => void
  isStarred?: boolean
  className?: string
}

export default function FileContextMenu({
  children,
  type,
  onDownload,
  onShare,
  onEditMetadata,
  onRetention,
  onDuplicate,
  onWatch,
  onDelete,
  onOpen,
  onMove,
  onStar,
  isStarred = false,
  className,
}: FileContextMenuProps) {
  return (
    <ContextMenu>
      <ContextMenuTrigger className={className}>
        {children}
      </ContextMenuTrigger>
      <ContextMenuContent className="w-56">
        {type === 'folder' && onOpen && (
          <>
            <ContextMenuItem onClick={onOpen} className="cursor-pointer">
              <FolderOpen className="mr-2 h-4 w-4" />
              Open
            </ContextMenuItem>
            <ContextMenuSeparator />
          </>
        )}
        
        {type === 'file' && onDownload && (
          <ContextMenuItem onClick={onDownload} className="cursor-pointer">
            <Download className="mr-2 h-4 w-4" />
            Download
          </ContextMenuItem>
        )}
        
        {onShare && (
          <ContextMenuItem onClick={onShare} className="cursor-pointer">
            <Share className="mr-2 h-4 w-4" />
            Share
          </ContextMenuItem>
        )}
        
        {onMove && (
          <ContextMenuItem onClick={onMove} className="cursor-pointer">
            <Move className="mr-2 h-4 w-4" />
            Move
          </ContextMenuItem>
        )}
        
        {onDuplicate && (
          <ContextMenuItem onClick={onDuplicate} className="cursor-pointer">
            <Copy className="mr-2 h-4 w-4" />
            Duplicate
          </ContextMenuItem>
        )}
        
        {type === 'file' && onStar && (
          <ContextMenuItem onClick={onStar} className="cursor-pointer">
            {isStarred ? (
              <>
                <StarOff className="mr-2 h-4 w-4" />
                Unstar
              </>
            ) : (
              <>
                <Star className="mr-2 h-4 w-4" />
                Star
              </>
            )}
          </ContextMenuItem>
        )}
        
        <ContextMenuSeparator />
        
        {type === 'file' && onEditMetadata && (
          <ContextMenuItem onClick={onEditMetadata} className="cursor-pointer">
            <FileEdit className="mr-2 h-4 w-4" />
            Edit Metadata
          </ContextMenuItem>
        )}
        
        {onRetention && (
          <ContextMenuItem onClick={onRetention} className="cursor-pointer">
            <Clock className="mr-2 h-4 w-4" />
            Retention
          </ContextMenuItem>
        )}
        
        {onWatch && (
          <ContextMenuItem onClick={onWatch} className="cursor-pointer">
            <Eye className="mr-2 h-4 w-4" />
            Watch
          </ContextMenuItem>
        )}
        
        <ContextMenuSeparator />
        
        {onDelete && (
          <ContextMenuItem 
            onClick={onDelete} 
            className="cursor-pointer text-destructive focus:text-destructive"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </ContextMenuItem>
        )}
      </ContextMenuContent>
    </ContextMenu>
  )
}

