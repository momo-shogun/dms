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
  moveFiles: (
    fileIds: string[],
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

  const moveFiles = useCallback((
    fileIds: string[],
    destination: { type: 'section' | 'folder'; id: string; path: string[] }
  ) => {
    setSections((prev) => {
      const newSections = prev.map(s => ({ ...s, items: [...(s.items || [])] }))
      const filesToMove: FileItem[] = []
      const sourceLocations: Array<{ sectionId: string; folderPath: string[] }> = []

      function findAndRemoveFiles(
        items: (Folder | FileItem)[],
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

      for (const section of newSections) {
        if (section.items) {
          findAndRemoveFiles(section.items, section.id)
        }
      }

      for (const file of filesToMove) {
        if (destination.type === 'section') {
          const section = newSections.find(s => s.id === destination.id)
          if (section) {
            if (!section.items) section.items = []
            section.items.push(file)
          }
        } else if (destination.type === 'folder') {
          const section = newSections.find(s => s.id === destination.path[0])
          if (section && section.items) {
            function addToFolder(items: (Folder | FileItem)[], folderPath: string[]): boolean {
              if (folderPath.length === 0) return false
              const [id, ...rest] = folderPath
              const item = items.find(i => i.id === id && i.type === 'folder')
              if (!item || item.type !== 'folder') return false
              
              if (rest.length === 0) {
                if (!item.items) item.items = []
                const sourceLocation = sourceLocations[filesToMove.indexOf(file)]
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
                return true
              }
              
              if (item.items) {
                return addToFolder(item.items, rest)
              }
              return false
            }

            addToFolder(section.items, destination.path.slice(1))
          }
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

