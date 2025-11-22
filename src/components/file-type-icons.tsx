'use client'

// File Type Icon Components - Custom SVG icons for different file types

import { cn } from '@/lib/utils'

interface FileIconProps {
  className?: string
  size?: number
}

export function PDFIcon({ className, size = 20 }: FileIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('text-red-600', className)}
    >
      <rect x="4" y="4" width="16" height="16" rx="2" fill="currentColor" opacity="0.1" />
      <path
        d="M8 8h8M8 12h6M8 16h4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M6 4h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
      />
      <text x="12" y="14" fontSize="6" fill="currentColor" textAnchor="middle" fontWeight="bold">
        PDF
      </text>
    </svg>
  )
}

export function DOCXIcon({ className, size = 20 }: FileIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('text-blue-600', className)}
    >
      <rect x="4" y="4" width="16" height="16" rx="2" fill="currentColor" opacity="0.1" />
      <path
        d="M8 8h8M8 12h8M8 16h6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M6 4h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
      />
      <text x="12" y="14" fontSize="6" fill="currentColor" textAnchor="middle" fontWeight="bold">
        DOC
      </text>
    </svg>
  )
}

export function XLSXIcon({ className, size = 20 }: FileIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('text-green-600', className)}
    >
      <rect x="4" y="4" width="16" height="16" rx="2" fill="currentColor" opacity="0.1" />
      <path
        d="M8 8h8M8 12h8M8 16h8"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M6 4h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
      />
      <text x="12" y="14" fontSize="6" fill="currentColor" textAnchor="middle" fontWeight="bold">
        XLS
      </text>
    </svg>
  )
}

export function ImageIcon({ className, size = 20 }: FileIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('text-purple-600', className)}
    >
      <rect x="4" y="4" width="16" height="16" rx="2" fill="currentColor" opacity="0.1" />
      <path
        d="M8 10a2 2 0 1 0 0-4 2 2 0 0 0 0 4z"
        fill="currentColor"
      />
      <path
        d="M6 4h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
      />
      <path
        d="M6 16l4-4 4 4 4-4 2 2"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  )
}

export function VideoIcon({ className, size = 20 }: FileIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('text-pink-600', className)}
    >
      <rect x="4" y="4" width="16" height="16" rx="2" fill="currentColor" opacity="0.1" />
      <path
        d="M6 4h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
      />
      <path
        d="M10 8l6 4-6 4V8z"
        fill="currentColor"
      />
    </svg>
  )
}

export function DefaultFileIcon({ className, size = 20 }: FileIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('text-gray-600', className)}
    >
      <rect x="4" y="4" width="16" height="16" rx="2" fill="currentColor" opacity="0.1" />
      <path
        d="M8 8h8M8 12h8M8 16h4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M6 4h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
      />
    </svg>
  )
}

// Main component that selects the appropriate icon based on file type
export function FileTypeIcon({ 
  fileType, 
  className, 
  size = 20 
}: { 
  fileType: string
  className?: string
  size?: number
}) {
  const normalizedType = fileType.toLowerCase()
  
  if (normalizedType === 'pdf') {
    return <PDFIcon className={className} size={size} />
  }
  
  if (normalizedType === 'docx' || normalizedType === 'doc') {
    return <DOCXIcon className={className} size={size} />
  }
  
  if (normalizedType === 'xlsx' || normalizedType === 'xls') {
    return <XLSXIcon className={className} size={size} />
  }
  
  if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'].includes(normalizedType)) {
    return <ImageIcon className={className} size={size} />
  }
  
  if (['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm'].includes(normalizedType)) {
    return <VideoIcon className={className} size={size} />
  }
  
  return <DefaultFileIcon className={className} size={size} />
}

