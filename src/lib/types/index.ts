// Core Types and Interfaces for DMS Application

export interface User {
  id: string
  email: string
  name: string
  avatar?: string
  role: 'admin' | 'user' | 'viewer'
  createdAt: Date
  updatedAt: Date
}

export interface Document {
  id: string
  name: string
  type: string
  size: number
  url?: string
  folderId?: string
  tags: string[]
  createdAt: Date
  updatedAt: Date
  createdBy: string
}

export interface Folder {
  id: string
  name: string
  description?: string
  parentId?: string
  documentCount: number
  color?: string
  isShared: boolean
  createdAt: Date
  updatedAt: Date
  createdBy: string
}

export interface Section {
  id: string
  name: string
  description?: string
  folders: Folder[]
  order: number
  isSystem: boolean
  createdAt: Date
  updatedAt: Date
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

export interface PaginationParams {
  page: number
  limit: number
  search?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// Route specific types
export interface AuthState {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
}

export interface DocumentViewMode {
  type: 'grid' | 'list' | 'table'
}

export interface FilterState {
  search: string
  tags: string[]
  dateRange: {
    from?: Date
    to?: Date
  }
  fileTypes: string[]
}
