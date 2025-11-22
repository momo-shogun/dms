"use client"

import { useState, useMemo } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useSections } from "@/lib/sections-context"
import { type Section, type Folder, type FileItem } from "@/lib/sections"
import { Folder as FolderIcon, File, ChevronRight, X, ArrowLeft } from "lucide-react"
import { cn } from "@/lib/utils"

interface MoveDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedDocumentIds: string[]
  onMove: (destination: { type: 'section' | 'folder'; id: string; path: string[] }) => void
}

type NavigationItem = {
  type: 'section' | 'folder' | 'file'
  id: string
  name: string
  path: string[]
  items?: (Folder | FileItem)[]
}

export function MoveDialog({ open, onOpenChange, selectedDocumentIds, onMove }: MoveDialogProps) {
  const { sections } = useSections()
  const [navigationPath, setNavigationPath] = useState<string[]>([])
  const [selectedDestination, setSelectedDestination] = useState<{ type: 'section' | 'folder'; id: string; path: string[] } | null>(null)

  // Get current location items (section or folder contents)
  const currentItems = useMemo(() => {
    if (navigationPath.length === 0) {
      // Show all sections (only sections that exist)
      return sections
        .filter(section => section) // Only existing sections
        .map(section => ({
          type: 'section' as const,
          id: section.id,
          name: section.name,
          path: [section.id],
          items: section.items || [], // Use actual items or empty array
        }))
    }

    // Navigate into section or folder
    const [sectionId, ...folderPath] = navigationPath
    const section = sections.find(s => s.id === sectionId)
    if (!section) return []

    // If we're at section level (only sectionId in path, no folderPath)
    if (folderPath.length === 0) {
      // Show only items that actually exist in this section
      if (!section.items || section.items.length === 0) {
        return [] // Section has no items
      }
      
      return section.items.map(item => {
        if (item.type === 'folder') {
          return {
            type: 'folder' as const,
            id: item.id,
            name: item.name,
            path: [sectionId, item.id],
            items: item.items || [], // Use actual items or empty array
          }
        } else {
          return {
            type: 'file' as const,
            id: item.id,
            name: item.name,
            path: [],
          }
        }
      })
    }

    // Navigate into nested folder - find the folder in the path
    function findFolder(items: (Folder | FileItem)[], path: string[]): Folder | null {
      if (path.length === 0 || !items) return null
      const [id, ...rest] = path
      const item = items.find(i => i.id === id && i.type === 'folder')
      if (!item || item.type !== 'folder') return null
      if (rest.length === 0) return item // Found the target folder
      if (item.items) return findFolder(item.items, rest)
      return null
    }

    const folder = findFolder(section.items || [], folderPath)
    if (!folder) return [] // Folder doesn't exist

    // Show only items that actually exist in this folder
    if (!folder.items || folder.items.length === 0) {
      return [] // Folder is empty
    }

    // Return both folders and files that exist in this folder
    return folder.items.map(item => {
      if (item.type === 'folder') {
        return {
          type: 'folder' as const,
          id: item.id,
          name: item.name,
          path: [...navigationPath, item.id],
          items: item.items || [], // Use actual items or empty array
        }
      } else {
        return {
          type: 'file' as const,
          id: item.id,
          name: item.name,
          path: [],
        }
      }
    })
  }, [sections, navigationPath])

  // Get current location name for breadcrumb
  const currentLocationName = useMemo(() => {
    if (navigationPath.length === 0) return 'Select Destination'
    
    const [sectionId, ...folderPath] = navigationPath
    const section = sections.find(s => s.id === sectionId)
    if (!section) return 'Select Destination'
    
    if (folderPath.length === 0) return section.name
    
    function findFolderName(items: (Folder | FileItem)[], path: string[]): string | null {
      if (path.length === 0) return null
      const [id, ...rest] = path
      const item = items.find(i => i.id === id && i.type === 'folder')
      if (!item || item.type !== 'folder') return null
      if (rest.length === 0) return item.name
      if (item.items) return findFolderName(item.items, rest)
      return null
    }
    
    return findFolderName(section.items || [], folderPath) || section.name
  }, [sections, navigationPath])

  const handleItemClick = (item: NavigationItem) => {
    if (item.type === 'file') return // Files are not clickable
    
    // Set as selected destination
    const destinationType = item.type === 'section' ? 'section' : 'folder'
    const destinationPath = item.type === 'section' ? [item.id] : item.path
    
    setSelectedDestination({ 
      type: destinationType, 
      id: item.id, 
      path: destinationPath
    })
    
    // If it has items (folders or files), navigate into it to show contents
    // Even if empty, we can still select it as destination
    if (item.items && item.items.length > 0) {
      setNavigationPath(item.path)
    }
  }

  const handleBack = () => {
    if (navigationPath.length > 0) {
      const newPath = navigationPath.slice(0, -1)
      setNavigationPath(newPath)
      // Update selected destination to parent
      if (newPath.length === 0) {
        setSelectedDestination(null)
      } else if (newPath.length === 1) {
        // Back to section level
        const [sectionId] = newPath
        const section = sections.find(s => s.id === sectionId)
        if (section) {
          setSelectedDestination({ type: 'section', id: section.id, path: [section.id] })
        }
      } else {
        // Back to a folder
        const [sectionId, ...folderPath] = newPath
        const lastFolderId = folderPath[folderPath.length - 1]
        if (lastFolderId) {
          setSelectedDestination({ type: 'folder', id: lastFolderId, path: newPath })
        }
      }
    }
  }

  const handleMove = () => {
    if (selectedDestination) {
      onMove(selectedDestination)
      onOpenChange(false)
      setNavigationPath([])
      setSelectedDestination(null)
    }
  }

  const handleClose = () => {
    onOpenChange(false)
    setNavigationPath([])
    setSelectedDestination(null)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden">
        {/* Header */}
        <DialogHeader className="bg-blue-600 text-white p-4 flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            {navigationPath.length > 0 && (
              <button
                onClick={handleBack}
                className="p-1 hover:bg-blue-700 rounded transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
            )}
            <DialogTitle className="text-white text-lg font-semibold">
              {currentLocationName}
            </DialogTitle>
          </div>
          <button
            onClick={handleClose}
            className="p-1 hover:bg-blue-700 rounded transition-colors"
          >
            <X className="h-4 w-4 text-white" />
          </button>
        </DialogHeader>

        {/* Content */}
        <div className="p-4 max-h-[400px] overflow-y-auto">
          {currentItems.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No items available</p>
            </div>
          ) : (
            <div className="space-y-1">
              {currentItems.map((item) => {
                if (item.type === 'file') {
                  // Show files for context but make them non-clickable
                  return (
                    <div
                      key={`file-${item.id}`}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-left opacity-60"
                    >
                      <File className="h-4 w-4 shrink-0 text-muted-foreground" />
                      <span className="flex-1 text-sm font-medium text-muted-foreground">{item.name}</span>
                    </div>
                  )
                }

                const isSelected = selectedDestination?.id === item.id && 
                                  selectedDestination?.path.length === item.path.length &&
                                  selectedDestination?.path.every((p, i) => p === item.path[i])
                // Show chevron if item has folders/files inside (can navigate)
                const hasItems = item.items && item.items.length > 0
                // Count folders and files separately for better UX
                const folderCount = item.items?.filter((i: Folder | FileItem) => i.type === 'folder').length || 0
                const fileCount = item.items?.filter((i: Folder | FileItem) => i.type === 'file').length || 0

                return (
                  <button
                    key={`${item.type}-${item.id}`}
                    onClick={() => handleItemClick(item)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-left transition-colors",
                      "hover:bg-muted",
                      isSelected && "bg-blue-100 text-blue-900"
                    )}
                  >
                    <FolderIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <span className="flex-1 text-sm font-medium">{item.name}</span>
                    {(folderCount > 0 || fileCount > 0) && (
                      <span className="text-xs text-muted-foreground mr-1">
                        {folderCount > 0 && `${folderCount} folder${folderCount > 1 ? 's' : ''}`}
                        {folderCount > 0 && fileCount > 0 && ', '}
                        {fileCount > 0 && `${fileCount} file${fileCount > 1 ? 's' : ''}`}
                      </span>
                    )}
                    {hasItems && (
                      <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                    )}
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-border p-4 flex justify-end">
          <Button
            onClick={handleMove}
            disabled={!selectedDestination}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            MOVE HERE
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

