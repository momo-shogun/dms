'use client'

import { useState, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Download, Share2, Edit, Clock, Copy, Eye, Trash2, FileText, Calendar as CalendarIcon, User, Tag, File } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useSections } from '@/lib/sections-context'
import { getAllFiles, findFileLocation, type FileItem, type Section, type Folder } from '@/lib/sections'
import BreadcrumbNavigation from '@/src/components/breadcrumb-navigation'

interface InfoFieldProps {
  label: string
  value: string | React.ReactNode
}

const InfoField = ({ label, value }: InfoFieldProps) => (
  <div className="space-y-1">
    <p className="text-sm font-medium text-muted-foreground">{label}</p>
    <p className="text-sm text-foreground">{value}</p>
  </div>
)

export default function DocumentDetailPage() {
  const params = useParams()
  const router = useRouter()
  const documentId = params.id as string
  const [isLockModalOpen, setIsLockModalOpen] = useState(false)
  const [lockUntil, setLockUntil] = useState('')
  const [isLocked, setIsLocked] = useState(false)
  const { sections } = useSections()

  // Find document from all sections
  const document = useMemo(() => {
    for (const section of sections) {
      const files = getAllFiles(section)
      const found = files.find((file: FileItem) => file.id === documentId)
      if (found) return found
    }
    return null
  }, [sections, documentId])

  // Find file location for breadcrumb
  const fileLocation = useMemo(() => {
    if (!document) return null
    return findFileLocation(sections, documentId)
  }, [sections, documentId, document])

  // Build breadcrumb path
  const breadcrumbPath = useMemo(() => {
    if (!fileLocation || !document) return []
    
    const path: Array<{ id: string; name: string; path: string[] }> = []
    const section = sections.find(s => s.id === fileLocation.sectionId)
    if (!section) return []
    
    // Helper to find folder by ID recursively
    function findFolderById(items: (Folder | FileItem)[], folderId: string): Folder | null {
      for (const item of items) {
        if (item.type === 'folder' && item.id === folderId) {
          return item
        }
        if (item.type === 'folder' && item.items) {
          const found = findFolderById(item.items, folderId)
          if (found) return found
        }
      }
      return null
    }
    
    // Build path for each folder in the folderPath
    let currentItems: (Folder | FileItem)[] | undefined = section.items
    const currentPath: string[] = []
    
    for (const folderId of fileLocation.folderPath) {
      if (!currentItems) break
      
      const folder = findFolderById(currentItems, folderId)
      if (folder) {
        currentPath.push(folder.id)
        path.push({
          id: folder.id,
          name: folder.name,
          path: [fileLocation.sectionId, ...currentPath],
        })
        currentItems = folder.items
      } else {
        break
      }
    }
    
    // Add file name as last item (non-clickable, marked as file)
    path.push({
      id: document.id,
      name: document.name,
      path: [fileLocation.sectionId, ...fileLocation.folderPath, document.id],
      isFile: true,
    })
    
    return path
  }, [fileLocation, document, sections])

  if (!document) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-background">
        <FileText className="h-16 w-16 text-muted-foreground mb-4" />
        <h1 className="text-2xl font-bold text-foreground mb-2">Document nahi mila</h1>
        <p className="text-muted-foreground mb-4">Ye document exist nahi karta ya delete ho gaya hai.</p>
        <Button onClick={() => router.push('/documents')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Documents pe wapas jao
        </Button>
      </div>
    )
  }

  const handleDownloadAuditLog = (format: 'xlsx' | 'ods' | 'csv' | 'pdf') => {
    if (!document?.auditLog || document.auditLog.length === 0) {
      console.log('No audit log to download')
      return
    }

    // Format audit log data
    const auditData = document.auditLog.map(entry => ({
      Time: new Date(entry.time).toLocaleString('en-IN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }),
      User: entry.user,
      Action: entry.action
    }))

    if (format === 'csv') {
      // Generate CSV
      const headers = ['Time', 'User', 'Action']
      const rows = auditData.map(row => [row.Time, row.User, row.Action])
      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n')
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = `${document.name}_audit_log.csv`
      link.click()
    } else {
      // For other formats, log for now (in production, use proper libraries)
      console.log(`Downloading audit log in ${format.toUpperCase()} format:`, auditData)
      // In production, you would use libraries like:
      // - xlsx for XLSX
      // - jsPDF for PDF
      // - ods-writer for ODS
    }
  }

  const handleLockClick = () => {
    setIsLockModalOpen(true)
    // Set default date to tomorrow at current time
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const formattedDate = tomorrow.toISOString().slice(0, 16)
    setLockUntil(formattedDate)
  }

  const handleLockConfirm = () => {
    if (lockUntil) {
      setIsLocked(true)
      setIsLockModalOpen(false)
      console.log('File locked until:', lockUntil)
      // Here you would make an API call to lock the file
    }
  }

  const formatDateTime = (dateTimeString: string) => {
    if (!dateTimeString) return ''
    const date = new Date(dateTimeString)
    return date.toLocaleString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    })
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb */}
        {fileLocation && breadcrumbPath.length > 0 && (
          <div className="mb-6">
            <BreadcrumbNavigation
              items={[
                { id: fileLocation.sectionId, name: fileLocation.sectionName, path: [fileLocation.sectionId], alwaysClickable: true },
                ...breadcrumbPath,
              ]}
              onNavigate={(path) => {
                if (path.length === 1 && path[0] === fileLocation.sectionId) {
                  router.push(`/documents?section=${fileLocation.sectionId}`)
                } else if (path[path.length - 1] === documentId) {
                  // File name clicked - do nothing (already on file page)
                  return
                } else {
                  // Navigate to folder
                  const pathToFolder = path.slice(1) // Remove section ID
                  router.push(`/documents?section=${fileLocation.sectionId}&folder=${pathToFolder.join('/')}`)
                }
              }}
            />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Document Header */}
            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-start gap-4">
                {/* PDF Icon */}
                <div className="shrink-0">
                  <div className="w-16 h-20 bg-destructive/10 rounded flex items-center justify-center">
                    <FileText className="h-8 w-8 text-destructive" />
                  </div>
                </div>
                
                {/* Document Info */}
                <div className="flex-1 min-w-0">
                  <h1 className="text-2xl font-bold text-card-foreground mb-2 wrap-break-word">
                    {document.name}
                  </h1>
                  <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <File className="h-4 w-4" />
                      {document.size}
                    </span>
                    <span className="flex items-center gap-1">
                      <CalendarIcon className="h-4 w-4" />
                      {new Date(document.lastModified).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric'
                      })}
                    </span>
                    <span className="flex items-center gap-1">
                      <User className="h-4 w-4" />
                      {document.author}
                    </span>
                  </div>
                  
                  {/* Tags */}
                  {document.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {document.tags.map((tag: string) => (
                        <Badge key={tag} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Notes Section */}
            <div className="bg-card border border-border rounded-lg p-6">
              <h2 className="text-lg font-semibold text-card-foreground mb-4">Notes</h2>
              <textarea
                className="w-full min-h-[120px] p-3 bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 resize-none text-foreground placeholder:text-muted-foreground"
                placeholder="Add notes about this document..."
              />
            </div>

            {/* Document Metadata */}
            <div className="bg-card border border-border rounded-lg p-6">
              <h2 className="text-lg font-semibold text-card-foreground mb-4">Document Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoField label="Document ID" value={document.id} />
                <InfoField 
                  label="Date" 
                  value={new Date(document.lastModified).toLocaleDateString('en-IN', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric'
                  })} 
                />
                <InfoField 
                  label="Created Date" 
                  value={new Date(document.createdAt).toLocaleDateString('en-IN', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric'
                  })} 
                />
                <InfoField label="OCR Language" value="English" />
                <InfoField label="Document Type" value={document.fileType.toUpperCase()} />
                <InfoField label="Author" value={document.author} />
              </div>
            </div>

            {/* Audit Log */}
            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-card-foreground">Audit Log</h2>
                {document.auditLog && document.auditLog.length > 0 && (
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">Download Log:</span>
                  <button 
                      onClick={() => handleDownloadAuditLog('xlsx')}
                    className="text-primary hover:underline hover:text-primary/80 transition-colors"
                  >
                    XLSX
                  </button>
                  <span className="text-muted-foreground">/</span>
                  <button 
                      onClick={() => handleDownloadAuditLog('ods')}
                    className="text-primary hover:underline hover:text-primary/80 transition-colors"
                  >
                    ODS
                  </button>
                  <span className="text-muted-foreground">/</span>
                  <button 
                      onClick={() => handleDownloadAuditLog('csv')}
                    className="text-primary hover:underline hover:text-primary/80 transition-colors"
                  >
                    CSV
                  </button>
                  <span className="text-muted-foreground">/</span>
                  <button 
                      onClick={() => handleDownloadAuditLog('pdf')}
                    className="text-primary hover:underline hover:text-primary/80 transition-colors"
                  >
                    PDF
                  </button>
                </div>
                )}
              </div>

              {/* Audit Log Table */}
              <div className="overflow-x-auto">
                {document.auditLog && document.auditLog.length > 0 ? (
                <table className="w-full">
                  <thead className="border-b border-border">
                    <tr>
                      <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Time</th>
                      <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">User</th>
                      <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                      {document.auditLog.map((entry, index) => (
                        <tr key={index} className="border-b border-border">
                      <td className="py-3 px-2 text-sm text-foreground">
                            {new Date(entry.time).toLocaleString('en-IN', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit'
                        })}
                      </td>
                      <td className="py-3 px-2 text-sm">
                        <a href="#" className="text-primary hover:underline hover:text-primary/80 transition-colors">
                              {entry.user}
                        </a>
                      </td>
                          <td className="py-3 px-2 text-sm text-foreground">{entry.action}</td>
                    </tr>
                      ))}
                  </tbody>
                </table>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No audit log entries available</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Sidebar - Actions */}
          <div className="lg:col-span-1">
            <div className="bg-card border border-border rounded-lg p-6 space-y-4 sticky top-6">
              {/* Reminders */}
              <div>
                <h3 className="text-sm font-semibold text-primary mb-2">Reminders:</h3>
                <button className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-2 transition-colors">
                  <span>▶</span>
                  Add new reminder
                </button>
              </div>

              {/* Shared to */}
              <div className="pt-4 border-t border-border">
                <h3 className="text-sm font-semibold text-primary mb-2">Shared to:</h3>
                <button className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-2 transition-colors">
                  <Share2 className="h-4 w-4" />
                  Edit
                </button>
              </div>

              {/* Retention */}
              <div className="pt-4 border-t border-border">
                <h3 className="text-sm font-semibold text-primary mb-2">Retention:</h3>
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Infinite
                </p>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-border space-y-2">
                <Button 
                  className="w-full"
                  variant="outline"
                  onClick={() => router.push(`/file/edit/${documentId}`)}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit File
                </Button>
                <Button 
                  className="w-full"
                  onClick={handleLockClick}
                  disabled={isLocked}
                >
                  {isLocked ? 'File Locked' : 'Lock file'}
                </Button>
                <Button className="w-full">
                  Upload new version
                </Button>
                <Button className="w-full">
                  Start approval workflow
                </Button>
                <Button className="w-full">
                  Start review workflow
                </Button>
                <Button className="w-full">
                  Start acknowledgment workflow
                </Button>
              </div>

              {/* Electronic Signing */}
              <div className="pt-4 border-t border-border">
                <h3 className="text-lg font-semibold text-card-foreground mb-3">Electronic signing</h3>
                <Button className="w-full">
                  Start Folderit eSign workflow
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lock File Modal */}
      <Dialog open={isLockModalOpen} onOpenChange={setIsLockModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="bg-primary text-primary-foreground -m-6 mb-4 p-6 rounded-t-lg">
            <DialogTitle className="text-lg font-semibold text-primary-foreground">
              Are you sure you want to lock the file?
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* File Name */}
            <div>
              <p className="text-sm text-muted-foreground mb-1">File:</p>
              <p className="text-sm font-medium text-foreground wrap-break-word">
                {document.name}
              </p>
            </div>

            {/* Lock Until Date/Time Picker */}
            <div className="space-y-2">
              <label htmlFor="lock-until" className="text-sm font-medium text-foreground">
                Locked until
              </label>
              <div className="relative">
                <Input
                  id="lock-until"
                  type="datetime-local"
                  value={lockUntil}
                  onChange={(e) => setLockUntil(e.target.value)}
                  className="w-full pr-10"
                  min={new Date().toISOString().slice(0, 16)}
                />
                <CalendarIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              </div>
              {lockUntil && (
                <p className="text-xs text-muted-foreground">
                  {formatDateTime(lockUntil)}
                </p>
              )}
            </div>

            {/* Info Text */}
            <p className="text-sm text-muted-foreground">
              Other editors will not be able to change the metadata or add new versions until the file is unlocked.
            </p>
          </div>

          <DialogFooter className="mt-6">
            <Button
              variant="outline"
              onClick={() => setIsLockModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleLockConfirm}
              disabled={!lockUntil}
            >
              LOCK
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

