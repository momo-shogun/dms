'use client'

// Documents Header Component - Matches screenshot design

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  FolderPlus,
  Settings,
  Columns,
  Tag,
  Clock,
  Workflow,
  BookOpen,
  Hash,
  Upload,
  ChevronDown,
  Search,
  ArrowRight,
  Download,
  Trash2,
  Copy,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface DocumentsHeaderProps {
  selectedCount?: number
  onFolderCreate?: () => void
  onModify?: () => void
  onColumns?: () => void
  onMeta?: () => void
  onRetention?: () => void
  onWorkflow?: () => void
  onAuditLog?: () => void
  onNumbering?: () => void
  onUpload?: () => void
  onMove?: () => void
  onDownload?: () => void
  onDelete?: () => void
  onDuplicate?: () => void
}

export default function DocumentsHeader({
  selectedCount = 0,
  onFolderCreate,
  onModify,
  onColumns,
  onMeta,
  onRetention,
  onWorkflow,
  onAuditLog,
  onNumbering,
  onUpload,
  onMove,
  onDownload,
  onDelete,
  onDuplicate,
}: DocumentsHeaderProps) {
  const router = useRouter()
  const [localSearchValue, setLocalSearchValue] = useState('')

  const handleSearch = () => {
    if (localSearchValue.trim()) {
      router.push(`/search?query=${encodeURIComponent(localSearchValue.trim())}`)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  // Show different buttons when files are selected
  const hasSelection = selectedCount > 0

  const defaultActionButtons = [
    { icon: FolderPlus, label: '+Folder', onClick: onFolderCreate },
    { icon: Settings, label: 'Modify', onClick: onModify },
    { icon: Columns, label: 'Columns', onClick: onColumns },
    { icon: Tag, label: 'Meta', onClick: onMeta },
    { icon: Clock, label: 'Retention', onClick: onRetention },
    { icon: Workflow, label: 'Workflow', onClick: onWorkflow },
    { icon: BookOpen, label: 'Audit Log', onClick: onAuditLog },
    { icon: Hash, label: 'Numbering', onClick: onNumbering },
  ]

  const selectedActionButtons = [
    { icon: ArrowRight, label: 'Move', onClick: onMove },
    { icon: Download, label: 'Download', onClick: onDownload },
    { icon: Trash2, label: 'Delete', onClick: onDelete },
    { icon: Copy, label: 'Duplicate', onClick: onDuplicate },
  ]

  const actionButtons = hasSelection ? selectedActionButtons : defaultActionButtons

  return (
    <div className="relative bg-muted/50">
      {/* Header bar */}
      <div className="border-b border-border px-6 py-3">
        <div className="flex items-center justify-between">
          {/* Left Section - Action Icons */}
          <div className="flex items-center gap-8">
            {actionButtons.map(({ icon: Icon, label, onClick }) => (
              <button
                key={label}
                onClick={onClick}
                className="flex flex-col items-center gap-1.5 hover:opacity-80 transition-opacity group cursor-pointer"
                title={label}
              >
                <Icon className="h-5 w-5 text-foreground group-hover:text-primary transition-colors" />
                <span className="text-xs text-muted-foreground font-medium leading-tight group-hover:text-foreground transition-colors">{label}</span>
              </button>
            ))}
          </div>

          {/* Right Section - Upload and Search */}
          <div className="flex items-center gap-3">
            {/* Upload Button with Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 h-9 flex items-center gap-2 rounded-md font-medium">
                  <Upload className="h-4 w-4" />
                  <span>Upload</span>
                  <ChevronDown className="h-3 w-3 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onUpload}>
                  Upload Files
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onUpload}>
                  Upload Folder
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Search Bar */}
            <div className="flex items-center gap-2">
              <Input
                type="text"
                placeholder="Search docs, tags, etc"
                value={localSearchValue}
                onChange={(e) => setLocalSearchValue(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-64 bg-white border-gray-300 rounded-md px-3 py-2 h-9 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <Button
                onClick={handleSearch}
                className="bg-blue-600 hover:bg-blue-700 text-white p-2 h-9 w-9 flex items-center justify-center rounded-md"
                aria-label="Search"
              >
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

