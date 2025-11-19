// Redux Store Configuration with RTK

import { configureStore } from '@reduxjs/toolkit'
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux'
import authReducer from './slices/auth-slice'
import documentsReducer from './slices/documents-slice'

// Configure store
export const store = configureStore({
  reducer: {
    auth: authReducer,
    documents: documentsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these field paths in all actions
        ignoredActionsPaths: [
          'meta.arg',
          'payload.timestamp',
          'payload.user',
          'payload.createdAt',
          'payload.updatedAt',
          'payload.documents',
          'payload.folders',
          'payload.sections',
        ],
        // Ignore Date objects in state paths
        ignoredPaths: [
          'auth.user',
          'documents.documents',
          'documents.folders',
          'documents.sections',
          'documents.selectedDocument',
        ],
        // Custom check to allow Date objects in both actions and state
        isSerializable: (value: any) => {
          // Allow Date objects
          if (value instanceof Date) {
            return true
          }
          // Allow objects that might contain Date objects (will be checked recursively)
          if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
            return undefined // Let default check handle nested objects
          }
          // Use default check for other values
          return undefined
        },
      },
    }),
  devTools: process.env.NODE_ENV !== 'production',
})

// Types for store
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

// Typed hooks
export const useAppDispatch = () => useDispatch<AppDispatch>()
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector

// Local storage helpers
export const loadState = () => {
  try {
    const serializedState = localStorage.getItem('dms_state')
    if (serializedState === null) {
      return undefined
    }
    return JSON.parse(serializedState)
  } catch (err) {
    console.warn('Failed to load state from localStorage:', err)
    return undefined
  }
}

export const saveState = (state: any) => {
  try {
    const serializedState = JSON.stringify(state)
    localStorage.setItem('dms_state', serializedState)
  } catch (err) {
    console.warn('Failed to save state to localStorage:', err)
  }
}

// Setup state persistence (only on client side)
if (typeof window !== 'undefined') {
  // Save state to localStorage on changes
  let saveTimeout: NodeJS.Timeout | null = null
  
  store.subscribe(() => {
    // Debounce saves to avoid excessive localStorage writes
    if (saveTimeout) {
      clearTimeout(saveTimeout)
    }
    
    saveTimeout = setTimeout(() => {
      const state = store.getState()
      // Only persist certain parts of the state
      const stateToPersist = {
        auth: {
          user: state.auth.user,
          isAuthenticated: state.auth.isAuthenticated,
        },
        // Don't persist documents as they should be fetched fresh
      }
      saveState(stateToPersist)
    }, 100)
  })
}
