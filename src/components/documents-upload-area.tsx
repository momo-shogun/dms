'use client'

// File Upload Component with Progress Tracking

import { useState, useCallback, useRef } from 'react'
import { Upload, X, Settings, CheckCircle2, Loader2, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'

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

      setUploadingFiles((prev) =>
        prev.map((f) =>
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
      )

      if (progress >= 100) {
        clearInterval(interval)
        if (onUploadComplete) {
          onUploadComplete([file])
        }
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
      {/* Left Side - Drag and Drop Area */}
      <div className={` ${uploadingFiles.length > 0 ? 'w-1/2' : 'w-full'}`}>
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleClick}
          className={cn(
            "border-2 border-dashed rounded-lg p-12 text-center transition-all cursor-pointer h-full flex items-center justify-center",
            isDragging
              ? "border-blue-500 bg-blue-50"
              : "border-gray-300 hover:border-gray-400"
          )}
        >
          <div className="flex flex-col items-center gap-4">
            <Upload className="h-12 w-12 text-gray-400" />
            <div className="space-y-1">
              <p className="text-base font-medium text-gray-900">
                Click, or drag the file here
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

      {/* Right Side - Upload Progress List */}
      {uploadingFiles.length > 0 && (
        <div className=" border rounded-lg bg-white">
          <div className="border-b p-4">
            <h3 className="text-sm font-medium text-gray-900">Uploading Files</h3>
          </div>
          <div className="overflow-y-auto max-h-[600px]">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {uploadingFiles.map((file) => (
                  <tr key={file.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate" title={file.name}>
                            {file.name}
                          </p>
                          <div className="mt-1">
                            <Progress value={file.progress} className="h-1.5" />
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            {file.speed.toFixed(2)} KB/s | {formatTime(file.elapsedTime)} | {file.progress.toFixed(2)} % | {formatFileSize(file.uploadedBytes)} | {formatFileSize(file.size)}
                          </p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleRemoveFile(file.id)
                          }}
                          className="ml-2 text-gray-400 hover:text-gray-600"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(file.status)}
                        <span className="text-sm text-gray-700">{getStatusText(file.status)}</span>
                        <button className="ml-2 text-gray-400 hover:text-gray-600">
                          <Settings className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

