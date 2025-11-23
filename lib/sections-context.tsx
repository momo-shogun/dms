"use client"

import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react"
import sectionsData from "@/src/app/(dashboard)/documents/data.json"
import type { Section, Folder, FileItem } from "./sections"

// Type guard to ensure JSON data matches Section structure
function isValidSection(data: unknown): data is Section {
  return (
    typeof data === "object" &&
    data !== null &&
    "id" in data &&
    "name" in data &&
    "type" in data &&
    (data as { type: string }).type === "section"
  )
}

function isValidSectionArray(data: unknown): data is Section[] {
  return Array.isArray(data) && data.every(isValidSection)
}

interface SectionsContextType {
  sections: Section[]
  addSection: (name: string) => void
  updateSection: (id: string, name: string) => void
  deleteSection: (id: string) => void
  addFolder: (sectionId: string, name: string, parentPath?: string[]) => void
  updateFolder: (sectionId: string, folderPath: string[], name: string) => void
  addFile: (sectionId: string, file: File, folderPath?: string[]) => void
  updateFile: (fileId: string, updates: { name?: string; tags?: string[]; author?: string }) => void
  deleteFile: (fileId: string) => void
  duplicateFile: (fileId: string) => void
  moveFiles: (
    itemIds: string[],
    destination: { type: 'section' | 'folder'; id: string; path: string[] }
  ) => void
}

const SectionsContext = createContext<SectionsContextType | undefined>(undefined)

export function SectionsProvider({ children }: { children: ReactNode }) {
  const initialSections: Section[] = isValidSectionArray(sectionsData.sections)
    ? sectionsData.sections
    : []

  const [sections, setSections] = useState<Section[]>(initialSections)

  // Load sections from JSON on mount only once
  useEffect(() => {
    if (sections.length === 0 && isValidSectionArray(sectionsData.sections)) {
      setSections(sectionsData.sections)
    }
  }, [])

  const addSection = useCallback((name: string) => {
    const newSection: Section = {
      id: `s${Date.now()}`,
      name,
      type: "section",
      items: [],
    }
    setSections((prev) => [...prev, newSection])
  }, [])

  const updateSection = useCallback((id: string, name: string) => {
    setSections((prev) =>
      prev.map((section) => (section.id === id ? { ...section, name } : section))
    )
  }, [])

  const deleteSection = useCallback((id: string) => {
    setSections((prev) => prev.filter((section) => section.id !== id))
  }, [])

  const addFolder = useCallback((sectionId: string, name: string, parentPath: string[] = []) => {
    setSections((prev) =>
      prev.map((section) => {
        if (section.id !== sectionId) return section

        const newFolder: Folder = {
          id: `f${Date.now()}`,
          name,
          type: "folder",
          items: [],
        }

        if (parentPath.length === 0) {
          return {
            ...section,
            items: [...(section.items || []), newFolder],
          }
        }

        function addToParent(items: (Folder | FileItem)[], path: string[]): (Folder | FileItem)[] {
          if (path.length === 0) {
            return [...items, newFolder]
          }
          const [id, ...rest] = path
          return items.map((item) => {
            if (item.id === id && item.type === "folder") {
              return {
                ...item,
                items: addToParent(item.items || [], rest),
              }
            }
            return item
          })
        }

        return {
          ...section,
          items: addToParent(section.items || [], parentPath),
        }
      })
    )
  }, [])

  const updateFolder = useCallback((sectionId: string, folderPath: string[], name: string) => {
    setSections((prev) =>
      prev.map((section) => {
        if (section.id !== sectionId) return section

        function updateInItems(items: (Folder | FileItem)[], path: string[]): (Folder | FileItem)[] {
          if (path.length === 0) return items
          const [id, ...rest] = path
          return items.map((item) => {
            if (item.id === id && item.type === "folder") {
              if (rest.length === 0) {
                return { ...item, name }
              }
              return {
                ...item,
                items: updateInItems(item.items || [], rest),
              }
            }
            return item
          })
        }

        return {
          ...section,
          items: updateInItems(section.items || [], folderPath),
        }
      })
    )
  }, [])

  const addFile = useCallback((sectionId: string, file: File, folderPath: string[] = []) => {
    // Get file extension
    const fileExtension = file.name.split('.').pop()?.toLowerCase() || ''
    
    // Map common extensions to file types
    const fileTypeMap: Record<string, string> = {
      'pdf': 'pdf',
      'doc': 'docx',
      'docx': 'docx',
      'xls': 'xlsx',
      'xlsx': 'xlsx',
      'png': 'png',
      'jpg': 'jpg',
      'jpeg': 'jpg',
      'mp4': 'mp4',
      'zip': 'zip',
    }
    
    const fileType = fileTypeMap[fileExtension] || fileExtension
    
    // Format file size
    const formatFileSize = (bytes: number): string => {
      if (bytes === 0) return '0 Bytes'
      const k = 1024
      const sizes = ['Bytes', 'KB', 'MB', 'GB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
    }

    const newFile: FileItem = {
      id: `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: file.name,
      size: formatFileSize(file.size),
      type: 'file',
      fileType,
      lastModified: new Date(file.lastModified || Date.now()).toISOString(),
      createdAt: new Date().toISOString(),
      author: 'current.user@example.com',
      tags: [],
      isStarred: false,
      auditLog: [
        {
          time: new Date().toISOString(),
          user: 'current.user@example.com',
          action: 'Uploaded file'
        }
      ]
    }

    setSections((prev) =>
      prev.map((section) => {
        if (section.id !== sectionId) return section

        // If no folder path, add to section root
        if (folderPath.length === 0) {
          return {
            ...section,
            items: [...(section.items || []), newFile],
          }
        }

        // Find folder and add file to it
        function addToFolder(items: (Folder | FileItem)[], path: string[]): (Folder | FileItem)[] {
          if (path.length === 0) return items
          const [id, ...rest] = path
          return items.map((item) => {
            if (item.id === id && item.type === 'folder') {
              if (rest.length === 0) {
                // Found the destination folder
                return {
                  ...item,
                  items: [...(item.items || []), newFile],
                }
              }
              return {
                ...item,
                items: addToFolder(item.items || [], rest),
              }
            }
            return item
          })
        }

        return {
          ...section,
          items: addToFolder(section.items || [], folderPath),
        }
      })
    )
  }, [])

  const updateFile = useCallback((fileId: string, updates: { name?: string; tags?: string[]; author?: string }) => {
    setSections((prev) =>
      prev.map((section) => {
        function updateInItems(items: (Folder | FileItem)[], path: string[] = []): (Folder | FileItem)[] {
          return items.map((item) => {
            if (item.type === 'file' && item.id === fileId) {
              return {
                ...item,
                name: updates.name ?? item.name,
                tags: updates.tags ?? item.tags,
                author: updates.author ?? item.author,
                auditLog: [
                  {
                    time: new Date().toISOString(),
                    user: 'current.user@example.com',
                    action: 'Modified metadata'
                  },
                  ...(item.auditLog || [])
                ]
              }
            } else if (item.type === 'folder' && item.items) {
              return {
                ...item,
                items: updateInItems(item.items, [...path, item.id]),
              }
            }
            return item
          })
        }

        return {
          ...section,
          items: updateInItems(section.items || []),
        }
      })
    )
  }, [])

  const deleteFile = useCallback((fileId: string) => {
    setSections((prev) =>
      prev.map((section) => {
        function deleteInItems(items: (Folder | FileItem)[]): (Folder | FileItem)[] {
          return items
            .filter((item) => {
              // Remove files that match the ID
              if (item.type === 'file' && item.id === fileId) {
                return false
              }
              return true
            })
            .map((item) => {
              // For folders, recursively delete files from nested items
              if (item.type === 'folder' && item.items) {
                return {
                  ...item,
                  items: deleteInItems(item.items),
                }
              }
              return item
            })
        }

        return {
          ...section,
          items: deleteInItems(section.items || []),
        }
      })
    )
  }, [])

  const duplicateFile = useCallback((fileId: string) => {
    setSections((prev) => {
      let fileToDuplicate: FileItem | null = null
      let fileLocation: { sectionId: string; folderPath: string[] } | null = null

      // Find the file to duplicate
      for (const section of prev) {
        function findFile(items: (Folder | FileItem)[], path: string[] = []): FileItem | null {
          for (const item of items) {
            if (item.type === 'file' && item.id === fileId) {
              fileLocation = { sectionId: section.id, folderPath: path }
              return item
            } else if (item.type === 'folder' && item.items) {
              const found = findFile(item.items, [...path, item.id])
              if (found) return found
            }
          }
          return null
        }

        if (section.items) {
          const found = findFile(section.items)
          if (found) {
            fileToDuplicate = found
            break
          }
        }
      }

      if (!fileToDuplicate || !fileLocation) return prev

      // Create duplicate
      const duplicatedFile: FileItem = {
        ...fileToDuplicate,
        id: `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: `${fileToDuplicate.name.replace(/\.[^/.]+$/, '')} (Copy)${fileToDuplicate.name.match(/\.[^/.]+$/)?.[0] || ''}`,
        auditLog: [
          {
            time: new Date().toISOString(),
            user: 'current.user@example.com',
            action: 'Duplicated file'
          },
          ...(fileToDuplicate.auditLog || [])
        ]
      }

      // Add duplicate to the same location
      return prev.map((section) => {
        if (section.id !== fileLocation!.sectionId) return section

        function addDuplicate(items: (Folder | FileItem)[], path: string[]): (Folder | FileItem)[] {
          if (path.length === 0) {
            // Add to current level
            return [...items, duplicatedFile]
          }

          const [id, ...rest] = path
          return items.map((item) => {
            if (item.id === id && item.type === 'folder') {
              return {
                ...item,
                items: addDuplicate(item.items || [], rest),
              }
            }
            return item
          })
        }

        return {
          ...section,
          items: addDuplicate(section.items || [], fileLocation!.folderPath),
        }
      })
    })
  }, [])

  const moveFiles = useCallback((
    itemIds: string[],
    destination: { type: 'section' | 'folder'; id: string; path: string[] }
  ) => {
    setSections((prev) => {
      // Normalize IDs (remove 'file-' or 'folder-' prefix if present)
      const normalizedIds = itemIds.map(id => {
        if (id.startsWith('file-')) return id.replace('file-', '')
        if (id.startsWith('folder-')) return id.replace('folder-', '')
        return id
      })
      
      const itemsToMove: Array<{ item: Folder | FileItem; sourceLocation: { sectionId: string; folderPath: string[] } }> = []

      // Step 1: Find and collect items (files and folders) to move
      function findItemsToMove(
        items: (Folder | FileItem)[],
        sectionId: string,
        folderPath: string[] = []
      ): void {
        for (const item of items) {
          if (normalizedIds.includes(item.id)) {
            // Deep clone the item to avoid reference issues
            const clonedItem = item.type === 'folder' 
              ? { ...item, items: item.items ? JSON.parse(JSON.stringify(item.items)) : [] }
              : { ...item }
            itemsToMove.push({
              item: clonedItem as Folder | FileItem,
              sourceLocation: { sectionId, folderPath: [...folderPath] }
            })
          }
          // Continue searching in nested folders
          if (item.type === 'folder' && item.items) {
            findItemsToMove(item.items, sectionId, [...folderPath, item.id])
          }
        }
      }

      for (const section of prev) {
        if (section.items) {
          findItemsToMove(section.items, section.id)
        }
      }

      // Step 2: Remove items from source locations (immutable)
      function removeItems(
        items: (Folder | FileItem)[],
        sectionId: string,
        folderPath: string[] = []
      ): (Folder | FileItem)[] {
        return items
          .filter((item) => {
            // Remove if ID matches
            if (normalizedIds.includes(item.id)) {
              return false
            }
            return true
          })
          .map((item) => {
            // Recursively remove from nested folders
            if (item.type === 'folder' && item.items) {
              return {
                ...item,
                items: removeItems(item.items, sectionId, [...folderPath, item.id]),
              }
            }
            return item
          })
      }

      // Step 3: Create new sections with items removed
      let newSections = prev.map((section) => ({
        ...section,
        items: section.items ? removeItems(section.items, section.id) : [],
      }))

      // Step 4: Add items to destination (immutable)
      for (const { item, sourceLocation } of itemsToMove) {
        const sourceSection = prev.find(s => s.id === sourceLocation.sectionId)
        const sourceName = sourceSection?.name || 'Unknown'
        
        if (destination.type === 'section') {
          newSections = newSections.map((section) => {
            if (section.id !== destination.id) return section
            
            if (item.type === 'file') {
              // Add audit log entry for file
              const updatedFile: FileItem = {
                ...item,
                auditLog: [
                  {
                    time: new Date().toISOString(),
                    user: 'current.user@example.com',
                    action: `Moved file from ${sourceName} to ${section.name}`
                  },
                  ...(item.auditLog || [])
                ]
              }
              
              return {
                ...section,
                items: [...(section.items || []), updatedFile],
              }
            } else {
              // Move folder to section
              return {
                ...section,
                items: [...(section.items || []), item],
              }
            }
          })
        } else if (destination.type === 'folder') {
          const sectionId = destination.path[0]
          
          function addToFolder(
            items: (Folder | FileItem)[],
            folderPath: string[]
          ): (Folder | FileItem)[] {
            if (folderPath.length === 0) return items
            
            const [id, ...rest] = folderPath
            return items.map((folderItem) => {
              if (folderItem.id === id && folderItem.type === 'folder') {
                if (rest.length === 0) {
                  // Found destination folder
                  const destName = folderItem.name
                  
                  if (item.type === 'file') {
                    // Add file with audit log
                    const updatedFile: FileItem = {
                      ...item,
                      auditLog: [
                        {
                          time: new Date().toISOString(),
                          user: 'current.user@example.com',
                          action: `Moved file from ${sourceName} to ${destName}`
                        },
                        ...(item.auditLog || [])
                      ]
                    }
                    
                    return {
                      ...folderItem,
                      items: [...(folderItem.items || []), updatedFile],
                    }
                  } else {
                    // Add folder
                    return {
                      ...folderItem,
                      items: [...(folderItem.items || []), item],
                    }
                  }
                } else {
                  // Continue navigating
                  return {
                    ...folderItem,
                    items: addToFolder(folderItem.items || [], rest),
                  }
                }
              }
              return folderItem
            })
          }

          newSections = newSections.map((section) => {
            if (section.id !== sectionId) return section
            
            return {
              ...section,
              items: section.items ? addToFolder(section.items, destination.path.slice(1)) : [],
            }
          })
        }
      }

      return newSections
    })
  }, [])

  return (
    <SectionsContext.Provider
      value={{
        sections,
        addSection,
        updateSection,
        deleteSection,
        addFolder,
        updateFolder,
        addFile,
        updateFile,
        deleteFile,
        duplicateFile,
        moveFiles,
      }}
    >
      {children}
    </SectionsContext.Provider>
  )
}

export function useSections() {
  const context = useContext(SectionsContext)
  if (context === undefined) {
    throw new Error("useSections must be used within a SectionsProvider")
  }
  return context
}

