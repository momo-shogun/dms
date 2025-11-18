// Auth Slice with Redux Toolkit

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { User, AuthState } from '../../types'
import { authApi } from '../../api/client'

// Extended auth state for Redux
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

// Async thunks for API calls
export const loginAsync = createAsyncThunk(
  'auth/login',
  async (credentials: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await authApi.login(credentials)
      
      if (response.success && response.data) {
        const { user, token } = response.data as any
        
        // Store token in localStorage (client-side only)
        if (typeof window !== 'undefined') {
          localStorage.setItem('auth_token', token)
        }
        
        return { user, token }
      } else {
        return rejectWithValue(response.message || 'Login failed')
      }
    } catch (error: any) {
      return rejectWithValue(error.message || 'Login failed')
    }
  }
)

export const registerAsync = createAsyncThunk(
  'auth/register',
  async (userData: { name: string; email: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await authApi.register(userData)
      
      if (response.success && response.data) {
        const { user, token } = response.data as any
        
        // Store token in localStorage (client-side only)
        if (typeof window !== 'undefined') {
          localStorage.setItem('auth_token', token)
        }
        
        return { user, token }
      } else {
        return rejectWithValue(response.message || 'Registration failed')
      }
    } catch (error: any) {
      return rejectWithValue(error.message || 'Registration failed')
    }
  }
)

export const logoutAsync = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await authApi.logout()
    } catch (error) {
      console.error('Logout API failed:', error)
    } finally {
      // Always remove token from localStorage (client-side only)
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_token')
      }
    }
  }
)

export const refreshTokenAsync = createAsyncThunk(
  'auth/refreshToken',
  async (_, { rejectWithValue }) => {
    try {
      const response = await authApi.refreshToken()
      
      if (response.success && response.data) {
        const { user, token } = response.data as any
        
        localStorage.setItem('auth_token', token)
        
        return { user, token }
      } else {
        return rejectWithValue('Token refresh failed')
      }
    } catch (error: any) {
      return rejectWithValue(error.message || 'Token refresh failed')
    }
  }
)

export const initializeAuthAsync = createAsyncThunk(
  'auth/initialize',
  async (_, { rejectWithValue }) => {
    // Only access localStorage on client side
    if (typeof window === 'undefined') {
      return rejectWithValue('Not on client side')
    }

    const token = localStorage.getItem('auth_token')
    
    if (!token) {
      return rejectWithValue('No token found')
    }

    try {
      const response = await authApi.getProfile()
      
      if (response.success && response.data) {
        return { user: response.data as User, token }
      } else {
        localStorage.removeItem('auth_token')
        return rejectWithValue('Failed to get user profile')
      }
    } catch (error: any) {
      localStorage.removeItem('auth_token')
      return rejectWithValue(error.message || 'Auth initialization failed')
    }
  }
)

// Auth slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User | null>) => {
      state.user = action.payload
      state.isAuthenticated = !!action.payload
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload
    },
    clearError: (state) => {
      state.error = null
    },
    resetAuth: (state) => {
      state.user = null
      state.isAuthenticated = false
      state.isLoading = false
      state.error = null
      // Remove token from localStorage (client-side only)
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_token')
      }
    },
  },
  extraReducers: (builder) => {
    // Login
    builder
      .addCase(loginAsync.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(loginAsync.fulfilled, (state, action) => {
        state.isLoading = false
        state.user = action.payload.user
        state.isAuthenticated = true
        state.error = null
      })
      .addCase(loginAsync.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

    // Register
    builder
      .addCase(registerAsync.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(registerAsync.fulfilled, (state, action) => {
        state.isLoading = false
        state.user = action.payload.user
        state.isAuthenticated = true
        state.error = null
      })
      .addCase(registerAsync.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

    // Logout
    builder
      .addCase(logoutAsync.pending, (state) => {
        state.isLoading = true
      })
      .addCase(logoutAsync.fulfilled, (state) => {
        state.user = null
        state.isAuthenticated = false
        state.isLoading = false
        state.error = null
      })
      .addCase(logoutAsync.rejected, (state) => {
        state.user = null
        state.isAuthenticated = false
        state.isLoading = false
        state.error = null
      })

    // Refresh token
    builder
      .addCase(refreshTokenAsync.fulfilled, (state, action) => {
        state.user = action.payload.user
        state.isAuthenticated = true
        state.error = null
      })
      .addCase(refreshTokenAsync.rejected, (state) => {
        state.user = null
        state.isAuthenticated = false
        state.error = null
      })

    // Initialize auth
    builder
      .addCase(initializeAuthAsync.pending, (state) => {
        state.isLoading = true
      })
      .addCase(initializeAuthAsync.fulfilled, (state, action) => {
        state.user = action.payload.user
        state.isAuthenticated = true
        state.isLoading = false
        state.error = null
      })
      .addCase(initializeAuthAsync.rejected, (state) => {
        state.user = null
        state.isAuthenticated = false
        state.isLoading = false
        state.error = null
      })
  },
})

export const { setUser, setLoading, clearError, resetAuth } = authSlice.actions

export default authSlice.reducer

// Selectors
export const selectAuth = (state: { auth: AuthSliceState }) => state.auth
export const selectUser = (state: { auth: AuthSliceState }) => state.auth.user
export const selectIsAuthenticated = (state: { auth: AuthSliceState }) => state.auth.isAuthenticated
export const selectIsLoading = (state: { auth: AuthSliceState }) => state.auth.isLoading
export const selectAuthError = (state: { auth: AuthSliceState }) => state.auth.error
