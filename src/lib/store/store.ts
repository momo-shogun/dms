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
        // Ignore these action types completely to avoid false positives
        ignoredActions: [
          'auth/login',
          'auth/register',
          'auth/initializeAuth',
          'auth/setUser',
          'auth/logout',
        ],
        // Ignore these field paths in all actions (including meta which often contains non-serializable values)
        ignoredActionsPaths: [
          'meta',
          'meta.arg',
          'meta.requestId',
          'meta.requestStatus',
          'meta.baseQueryMeta',
          'payload.timestamp',
          'payload.user',
          'payload.createdAt',
          'payload.updatedAt',
          'payload.documents',
          'payload.folders',
          'payload.sections',
        ],
        // Ignore Date objects and complex objects in state paths
        ignoredPaths: [
          'auth.user',
          'auth.user.createdAt',
          'auth.user.updatedAt',
          'documents.documents',
          'documents.folders',
          'documents.sections',
          'documents.selectedDocument',
        ],
        // Only warn after 32ms, don't throw errors immediately
        warnAfter: 32,
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
