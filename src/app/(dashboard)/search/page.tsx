'use client'

import { useState, Suspense, useMemo, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Search, Share2, Settings, Download, ArrowUpDown, ZoomIn, Plus, Folder as FolderIcon, Grid3X3, List, FileEdit, Clock, Share, Copy, Eye, Trash2, Calendar as CalendarIcon, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { format } from 'date-fns'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { useSections } from '@/lib/sections-context'
import { getAllFiles, type Section, type Folder as FolderType, type FileItem } from '@/lib/sections'
import { FileTypeIcon } from '@/src/components/file-type-icons'
import DocumentsListView from '@/src/components/documents-list-view'
import DocumentsGalleryView from '@/src/components/documents-gallery-view'
import type { DocumentItem, FolderItem } from '@/src/components/documents-list-view'
import { cn } from '@/lib/utils'

interface SearchResult {
  id: string
  name: string
  type: 'file' | 'folder'
  fileType?: string
  sectionName: string
  date: string
  score: number
  path: string[]
  size?: string
  author?: string
  tags?: string[]
  lastModified?: string
  createdAt?: string
  isStarred?: boolean
  sectionId?: string
}

function SearchContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { sections, deleteFile } = useSections()
  
  const query = searchParams?.get('query') || ''
  const [searchTerm, setSearchTerm] = useState(query)
  const [searchFilter, setSearchFilter] = useState<'all' | 'filename' | 'foldername' | 'metadata' | 'content' | 'notes'>('all')
  const [sortBy, setSortBy] = useState<'score' | 'date' | 'name'>('score')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [selectedResults, setSelectedResults] = useState<string[]>([])
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list')
  const [isAdvancedSearchOpen, setIsAdvancedSearchOpen] = useState(false)
  
  // Advanced search filters
  const [selectedFolder, setSelectedFolder] = useState<string>('')
  const [dateFrom, setDateFrom] = useState<string>('')
  const [dateTo, setDateTo] = useState<string>('')

  // Update search term when URL query changes
  useEffect(() => {
    if (query) {
      setSearchTerm(query)
    }
  }, [query])

  // Search function
  const searchResults = useMemo(() => {
    if (!searchTerm.trim()) return []

    const results: SearchResult[] = []
    const searchLower = searchTerm.toLowerCase()

    // Helper to calculate relevance score
    const calculateScore = (text: string, matchType: 'exact' | 'partial' | 'contains'): number => {
      const textLower = text.toLowerCase()
      if (textLower === searchLower) return 100
      if (textLower.startsWith(searchLower)) return 80
      if (textLower.includes(searchLower)) return 60
      return 0
    }

    // Search through all sections
    for (const section of sections) {
      // Search in section name
      if (searchFilter === 'all' || searchFilter === 'foldername') {
        if (section.name.toLowerCase().includes(searchLower)) {
          results.push({
            id: section.id,
            name: section.name,
            type: 'folder',
            sectionName: section.name,
            date: new Date().toISOString(),
            score: calculateScore(section.name, 'contains'),
            path: [section.id],
          })
        }
      }

      // Recursive function to search in folders and files
      function searchInItems(
        items: (FolderType | FileItem)[],
        sectionName: string,
        currentPath: string[] = []
      ) {
        for (const item of items) {
          if (item.type === 'folder') {
            // Search folder name
            if (searchFilter === 'all' || searchFilter === 'foldername') {
              if (item.name.toLowerCase().includes(searchLower)) {
                results.push({
                  id: item.id,
                  name: item.name,
                  type: 'folder',
                  sectionName,
                  date: new Date().toISOString(),
                  score: calculateScore(item.name, 'contains'),
                  path: [section.id, ...currentPath, item.id],
                })
              }
            }

            // Search in folder items recursively
            if (item.items) {
              searchInItems(item.items, sectionName, [...currentPath, item.id])
            }
          } else if (item.type === 'file') {
            let score = 0
            let shouldInclude = false

            // Search file name
            if (searchFilter === 'all' || searchFilter === 'filename') {
              if (item.name.toLowerCase().includes(searchLower)) {
                score = Math.max(score, calculateScore(item.name, 'contains'))
                shouldInclude = true
              }
            }

            // Search metadata (tags, author)
            if (searchFilter === 'all' || searchFilter === 'metadata') {
              const tagsMatch = item.tags?.some((tag: string) => tag.toLowerCase().includes(searchLower))
              const authorMatch = item.author?.toLowerCase().includes(searchLower)
              if (tagsMatch || authorMatch) {
                score = Math.max(score, tagsMatch ? 50 : 40)
                shouldInclude = true
              }
            }

            // Search in notes/description (if available)
            if (searchFilter === 'all' || searchFilter === 'notes') {
              // Assuming notes might be in audit log or description field
              const notesMatch = item.auditLog?.some((log: { action?: string }) => 
                log.action?.toLowerCase().includes(searchLower)
              )
              if (notesMatch) {
                score = Math.max(score, 30)
                shouldInclude = true
              }
            }

            // Content search (file content - placeholder, would need actual content search)
            if (searchFilter === 'all' || searchFilter === 'content') {
              // This would require actual file content indexing
              // For now, we'll skip this or use filename as proxy
            }

            if (shouldInclude && score > 0) {
              results.push({
                id: item.id,
                name: item.name,
                type: 'file',
                fileType: item.fileType,
                sectionName,
                date: item.lastModified,
                score,
                path: [section.id, ...currentPath],
                size: item.size,
                author: item.author,
                tags: item.tags,
                lastModified: item.lastModified,
                createdAt: item.createdAt,
                isStarred: item.isStarred,
                sectionId: section.id,
              })
            }
          }
        }
      }

      if (section.items) {
        searchInItems(section.items, section.name)
      }
    }

    return results
  }, [searchTerm, searchFilter, sections])

  // Sort results
  const sortedResults = useMemo(() => {
    const sorted = [...searchResults].sort((a, b) => {
      let comparison = 0

      if (sortBy === 'score') {
        comparison = a.score - b.score
      } else if (sortBy === 'date') {
        comparison = new Date(a.date).getTime() - new Date(b.date).getTime()
      } else if (sortBy === 'name') {
        comparison = a.name.localeCompare(b.name)
      }

      return sortOrder === 'desc' ? -comparison : comparison
    })

    return sorted
  }, [searchResults, sortBy, sortOrder])

  const handleSearch = () => {
    if (searchTerm.trim()) {
      router.push(`/search?query=${encodeURIComponent(searchTerm.trim())}`)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedResults(sortedResults.map(r => r.id))
    } else {
      setSelectedResults([])
    }
  }

  const handleSelectResult = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedResults([...selectedResults, id])
    } else {
      setSelectedResults(selectedResults.filter(r => r !== id))
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const day = String(date.getDate()).padStart(2, '0')
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const year = date.getFullYear()
    return `${day}/${month}/${year}`
  }

  const handleExport = (format: 'xlsx' | 'ods' | 'csv' | 'pdf') => {
    // Export functionality - placeholder
    console.log(`Exporting to ${format}`, selectedResults.length > 0 ? selectedResults : sortedResults)
  }

  const handleResultClick = (result: SearchResult) => {
    if (result.type === 'file') {
      router.push(`/documents/${result.id}`)
    } else {
      // Navigate to folder
      const sectionId = result.path[0]
      const folderPath = result.path.slice(1)
      const folderQuery = folderPath.length > 0 ? `&folder=${folderPath.join('/')}` : ''
      router.push(`/documents?section=${sectionId}${folderQuery}`)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Page Header */}
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-foreground">Search</h1>
          <p className="text-muted-foreground">Find documents, folders, and files across all sections</p>
        </div>

        {/* Search Header */}
        <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="flex-1 space-y-2">
                <Label htmlFor="search-term" className="text-sm font-semibold text-foreground">
                  Search term
                </Label>
                <div className="flex gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="search-term"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Search documents, tags, metadata..."
                      className="pl-10 h-11 text-base"
                    />
                  </div>
                  <Button
                    onClick={handleSearch}
                    size="lg"
                    className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 h-11"
                  >
                    <Search className="h-4 w-4 mr-2" />
                    Search
                  </Button>
                </div>
              </div>
              <div className="flex items-end pt-7">
                <Button 
                  variant="outline" 
                  className="text-primary border-primary/50 hover:bg-primary/5"
                  onClick={() => setIsAdvancedSearchOpen(true)}
                >
                  Advanced search
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Search Term Filter - Conditionally Rendered */}
        {query && (
          <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
            <div className="space-y-3">
              <Label className="text-sm font-semibold text-foreground">Search in:</Label>
              <RadioGroup
                value={searchFilter}
                onValueChange={(value) => setSearchFilter(value as typeof searchFilter)}
                className="flex flex-wrap gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="all" id="filter-all" />
                  <Label htmlFor="filter-all" className="cursor-pointer text-sm font-medium">All</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="filename" id="filter-filename" />
                  <Label htmlFor="filter-filename" className="cursor-pointer text-sm font-medium">File name</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="foldername" id="filter-foldername" />
                  <Label htmlFor="filter-foldername" className="cursor-pointer text-sm font-medium">Folder name</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="metadata" id="filter-metadata" />
                  <Label htmlFor="filter-metadata" className="cursor-pointer text-sm font-medium">Metadata</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="content" id="filter-content" />
                  <Label htmlFor="filter-content" className="cursor-pointer text-sm font-medium">Content</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="notes" id="filter-notes" />
                  <Label htmlFor="filter-notes" className="cursor-pointer text-sm font-medium">Notes</Label>
                </div>
              </RadioGroup>
            </div>
          </div>
        )}

        {/* Search Results */}
        {query && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h2 className="text-xl font-bold text-foreground">Search Results</h2>
                <p className="text-sm text-muted-foreground">
                  Found {sortedResults.length} {sortedResults.length === 1 ? 'result' : 'results'} for "{query}"
                </p>
              </div>
              
              {/* View Toggle */}
              <div className="flex items-center gap-1 bg-muted/30 border border-border rounded-lg p-1">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className={cn(
                          "h-9 w-9 p-0 transition-all duration-200",
                          viewMode === 'list' 
                            ? 'text-primary bg-background shadow-sm' 
                            : 'text-muted-foreground hover:text-foreground hover:bg-transparent'
                        )}
                        onClick={() => setViewMode('list')}
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
                          "h-9 w-9 p-0 transition-all duration-200",
                          viewMode === 'grid' 
                            ? 'text-primary bg-background shadow-sm' 
                            : 'text-muted-foreground hover:text-foreground hover:bg-transparent'
                        )}
                        onClick={() => setViewMode('grid')}
                      >
                        <Grid3X3 className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Grid View</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
            
            {sortedResults.length === 0 ? (
              <div className="bg-card border border-border rounded-lg p-12 text-center">
                <div className="max-w-md mx-auto space-y-4">
                  <div className="w-16 h-16 mx-auto bg-muted/50 rounded-full flex items-center justify-center">
                    <Search className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-foreground">No results found</h3>
                    <p className="text-sm text-muted-foreground">
                      No results found for "<span className="font-medium text-foreground">"{query}"</span>". Try adjusting your search term or filters.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <>
                {viewMode === 'list' ? (
                  /* Results Table */
                  <div className="bg-card border border-border rounded-lg overflow-hidden shadow-sm">
                    <table className="w-full">
                      <thead className="bg-muted/30 border-b border-border">
                        <tr>
                          <th className="w-12 p-4 text-left">
                            <Checkbox
                              checked={selectedResults.length === sortedResults.length && sortedResults.length > 0}
                              onCheckedChange={handleSelectAll}
                            />
                          </th>
                          <th className="p-4 text-left text-sm font-semibold text-foreground">Name</th>
                          <th className="p-4 text-left text-sm font-semibold text-foreground">Date</th>
                          <th className="p-4 text-left text-sm font-semibold text-foreground">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <button
                                    onClick={() => {
                                      if (sortBy === 'score') {
                                        setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
                                      } else {
                                        setSortBy('score')
                                        setSortOrder('desc')
                                      }
                                    }}
                                    className="flex items-center gap-1.5 hover:text-primary transition-colors font-semibold"
                                  >
                                    Relevance
                                    <ArrowUpDown className="h-3.5 w-3.5" />
                                  </button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p className="font-semibold mb-1">Relevance Score</p>
                                  <p className="text-xs">Based on match quality:</p>
                                  <ul className="text-xs mt-1 space-y-0.5">
                                    <li>• Exact match: 100%</li>
                                    <li>• Starts with: 80%</li>
                                    <li>• Contains: 60%</li>
                                    <li>• Metadata match: 40-50%</li>
                                  </ul>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </th>
                          <th className="w-32 p-4 text-left text-sm font-semibold text-foreground">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sortedResults.map((result) => (
                          <tr
                            key={result.id}
                            className="border-b border-border/50 hover:bg-muted/20 transition-colors cursor-pointer group"
                            onClick={() => handleResultClick(result)}
                          >
                            <td className="p-4" onClick={(e) => e.stopPropagation()}>
                              <Checkbox
                                checked={selectedResults.includes(result.id)}
                                onCheckedChange={(checked) => handleSelectResult(result.id, checked as boolean)}
                              />
                            </td>
                            <td className="p-4">
                              <div className="flex items-center gap-3">
                                <div className="relative shrink-0">
                                  {result.type === 'folder' ? (
                                    <FolderIcon className="h-7 w-7 text-primary" />
                                  ) : (
                                    <FileTypeIcon
                                      fileType={result.fileType || 'unknown'}
                                      size={28}
                                      className="text-primary"
                                    />
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                                    {result.name}
                                  </p>
                                  <p className="text-xs text-muted-foreground mt-0.5">
                                    {result.sectionName}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="p-4 text-sm text-foreground">
                              {formatDate(result.date)}
                            </td>
                            <td className="p-4">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-semibold text-foreground">
                                  {result.score.toFixed(0)}%
                                </span>
                                <div className={cn(
                                  "h-2 w-16 rounded-full overflow-hidden bg-muted",
                                  result.score >= 80 && "bg-green-500/20",
                                  result.score >= 60 && result.score < 80 && "bg-yellow-500/20",
                                  result.score < 60 && "bg-orange-500/20"
                                )}>
                                  <div 
                                    className={cn(
                                      "h-full rounded-full transition-all",
                                      result.score >= 80 && "bg-green-500",
                                      result.score >= 60 && result.score < 80 && "bg-yellow-500",
                                      result.score < 60 && "bg-orange-500"
                                    )}
                                    style={{ width: `${result.score}%` }}
                                  />
                                </div>
                              </div>
                            </td>
                            <td className="p-4" onClick={(e) => e.stopPropagation()}>
                              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0 hover:bg-muted"
                                  onClick={() => console.log('Share', result.id)}
                                >
                                  <Share2 className="h-4 w-4" />
                                </Button>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-8 w-8 p-0 hover:bg-muted"
                                    >
                                      <Settings className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    {result.type === 'file' && (
                                      <DropdownMenuItem 
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          router.push(`/file/edit/${result.id}`)
                                        }}
                                      >
                                        <FileEdit className="mr-2 h-4 w-4" />
                                        Edit metadata
                                      </DropdownMenuItem>
                                    )}
                                    <DropdownMenuItem 
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        console.log('Retention', result.id)
                                      }}
                                    >
                                      <Clock className="mr-2 h-4 w-4" />
                                      Retention
                                    </DropdownMenuItem>
                                    <DropdownMenuItem 
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        console.log('Share', result.id)
                                      }}
                                    >
                                      <Share className="mr-2 h-4 w-4" />
                                      Share
                                    </DropdownMenuItem>
                                    {result.type === 'file' && (
                                      <DropdownMenuItem 
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          console.log('Duplicate', result.id)
                                        }}
                                      >
                                        <Copy className="mr-2 h-4 w-4" />
                                        Duplicate
                                      </DropdownMenuItem>
                                    )}
                                    <DropdownMenuItem 
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        console.log('Watch', result.id)
                                      }}
                                    >
                                      <Eye className="mr-2 h-4 w-4" />
                                      Watch
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem 
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        if (confirm(`Are you sure you want to delete "${result.name}"?`)) {
                                          if (result.type === 'file') {
                                            deleteFile(result.id)
                                            // Remove from selected results if selected
                                            setSelectedResults(selectedResults.filter(id => id !== result.id))
                                          } else {
                                            // Handle folder delete - would need deleteFolder function
                                            console.log('Delete folder', result.id)
                                          }
                                        }
                                      }}
                                      className="text-destructive focus:text-destructive"
                                    >
                                      <Trash2 className="mr-2 h-4 w-4" />
                                      Delete
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0 hover:bg-muted"
                                  onClick={() => console.log('Download', result.id)}
                                >
                                  <Download className="h-4 w-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  /* Gallery View */
                  <DocumentsGalleryView
                    documents={sortedResults
                      .filter(r => r.type === 'file')
                      .map(r => ({
                        id: r.id,
                        name: r.name,
                        size: r.size || '',
                        type: r.fileType || 'unknown',
                        lastModified: r.lastModified || r.date,
                        createdAt: r.createdAt || r.date,
                        author: r.author || '',
                        tags: r.tags || [],
                        isStarred: r.isStarred || false,
                        sectionId: r.sectionId || '',
                      }))}
                    folders={sortedResults
                      .filter(r => r.type === 'folder')
                      .map(r => ({
                        id: r.id,
                        name: r.name,
                        folderCount: 0,
                        fileCount: 0,
                        itemCount: 0,
                      }))}
                    onDocumentClick={(doc) => {
                      const result = sortedResults.find(r => r.id === doc.id)
                      if (result) handleResultClick(result)
                    }}
                    onFolderClick={(folder) => {
                      const result = sortedResults.find(r => r.id === folder.id)
                      if (result) handleResultClick(result)
                    }}
                    viewMode={viewMode}
                    onViewModeChange={setViewMode}
                  />
                )}

                {/* Export Options */}
                <div className="flex justify-end items-center gap-3 pt-4 border-t border-border">
                  <span className="text-sm font-medium text-muted-foreground">Export report to:</span>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 text-xs"
                      onClick={() => handleExport('xlsx')}
                    >
                      XLSX
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 text-xs"
                      onClick={() => handleExport('ods')}
                    >
                      ODS
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 text-xs"
                      onClick={() => handleExport('csv')}
                    >
                      CSV
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 text-xs"
                      onClick={() => handleExport('pdf')}
                    >
                      PDF
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Advanced Search Dialog */}
      <Dialog open={isAdvancedSearchOpen} onOpenChange={setIsAdvancedSearchOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">Advanced search</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            {/* Folder Input */}
            <div className="flex items-center gap-4">
              <Label htmlFor="folder-input" className="text-sm font-medium text-foreground min-w-[80px]">
                Folder
              </Label>
              <Input
                id="folder-input"
                value={selectedFolder}
                onChange={(e) => setSelectedFolder(e.target.value)}
                placeholder="Enter folder path..."
                className="flex-1"
              />
            </div>

            {/* Date Input */}
            <div className="flex items-center gap-4">
              <Label className="text-sm font-medium text-foreground min-w-[80px]">
                Date
              </Label>
              <div className="flex-1 flex gap-2">
                <Input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  placeholder="from"
                  className="flex-1"
                />
                <Input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  placeholder="to"
                  className="flex-1"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-2 pt-4 border-t border-border">
              <Button
                variant="outline"
                onClick={() => {
                  setIsAdvancedSearchOpen(false)
                  // Reset filters
                  setSelectedFolder('')
                  setDateFrom('')
                  setDateTo('')
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  setIsAdvancedSearchOpen(false)
                  
                  // Build query with filters
                  const queryParams = new URLSearchParams()
                  if (searchTerm) {
                    queryParams.set('query', searchTerm)
                  }
                  if (selectedFolder) {
                    queryParams.set('folder', selectedFolder)
                  }
                  if (dateFrom) {
                    queryParams.set('dateFrom', dateFrom)
                  }
                  if (dateTo) {
                    queryParams.set('dateTo', dateTo)
                  }
                  
                  router.push(`/search?${queryParams.toString()}`)
                }}
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                <Search className="h-4 w-4 mr-2" />
                SEARCH
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background p-6">Loading...</div>}>
      <SearchContent />
    </Suspense>
  )
}

