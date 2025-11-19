'use client'

// Redux Provider Component - Simple

import { Provider } from 'react-redux'
import { store } from '../../lib/store/store'

export default function ReduxProvider({
  children,
}: {
  children: React.ReactNode
}) {
  // Auth initialization is handled in components that need it
  // This avoids Redux serialization issues
  return <Provider store={store}>{children}</Provider>
}
