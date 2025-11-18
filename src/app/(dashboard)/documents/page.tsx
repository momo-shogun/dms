'use client'

// Documents Page with filtering and multiple view modes

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import {
  Search,
  Filter,
  Grid3X3,
  List,
  Table,
  Upload,
  SortAsc,
  SortDesc,
  Plus,
  Star,
  Download,
  Share,
  MoreHorizontal,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAppDispatch, useAppSelector } from '@/src/lib/store/store'
import { 
  fetchDocumentsAsync,
  setFilters,
  setViewMode,
  selectDocuments,
  selectFolders,
  selectIsLoading,
  selectError
} from '@/src/lib/store/slices/documents-slice'

const mockDocuments = [
  {
    id: '1',
    name: 'Project Proposal Q4 2024.pdf',
    size: '2.4 MB',
    type: 'pdf',
    lastModified: '2024-11-15T10:30:00Z',
    createdAt: '2024-11-10T08:15:00Z',
    author: 'Amit Kumar',
    tags: ['project', 'proposal', 'q4'],
    isStarred: true,
    folderId: 'f1',
  },
  {
    id: '2',
    name: 'Budget Analysis.xlsx',
    size: '1.8 MB',
    type: 'xlsx',
    lastModified: '2024-11-15T08:20:00Z',
    createdAt: '2024-11-12T14:30:00Z',
    author: 'Priya Singh',
    tags: ['budget', 'analysis', 'finance'],
    isStarred: false,
    folderId: 'f2',
  },
  {
    id: '3',
    name: 'Team Meeting Notes.docx',
    size: '234 KB',
    type: 'docx',
    lastModified: '2024-11-14T16:45:00Z',
    createdAt: '2024-11-14T16:00:00Z',
    author: 'Rahul Sharma',
    tags: ['meeting', 'notes', 'team'],
    isStarred: true,
    folderId: 'f1',
  },
  {
    id: '4',
    name: 'Design Mockups.zip',
    size: '15.2 MB',
    type: 'zip',
    lastModified: '2024-11-13T11:20:00Z',
    createdAt: '2024-11-13T10:00:00Z',
    author: 'Sneha Patel',
    tags: ['design', 'mockups', 'ui'],
    isStarred: false,
    folderId: 'f3',
  },
  {
    id: '5',
    name: 'Contract Agreement.pdf',
    size: '890 KB',
    type: 'pdf',
    lastModified: '2024-11-12T09:15:00Z',
    createdAt: '2024-11-10T15:30:00Z',
    author: 'Legal Team',
    tags: ['contract', 'legal', 'agreement'],
    isStarred: false,
    folderId: 'f4',
  },
]

function getFileIcon(type: string) {
  switch (type.toLowerCase()) {
    case 'pdf':
      return '📄'
    case 'docx':
    case 'doc':
      return '📝'
    case 'xlsx':
    case 'xls':
      return '📊'
    case 'zip':
    case 'rar':
      return '🗜️'
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif':
      return '🖼️'
    default:
      return '📎'
  }
}

function formatDate(dateString: string) {
  const date = new Date(dateString)
  const now = new Date()
  const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
  
  if (diffInHours < 1) return 'Just now'
  if (diffInHours < 24) return `${diffInHours} hours ago`
  if (diffInHours < 48) return 'Yesterday'
  return date.toLocaleDateString()
}

export default function DocumentsPage() {
  const searchParams = useSearchParams()
  const [searchTerm, setSearchTerm] = useState(searchParams?.get('q') || '')
  const [sortBy, setSortBy] = useState('lastModified')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [filterType, setFilterType] = useState('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'table'>('grid')

  const dispatch = useAppDispatch()
  const documents = useAppSelector(selectDocuments)
  const folders = useAppSelector(selectFolders)
  const isLoading = useAppSelector(selectIsLoading)
  const error = useAppSelector(selectError)

  useEffect(() => {
    dispatch(fetchDocumentsAsync())
  }, [dispatch])

  // Use mock data for now
  const displayDocuments = mockDocuments

  const filteredDocuments = displayDocuments
    .filter((doc) => {
      if (searchTerm) {
        return (
          doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          doc.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
        )
      }
      return true
    })
    .filter((doc) => {
      if (filterType === 'all') return true
      return doc.type === filterType
    })
    .sort((a, b) => {
      let aValue: any, bValue: any

      switch (sortBy) {
        case 'name':
          aValue = a.name.toLowerCase()
          bValue = b.name.toLowerCase()
          break
        case 'size':
          aValue = parseFloat(a.size)
          bValue = parseFloat(b.size)
          break
        case 'lastModified':
          aValue = new Date(a.lastModified)
          bValue = new Date(b.lastModified)
          break
        default:
          aValue = a.name.toLowerCase()
          bValue = b.name.toLowerCase()
      }

      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
      }
    })

  const fileTypes = [...new Set(displayDocuments.map(doc => doc.type))]

  const GridView = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {filteredDocuments.map((doc) => (
        <Card key={doc.id} className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="text-3xl">{getFileIcon(doc.type)}</div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Share className="mr-2 h-4 w-4" />
                    Share
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Star className="mr-2 h-4 w-4" />
                    {doc.isStarred ? 'Remove from favorites' : 'Add to favorites'}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <h3 className="font-medium text-sm mb-2 line-clamp-2">{doc.name}</h3>
            <div className="space-y-1 text-xs text-gray-500">
              <p>{doc.size} • {formatDate(doc.lastModified)}</p>
              <p>by {doc.author}</p>
            </div>
            <div className="flex flex-wrap gap-1 mt-2">
              {doc.tags.slice(0, 2).map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {doc.tags.length > 2 && (
                <Badge variant="outline" className="text-xs">
                  +{doc.tags.length - 2}
                </Badge>
              )}
            </div>
            {doc.isStarred && (
              <Star className="h-4 w-4 text-yellow-400 fill-current mt-2" />
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )

  const ListView = () => (
    <div className="space-y-2">
      {filteredDocuments.map((doc) => (
        <Card key={doc.id} className="hover:shadow-sm transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="text-2xl">{getFileIcon(doc.type)}</div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <h3 className="font-medium">{doc.name}</h3>
                    {doc.isStarred && (
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    )}
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span>{doc.size}</span>
                    <span>•</span>
                    <span>{formatDate(doc.lastModified)}</span>
                    <span>•</span>
                    <span>by {doc.author}</span>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {doc.tags.slice(0, 3).map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Share className="mr-2 h-4 w-4" />
                    Share
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Documents</h1>
          <p className="mt-2 text-sm text-gray-600">
            Manage aur organize kariye apne documents
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <Button variant="outline" size="sm">
            <Plus className="mr-2 h-4 w-4" />
            New Folder
          </Button>
          <Button>
            <Upload className="mr-2 h-4 w-4" />
            Upload
          </Button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search documents..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex space-x-2">
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {fileTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type.toUpperCase()}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Sort by Name</SelectItem>
              <SelectItem value="lastModified">Sort by Modified</SelectItem>
              <SelectItem value="size">Sort by Size</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
          >
            {sortOrder === 'asc' ? (
              <SortAsc className="h-4 w-4" />
            ) : (
              <SortDesc className="h-4 w-4" />
            )}
          </Button>

          <div className="flex border rounded-md">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Documents Display */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-sm text-gray-600">Loading documents...</p>
          </div>
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <p className="text-red-600">{error}</p>
        </div>
      ) : filteredDocuments.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No documents found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm || filterType !== 'all'
              ? 'Try adjusting your search or filters'
              : 'Get started by uploading your first document'}
          </p>
        </div>
      ) : (
        <div>
          <div className="mb-4 text-sm text-gray-600">
            Showing {filteredDocuments.length} of {displayDocuments.length} documents
          </div>
          {viewMode === 'grid' ? <GridView /> : <ListView />}
        </div>
      )}
    </div>
  )
}
