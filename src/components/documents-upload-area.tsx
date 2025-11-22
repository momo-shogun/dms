'use client'

// File Upload Component with Progress Tracking

import { useState, useCallback, useRef } from 'react'
import { Upload, X, Settings, CheckCircle2, Loader2, AlertCircle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'

export interface UploadingFile {
  id: string
  name: string
  size: number
  progress: number
  status: 'uploading' | 'done' | 'error'
  speed: number // KB/s
  elapsedTime: number // seconds
  uploadedBytes: number
}

interface DocumentsUploadAreaProps {
  onUploadComplete?: (files: File[]) => void
  onFileRemove?: (fileId: string) => void
}

export default function DocumentsUploadArea({ 
  onUploadComplete,
  onFileRemove 
}: DocumentsUploadAreaProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const uploadedFilesRef = useRef<Map<string, File>>(new Map())

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
  }

  const formatTime = (seconds: number): string => {
    const hrs = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = Math.floor(seconds % 60)
    return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
  }

  const simulateUpload = useCallback((file: File, fileId: string) => {
    // Store the file reference
    uploadedFilesRef.current.set(fileId, file)
    
    const fileSize = file.size
    let uploaded = 0
    let startTime = Date.now()
    let lastUpdate = startTime
    let lastUploaded = 0

    const interval = setInterval(() => {
      const now = Date.now()
      const elapsed = (now - startTime) / 1000
      
      // Simulate upload progress (you can replace this with actual upload logic)
      uploaded += fileSize / 100 // Simulate 1% progress per interval
      
      if (uploaded > fileSize) {
        uploaded = fileSize
      }

      // Calculate speed
      const timeDiff = (now - lastUpdate) / 1000
      const uploadedDiff = uploaded - lastUploaded
      const speed = timeDiff > 0 ? (uploadedDiff / timeDiff) / 1024 : 0 // KB/s

      const progress = (uploaded / fileSize) * 100

      setUploadingFiles((prev) => {
        const updated = prev.map((f) =>
          f.id === fileId
            ? {
                ...f,
                progress,
                speed,
                elapsedTime: elapsed,
                uploadedBytes: uploaded,
                status: progress >= 100 ? 'done' : 'uploading',
              }
            : f
        )
        
        // Check if all files are done
        const allDone = updated.every(f => f.status === 'done')
        if (allDone && updated.length > 0 && onUploadComplete) {
          // Get all uploaded files
          const files = Array.from(uploadedFilesRef.current.values())
          // Call onUploadComplete with all files
          setTimeout(() => {
            onUploadComplete(files)
            // Clear the ref
            uploadedFilesRef.current.clear()
          }, 100)
        }
        
        return updated
      })

      if (progress >= 100) {
        clearInterval(interval)
      }

      lastUpdate = now
      lastUploaded = uploaded
    }, 100) // Update every 100ms
  }, [onUploadComplete])

  const handleFiles = useCallback((files: FileList | null) => {
    if (!files || files.length === 0) return

    const newFiles: UploadingFile[] = Array.from(files).map((file) => ({
      id: `${Date.now()}-${Math.random()}`,
      name: file.name,
      size: file.size,
      progress: 0,
      status: 'uploading' as const,
      speed: 0,
      elapsedTime: 0,
      uploadedBytes: 0,
    }))

    setUploadingFiles((prev) => [...prev, ...newFiles])

    // Start upload simulation for each file
    Array.from(files).forEach((file, index) => {
      setTimeout(() => {
        simulateUpload(file, newFiles[index].id)
      }, index * 100) // Stagger uploads slightly
    })
  }, [simulateUpload])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const files = e.dataTransfer.files
    handleFiles(files)
  }, [handleFiles])

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files)
    // Reset input so same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }, [handleFiles])

  const handleRemoveFile = useCallback((fileId: string) => {
    setUploadingFiles((prev) => prev.filter((f) => f.id !== fileId))
    if (onFileRemove) {
      onFileRemove(fileId)
    }
  }, [onFileRemove])

  const handleClick = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  const getStatusIcon = (status: UploadingFile['status']) => {
    switch (status) {
      case 'done':
        return <CheckCircle2 className="h-4 w-4 text-green-600" />
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-600" />
      case 'uploading':
        return <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />
      default:
        return null
    }
  }

  const getStatusText = (status: UploadingFile['status']) => {
    switch (status) {
      case 'done':
        return 'Done'
      case 'error':
        return 'Error'
      case 'uploading':
        return 'Uploading'
      default:
        return 'Pending'
    }
  }

  return (
    <div className="flex gap-6 h-full">
      {/* Left Side - Enhanced Drag and Drop Area */}
      <div className={` ${uploadingFiles.length > 0 ? 'w-1/2' : 'w-full'}`}>
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleClick}
          className={cn(
            "relative border-2 border-dashed rounded-xl p-12 text-center transition-all duration-300 cursor-pointer h-full flex items-center justify-center overflow-hidden",
            "bg-gradient-to-br from-background to-muted/30",
            isDragging
              ? "border-primary bg-primary/5 shadow-lg shadow-primary/20 scale-[1.02]"
              : "border-border hover:border-primary/50 hover:bg-accent/30 hover:shadow-md"
          )}
        >
          {/* Animated background gradient on drag */}
          {isDragging && (
            <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 animate-pulse" />
          )}
          
          <div className="relative z-10 flex flex-col items-center gap-4">
            <div className={cn(
              "p-4 rounded-full transition-all duration-300",
              isDragging 
                ? "bg-primary/20 scale-110" 
                : "bg-muted"
            )}>
              <Upload className={cn(
                "h-12 w-12 transition-all duration-300",
                isDragging ? "text-primary animate-bounce" : "text-muted-foreground"
              )} />
            </div>
            <div className="space-y-2">
              <p className={cn(
                "text-lg font-semibold transition-colors",
                isDragging ? "text-primary" : "text-foreground"
              )}>
                {isDragging ? 'Drop files here' : 'Click or drag files here'}
              </p>
              <p className="text-sm text-muted-foreground">
                Supports multiple file uploads
              </p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={handleFileInput}
            />
          </div>
        </div>
      </div>

      {/* Right Side - Enhanced Upload Progress List */}
      {uploadingFiles.length > 0 && (
        <div className="w-1/2 border border-border rounded-xl bg-card shadow-md overflow-hidden">
          <div className="border-b border-border bg-muted/30 px-4 py-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground">
                Uploading Files ({uploadingFiles.length})
              </h3>
              <Badge variant="secondary" className="text-xs">
                {uploadingFiles.filter(f => f.status === 'uploading').length} active
              </Badge>
            </div>
          </div>
          <div className="overflow-y-auto max-h-[600px]">
            <div className="divide-y divide-border">
                {uploadingFiles.map((file) => (
                <div 
                  key={file.id} 
                  className={cn(
                    "p-4 hover:bg-accent/50 transition-colors",
                    file.status === 'error' && "bg-destructive/5"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">
                      {getStatusIcon(file.status)}
                    </div>
                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-medium text-foreground truncate" title={file.name}>
                            {file.name}
                          </p>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleRemoveFile(file.id)
                          }}
                          className="text-muted-foreground hover:text-destructive transition-colors shrink-0"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                      
                      {file.status === 'uploading' && (
                        <>
                          <Progress 
                            value={file.progress} 
                            className="h-2"
                          />
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <span>{file.progress.toFixed(1)}%</span>
                            <span>{formatFileSize(file.uploadedBytes)} / {formatFileSize(file.size)}</span>
                            <span>{file.speed.toFixed(1)} KB/s</span>
                            <span>{formatTime(file.elapsedTime)}</span>
                          </div>
                        </>
                      )}
                      
                      {file.status === 'done' && (
                        <p className="text-xs text-green-600 font-medium">
                          Upload completed successfully
                        </p>
                      )}
                      
                      {file.status === 'error' && (
                        <div className="space-y-2">
                          <p className="text-xs text-destructive font-medium">
                            Upload failed
                          </p>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 text-xs"
                            onClick={() => {
                              // Retry logic would go here
                              console.log('Retry upload:', file.id)
                            }}
                          >
                            <RefreshCw className="h-3 w-3 mr-1" />
                            Retry
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                      </div>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

