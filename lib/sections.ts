"use client"

import { useState, useCallback, useEffect } from "react"
import sectionsData from "@/src/app/(dashboard)/documents/data.json"

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

export interface Section {
  id: string
  name: string
  type: "section"
  items?: (Folder | FileItem)[]
}

export interface Folder {
  id: string
  name: string
  type: "folder"
  items?: (Folder | FileItem)[]
}

export interface AuditLogEntry {
  time: string
  user: string
  action: string
}

export interface FileItem {
  id: string
  name: string
  size: string
  type: "file"
  fileType: string
  lastModified: string
  createdAt: string
  author: string
  tags: string[]
  isStarred: boolean
  auditLog?: AuditLogEntry[]
}

type Item = Folder | FileItem

// Simple hook to manage sections
export function useSections() {
  // Validate and type the sections data
  const initialSections: Section[] = isValidSectionArray(sectionsData.sections)
    ? sectionsData.sections
    : []

  const [sections, setSections] = useState<Section[]>(initialSections)

  // Load sections from JSON on mount only once - don't reset if sections already exist
  useEffect(() => {
    // Only initialize if sections array is empty (first mount)
    if (sections.length === 0 && isValidSectionArray(sectionsData.sections)) {
      setSections(sectionsData.sections)
    }
  }, []) // Empty deps - only run once on mount

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

  // Helper function to add folder to a section or parent folder
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

        // If no parent path, add to section root
        if (parentPath.length === 0) {
          return {
            ...section,
            items: [...(section.items || []), newFolder],
          }
        }

        // Find parent folder and add to it
        function addToParent(items: Item[], path: string[]): Item[] {
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

  // Helper function to update folder name
  const updateFolder = useCallback((sectionId: string, folderPath: string[], name: string) => {
    setSections((prev) =>
      prev.map((section) => {
        if (section.id !== sectionId) return section

        function updateInItems(items: Item[], path: string[]): Item[] {
          if (path.length === 0) return items
          const [id, ...rest] = path
          return items.map((item) => {
            if (item.id === id) {
              if (rest.length === 0 && item.type === "folder") {
                return { ...item, name }
              }
              if (item.type === "folder" && item.items) {
                return {
                  ...item,
                  items: updateInItems(item.items, rest),
                }
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

  // Helper function to move file(s) to a destination
  const moveFiles = useCallback((
    fileIds: string[],
    destination: { type: 'section' | 'folder'; id: string; path: string[] }
  ) => {
    setSections((prev) => {
      const newSections = prev.map(s => ({ ...s, items: s.items ? [...s.items] : [] }))
      const filesToMove: FileItem[] = []
      const sourceLocations: Array<{ sectionId: string; folderPath: string[] }> = []

      // Helper to find and remove files
      function findAndRemoveFiles(
        items: Item[],
        sectionId: string,
        folderPath: string[] = []
      ): void {
        for (let i = items.length - 1; i >= 0; i--) {
          const item = items[i]
          if (item.type === 'file' && fileIds.includes(item.id)) {
            filesToMove.push({ ...item })
            sourceLocations.push({ sectionId, folderPath: [...folderPath] })
            items.splice(i, 1)
          } else if (item.type === 'folder' && item.items) {
            findAndRemoveFiles(item.items, sectionId, [...folderPath, item.id])
          }
        }
      }

      // Step 1: Find and remove all files to move
      for (const section of newSections) {
        if (section.items) {
          findAndRemoveFiles(section.items, section.id)
        }
      }

      // Step 2: Add files to destination with audit log
      for (const section of newSections) {
        if (destination.type === 'section' && section.id === destination.id) {
          // Add to section root
          if (!section.items) section.items = []
          filesToMove.forEach((file, index) => {
            const sourceLocation = sourceLocations[index]
            const sourceSection = prev.find(s => s.id === sourceLocation.sectionId)
            const sourceName = sourceSection?.name || 'Unknown'
            
            const updatedFile: FileItem = {
              ...file,
              auditLog: [
                {
                  time: new Date().toISOString(),
                  user: 'current.user@example.com',
                  action: `Moved file from ${sourceName} to ${section.name}`
                },
                ...(file.auditLog || [])
              ]
            }
            section.items!.push(updatedFile)
          })
          break
        } else if (destination.type === 'folder' && section.id === destination.path[0]) {
          // Add to folder
          function addToFolder(items: Item[], folderPath: string[]): boolean {
            if (folderPath.length === 0) return false
            const [id, ...rest] = folderPath
            const item = items.find(i => i.id === id && i.type === 'folder')
            if (!item || item.type !== 'folder') return false
            
            if (rest.length === 0) {
              // Found the destination folder
              if (!item.items) item.items = []
              
              filesToMove.forEach((file, index) => {
                const sourceLocation = sourceLocations[index]
                const sourceSection = prev.find(s => s.id === sourceLocation.sectionId)
                const sourceName = sourceSection?.name || 'Unknown'
                const destName = item.name
                
                const updatedFile: FileItem = {
                  ...file,
                  auditLog: [
                    {
                      time: new Date().toISOString(),
                      user: 'current.user@example.com',
                      action: `Moved file from ${sourceName} to ${destName}`
                    },
                    ...(file.auditLog || [])
                  ]
                }
                item.items.push(updatedFile)
              })
              return true
            }
            
            if (item.items) {
              return addToFolder(item.items, rest)
            }
            return false
          }

          if (section.items) {
            addToFolder(section.items, destination.path.slice(1))
          }
          break
        }
      }

      return newSections
    })
  }, [])

  return {
    sections,
    addSection,
    updateSection,
    deleteSection,
    addFolder,
    updateFolder,
    moveFiles,
  }
}

// Helper function to get all files from a section (flattened)
export function getAllFiles(section: Section): FileItem[] {
  const files: FileItem[] = []

  function traverse(items?: Item[]) {
    if (!items) return
    for (const item of items) {
      if (item.type === "file") {
        files.push(item)
      } else if (item.type === "folder" && item.items) {
        traverse(item.items)
      }
    }
  }

  traverse(section.items)
  return files
}

// Helper function to find item by path
export function findItemByPath(
  sections: Section[],
  path: string[]
): Section | Folder | FileItem | null {
  if (path.length === 0) return null

  const [firstId, ...rest] = path
  const section = sections.find((s) => s.id === firstId)
  if (!section) return null

  if (rest.length === 0) return section

  function findInItems(items: Item[], ids: string[]): Item | null {
    if (ids.length === 0) return null
    const [id, ...remaining] = ids
    const item = items.find((i) => i.id === id)
    if (!item) return null
    if (remaining.length === 0) return item
    if (item.type === "folder" && item.items) {
      return findInItems(item.items, remaining)
    }
    return null
  }

  if (section.items) {
    return findInItems(section.items, rest) || null
  }
  return null
}

// Helper function to find file location (section and folder path)
export function findFileLocation(
  sections: Section[],
  fileId: string
): { sectionId: string; sectionName: string; folderPath: string[] } | null {
  for (const section of sections) {
    function searchInItems(items: Item[], currentPath: string[] = []): string[] | null {
      for (const item of items) {
        if (item.type === 'file' && item.id === fileId) {
          return currentPath
        }
        if (item.type === 'folder' && item.items) {
          const found = searchInItems(item.items, [...currentPath, item.id])
          if (found !== null) return found
        }
      }
      return null
    }

    if (section.items) {
      const folderPath = searchInItems(section.items)
      if (folderPath !== null) {
        return {
          sectionId: section.id,
          sectionName: section.name,
          folderPath,
        }
      }
    }
  }
  return null
}

