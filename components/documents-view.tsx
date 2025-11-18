"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Search,
  Grid3x3,
  List,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  X,
  FolderPlus,
  Settings,
  Columns,
  Tag,
  Clock,
  Workflow,
  BookOpen,
  Hash,
} from "lucide-react"
import type { Document } from "./document-card"
import type { FolderItem } from "./folder-card"

// Mock data
const mockFolders: FolderItem[] = [
  { id: "f1", name: "Projects", documentCount: 12 },
  { id: "f2", name: "Invoices", documentCount: 8 },
  { id: "f3", name: "Contracts", documentCount: 5 },
  { id: "f4", name: "Personal", documentCount: 15 },
]

const mockDocuments: Document[] = [
  {
    id: "1",
    title: "Newest Correspondent: HZ_Napoleon_Bonaparte_zadanie",
    correspondent: "Test User",
    date: "Aug 9, 2023",
    tags: [
      { name: "Another Sample Tag", color: "orange" },
      { name: "Inbox", color: "blue" },
    ],
  },
  {
    id: "2",
    title: "0004814539_20230531",
    date: "May 30, 2023",
    tags: [],
  },
  {
    id: "3",
    title: "Test Correspondent 1: [paperless] test post–owner",
    correspondent: "Test User",
    date: "Mar 25, 2023",
    tags: [
      { name: "Inbox", color: "blue" },
      { name: "Tag 2", color: "yellow" },
    ],
  },
  {
    id: "4",
    title: "tablerales2",
    date: "Dec 11, 2022",
    tags: [
      { name: "TagWithPartial", color: "purple" },
      { name: "Inbox", color: "blue" },
    ],
  },
  {
    id: "5",
    title: "Correspondent 9: 1 Testing New Title Updated 2",
    date: "Oct 2, 2022",
    tags: [
      { name: "Another Sample Tag", color: "orange" },
      { name: "Inbox", color: "blue" },
      { name: "TagWithPartial", color: "purple" },
    ],
  },
  {
    id: "6",
    title: "Test Correspondent 1: UM_PP8E_en_v29",
    correspondent: "Test User",
    date: "Oct 1, 2022",
    tags: [
      { name: "Another Sample Tag", color: "orange" },
      { name: "Inbox", color: "blue" },
      { name: "Just another tag", color: "cyan" },
      { name: "Tag 2", color: "yellow" },
    ],
  },
  {
    id: "7",
    title: "drylab Test",
    date: "Sep 11, 2022",
    tags: [
      { name: "Inbox", color: "blue" },
      { name: "Test Tag", color: "green" },
    ],
  },
  {
    id: "8",
    title: "InDesign 2022 Scripting Read Me",
    date: "Jun 9, 2022",
    tags: [
      { name: "Another Sample Tag", color: "orange" },
      { name: "Just another tag", color: "cyan" },
      { name: "Tag 12", color: "yellow" },
      { name: "Tag 2", color: "yellow" },
      { name: "Tag 3", color: "yellow" },
    ],
  },
]

interface DocumentsViewProps {
  activeFolder?: string
}

const DocumentsView = ({ activeFolder = "inbox" }: DocumentsViewProps) => {
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null)
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid")
  const [searchQuery, setSearchQuery] = useState("")
  const [activeFilters, setActiveFilters] = useState<string[]>([])
  const [currentPath, setCurrentPath] = useState<string[]>(["sdfa", activeFolder])
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null)
  const [folderCreateDialogOpen, setFolderCreateDialogOpen] = useState(false)

  const handleDocumentClick = (doc: Document) => {
    setSelectedDocument(doc)
  }

  const handleCloseDetail = () => {
    setSelectedDocument(null)
  }

  const addFilter = (filterName: string) => {
    if (!activeFilters.includes(filterName)) {
      setActiveFilters([...activeFilters, filterName])
    }
  }

  const removeFilter = (filterName: string) => {
    setActiveFilters(activeFilters.filter((f) => f !== filterName))
  }

  const handleFolderClick = (folder: FolderItem) => {
    setCurrentFolderId(folder.id)
    setCurrentPath([...currentPath, folder.name])
  }

  const handleBreadcrumbClick = (index: number) => {
    setCurrentPath(currentPath.slice(0, index + 1))
    setCurrentFolderId(null)
  }

  const displayFolders = currentFolderId ? [] : mockFolders
  const displayDocuments = mockDocuments

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden">
      {/* Toolbar */}
      <div className="bg-card border-b border-border px-4 py-2">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setFolderCreateDialogOpen(true)}
              className="hover:bg-accent"
            >
              <FolderPlus className="h-4 w-4 mr-1" />
              +Folder
            </Button>
            <Button variant="ghost" size="sm" className="hover:bg-accent">
              <Settings className="h-4 w-4 mr-1" />
              Modify
            </Button>
            <Button variant="ghost" size="sm" className="hover:bg-accent">
              <Columns className="h-4 w-4 mr-1" />
              Columns
            </Button>
            <Button variant="ghost" size="sm" className="hover:bg-accent">
              <Tag className="h-4 w-4 mr-1" />
              Meta
            </Button>
            <Button variant="ghost" size="sm" className="hover:bg-accent">
              <Clock className="h-4 w-4 mr-1" />
              Retention
            </Button>
            <Button variant="ghost" size="sm" className="hover:bg-accent">
              <Workflow className="h-4 w-4 mr-1" />
              Workflow
            </Button>
            <Button variant="ghost" size="sm" className="hover:bg-accent">
              <BookOpen className="h-4 w-4 mr-1" />
              Audit Log
            </Button>
            <Button variant="ghost" size="sm" className="hover:bg-accent">
              <Hash className="h-4 w-4 mr-1" />
              Numbering
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="default" size="sm">
              <ChevronDown className="h-4 w-4 mr-1" />
              Upload
            </Button>
            <Input
              placeholder="Search docs, tags, etc"
              className="w-64"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Button variant="ghost" size="sm">
              <Search className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Breadcrumb and View Controls */}
      <div className="bg-card border-b p-4 border-muted">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {currentPath.map((path, index) => (
              <div key={index} className="flex items-center gap-2">
                {index > 0 && <ChevronRight className="h-4 w-4" />}
                <button
                  onClick={() => {
                    setCurrentPath(currentPath.slice(0, index + 1))
                    setCurrentFolderId(null)
                  }}
                  className={`hover:text-foreground transition-colors ${
                    index === currentPath.length - 1 ? "text-foreground font-medium" : ""
                  }`}
                >
                  {path}
                </button>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <div className="flex border border-border rounded">
              <Button
                variant="ghost"
                size="sm"
                className={`${viewMode === "grid" ? "bg-accent text-accent-foreground" : ""}`}
                onClick={() => setViewMode("grid")}
              >
                <Grid3x3 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className={`${viewMode === "table" ? "bg-accent text-accent-foreground" : ""}`}
                onClick={() => setViewMode("table")}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search documents"
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              className="border-muted bg-transparent"
              variant="outline"
              size="sm"
              onClick={() => addFilter("Tags")}
            >
              <ChevronDown className="h-3 w-3 mr-1" />
              Tags
            </Button>
            <Button variant="outline" size="sm" onClick={() => addFilter("Correspondent")}>
              <ChevronDown className="h-3 w-3 mr-1" />
              Correspondent
            </Button>
            <Button variant="outline" size="sm" onClick={() => addFilter("Document type")}>
              <ChevronDown className="h-3 w-3 mr-1" />
              Document type
            </Button>
            <Button variant="outline" size="sm" onClick={() => addFilter("Storage path")}>
              <ChevronDown className="h-3 w-3 mr-1" />
              Storage path
            </Button>
            <Button variant="outline" size="sm" onClick={() => addFilter("Created")}>
              <ChevronDown className="h-3 w-3 mr-1" />
              Created
            </Button>
            <Button variant="outline" size="sm" onClick={() => addFilter("Added")}>
              <ChevronDown className="h-3 w-3 mr-1" />
              Added
            </Button>
            <Button variant="outline" size="sm" onClick={() => addFilter("Permissions")}>
              <ChevronDown className="h-3 w-3 mr-1" />
              Permissions
            </Button>
            {activeFilters.length > 0 && (
              <Button variant="ghost" size="sm" onClick={() => setActiveFilters([])} className="text-muted-foreground">
                × Reset filters
              </Button>
            )}
          </div>

          {/* Active filters */}
          {activeFilters.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {activeFilters.map((filter) => (
                <Badge key={filter} variant="secondary" className="gap-1">
                  {filter}
                  <button
                    onClick={() => removeFilter(filter)}
                    className="ml-1 hover:bg-foreground/20 rounded-full transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Documents count and pagination */}
      <div className="bg-card border-b px-4 py-2 flex items-center justify-between border-muted">
        <span className="text-sm text-muted-foreground">
          {mockFolders.length > 0 && `${mockFolders.length} folders, `}
          {mockDocuments.length} documents
        </span>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm">1</span>
          <span className="text-sm text-muted-foreground">2</span>
          <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

export default DocumentsView
