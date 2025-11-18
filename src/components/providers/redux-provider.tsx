'use client'

// Redux Provider Component

import { useRef, useEffect } from 'react'
import { Provider } from 'react-redux'
import { store, loadState } from '../../lib/store/store'
import { setUser } from '../../lib/store/slices/auth-slice'

export default function ReduxProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const initialized = useRef(false)

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return
    
    if (!initialized.current) {
      initialized.current = true
      
      // Load persisted auth state from localStorage
      try {
        const persistedState = loadState()
        if (persistedState && persistedState.auth && persistedState.auth.user) {
          store.dispatch(setUser(persistedState.auth.user))
        }
      } catch (error) {
        console.warn('Failed to load persisted state:', error)
      }
    }
  }, [])

  return <Provider store={store}>{children}</Provider>
}
