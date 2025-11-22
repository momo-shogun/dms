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
}

type Item = Folder | FileItem

// Simple hook to manage sections
export function useSections() {
  // Validate and type the sections data
  const initialSections: Section[] = isValidSectionArray(sectionsData.sections)
    ? sectionsData.sections
    : []

  const [sections, setSections] = useState<Section[]>(initialSections)

  // Load sections from JSON on mount
  useEffect(() => {
    if (isValidSectionArray(sectionsData.sections)) {
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

  return {
    sections,
    addSection,
    updateSection,
    deleteSection,
    addFolder,
    updateFolder,
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

