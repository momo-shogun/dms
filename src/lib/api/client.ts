// API Client with proper error handling and typing

import { ApiResponse } from '../types'

export class ApiError extends Error {
  status: number
  code?: string

  constructor(message: string, status: number, code?: string) {
    super(message)
    this.status = status
    this.code = code
    this.name = 'ApiError'
  }
}

interface RequestConfig extends RequestInit {
  timeout?: number
}

class ApiClient {
  private baseUrl: string
  private defaultHeaders: HeadersInit

  constructor(baseUrl = '/api') {
    this.baseUrl = baseUrl
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    }
  }

  private async request<T>(
    endpoint: string,
    config: RequestConfig = {}
  ): Promise<ApiResponse<T>> {
    const { timeout = 10000, ...fetchConfig } = config
    
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeout)

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...fetchConfig,
        headers: {
          ...this.defaultHeaders,
          ...fetchConfig.headers,
        },
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      // Try to parse JSON, but handle non-JSON responses
      let data: any
      const contentType = response.headers.get('content-type')
      
      if (contentType && contentType.includes('application/json')) {
        try {
          data = await response.json()
        } catch (parseError) {
          // If JSON parsing fails, use status text
          throw new ApiError(
            response.statusText || 'Request failed',
            response.status
          )
        }
      } else {
        // Non-JSON response
        const text = await response.text()
        data = { message: text || response.statusText || 'Request failed' }
      }

      if (!response.ok) {
        throw new ApiError(
          data.message || data.error || 'Request failed',
          response.status,
          data.code
        )
      }

      return data
    } catch (error) {
      clearTimeout(timeoutId)
      
      if (error instanceof ApiError) {
        throw error
      }

      if (error instanceof Error && error.name === 'AbortError') {
        throw new ApiError('Request timeout', 408, 'TIMEOUT')
      }

      throw new ApiError(
        error instanceof Error ? error.message : 'Unknown error',
        500,
        'UNKNOWN_ERROR'
      )
    }
  }

  async get<T>(endpoint: string, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...config, method: 'GET' })
  }

  async post<T>(
    endpoint: string,
    data?: any,
    config?: RequestConfig
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...config,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async put<T>(
    endpoint: string,
    data?: any,
    config?: RequestConfig
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...config,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async patch<T>(
    endpoint: string,
    data?: any,
    config?: RequestConfig
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...config,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async delete<T>(endpoint: string, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...config, method: 'DELETE' })
  }

  setAuthToken(token: string) {
    this.defaultHeaders = {
      ...this.defaultHeaders,
      Authorization: `Bearer ${token}`,
    }
  }

  removeAuthToken() {
    const { Authorization, ...headers } = this.defaultHeaders as any
    this.defaultHeaders = headers
  }
}

export const apiClient = new ApiClient()

// API Services
export const authApi = {
  login: (credentials: { email: string; password: string }) =>
    apiClient.post('/auth/login', credentials),
  
  register: (userData: { name: string; email: string; password: string }) =>
    apiClient.post('/auth/register', userData),
  
  logout: () => apiClient.post('/auth/logout'),
  
  refreshToken: () => apiClient.post('/auth/refresh'),
  
  getProfile: () => apiClient.get('/auth/profile'),
}

export const documentsApi = {
  getAll: (params?: any) => 
    apiClient.get(`/documents${params ? '?' + new URLSearchParams(params) : ''}`),
  
  getById: (id: string) => apiClient.get(`/documents/${id}`),
  
  create: (data: any) => apiClient.post('/documents', data),
  
  update: (id: string, data: any) => apiClient.patch(`/documents/${id}`, data),
  
  delete: (id: string) => apiClient.delete(`/documents/${id}`),
  
  upload: (file: File, folderId?: string) => {
    const formData = new FormData()
    formData.append('file', file)
    if (folderId) formData.append('folderId', folderId)
    
    return apiClient.post('/documents/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  },
}

export const foldersApi = {
  getAll: () => apiClient.get('/folders'),
  
  getById: (id: string) => apiClient.get(`/folders/${id}`),
  
  create: (data: any) => apiClient.post('/folders', data),
  
  update: (id: string, data: any) => apiClient.patch(`/folders/${id}`, data),
  
  delete: (id: string) => apiClient.delete(`/folders/${id}`),
}
