// Simple Auth Slice - KISS Principle

import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { User, AuthState } from '../../types'

// Extended auth state
interface AuthSliceState extends AuthState {
  error: string | null
}

// Initial state
const initialState: AuthSliceState = {
  user: null,
  isLoading: false,
  isAuthenticated: false,
  error: null,
}

// Auth slice - simple sync actions only
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login: (state, action: PayloadAction<{ email: string; password: string }>) => {
      // Simple login - just create user from email/password, no checks
      const now = new Date()
      const user: User = {
        id: `${Date.now()}`,
        email: action.payload.email,
        name: action.payload.email.split('@')[0],
        role: 'user' as const,
        createdAt: now,
        updatedAt: now,
      }
      
      state.user = user
      state.isAuthenticated = true
      state.error = null
      
      // Save to localStorage
    if (typeof window !== 'undefined') {
        localStorage.setItem('user_info', JSON.stringify(user))
    }
    },
    
    register: (state, action: PayloadAction<{ name: string; email: string; password: string }>) => {
      // Simple register - just create user, no checks
      const now = new Date()
      const user: User = {
        id: `${Date.now()}`,
        email: action.payload.email,
        name: action.payload.name,
        role: 'user' as const,
        createdAt: now,
        updatedAt: now,
      }
    
      state.user = user
      state.isAuthenticated = true
      state.error = null
      
      // Save to localStorage
    if (typeof window !== 'undefined') {
        localStorage.setItem('user_info', JSON.stringify(user))
    }
    },
    
    logout: (state) => {
      state.user = null
      state.isAuthenticated = false
      state.error = null
      
      // Clear localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('user_info')
    }
    },
    
    initializeAuth: (state) => {
      // Load user from localStorage on app start
      if (typeof window !== 'undefined') {
        const storedUser = localStorage.getItem('user_info')
        if (storedUser) {
          try {
            const user = JSON.parse(storedUser)
            // Keep dates as strings (serializable) - convert to Date only when needed
            state.user = user as User
            state.isAuthenticated = true
          } catch (error) {
            localStorage.removeItem('user_info')
          }
        }
      }
    },
    
    setUser: (state, action: PayloadAction<User | null>) => {
      state.user = action.payload
      state.isAuthenticated = !!action.payload
    },
    
    clearError: (state) => {
      state.error = null
    },
  },
})

export const { login, register, logout, initializeAuth, setUser, clearError } = authSlice.actions

export default authSlice.reducer

// Selectors
export const selectAuth = (state: { auth: AuthSliceState }) => state.auth
export const selectUser = (state: { auth: AuthSliceState }) => state.auth.user
export const selectIsAuthenticated = (state: { auth: AuthSliceState }) => state.auth.isAuthenticated
export const selectIsLoading = (state: { auth: AuthSliceState }) => state.auth.isLoading
export const selectAuthError = (state: { auth: AuthSliceState }) => state.auth.error
