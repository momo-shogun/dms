"use client"

import type React from "react"

import { createContext, useContext, useState, useCallback } from "react"

export interface Section {
  id: string
  name: string
  folders: Folder[]
}

export interface Folder {
  id: string
  name: string
  documentCount: number
}

interface DataContextType {
  sections: Section[]
  addSection: (name: string) => void
  updateSection: (id: string, name: string) => void
  deleteSection: (id: string) => void
  addFolder: (sectionId: string, name: string) => void
  updateFolder: (sectionId: string, folderId: string, name: string) => void
  deleteFolder: (sectionId: string, folderId: string) => void
}

const DataContext = createContext<DataContextType | undefined>(undefined)

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [sections, setSections] = useState<Section[]>([
    {
      id: "s1",
      name: "Inbox",
      folders: [{ id: "f1", name: "Inbox", documentCount: 12 }],
    },
    {
      id: "s2",
      name: "Documents",
      folders: [
        { id: "f2", name: "Projects", documentCount: 12 },
        { id: "f3", name: "Invoices", documentCount: 8 },
        { id: "f4", name: "Contracts", documentCount: 5 },
        { id: "f5", name: "Personal", documentCount: 15 },
      ],
    },
  ])

  const addSection = useCallback((name: string) => {
    const newSection: Section = {
      id: `s${Date.now()}`,
      name,
      folders: [],
    }
    setSections((prev) => [...prev, newSection])
  }, [])

  const updateSection = useCallback((id: string, name: string) => {
    setSections((prev) => prev.map((section) => (section.id === id ? { ...section, name } : section)))
  }, [])

  const deleteSection = useCallback((id: string) => {
    setSections((prev) => prev.filter((section) => section.id !== id))
  }, [])

  const addFolder = useCallback((sectionId: string, name: string) => {
    setSections((prev) =>
      prev.map((section) =>
        section.id === sectionId
          ? {
              ...section,
              folders: [...section.folders, { id: `f${Date.now()}`, name, documentCount: 0 }],
            }
          : section,
      ),
    )
  }, [])

  const updateFolder = useCallback((sectionId: string, folderId: string, name: string) => {
    setSections((prev) =>
      prev.map((section) =>
        section.id === sectionId
          ? {
              ...section,
              folders: section.folders.map((folder) => (folder.id === folderId ? { ...folder, name } : folder)),
            }
          : section,
      ),
    )
  }, [])

  const deleteFolder = useCallback((sectionId: string, folderId: string) => {
    setSections((prev) =>
      prev.map((section) =>
        section.id === sectionId
          ? {
              ...section,
              folders: section.folders.filter((folder) => folder.id !== folderId),
            }
          : section,
      ),
    )
  }, [])

  return (
    <DataContext.Provider
      value={{
        sections,
        addSection,
        updateSection,
        deleteSection,
        addFolder,
        updateFolder,
        deleteFolder,
      }}
    >
      {children}
    </DataContext.Provider>
  )
}

export function useData() {
  const context = useContext(DataContext)
  if (!context) {
    throw new Error("useData must be used within DataProvider")
  }
  return context
}
