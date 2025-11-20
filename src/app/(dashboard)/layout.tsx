'use client'

// Dashboard Layout with Sidebar

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAppDispatch } from '@/src/lib/store/store'
import { logout } from '@/src/lib/store/slices/auth-slice'
import Sidebar from '@/components/sidebar'
import DashboardHeader from '@/src/components/dashboard-header'
import { DataProvider } from '@/lib/data-context'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const dispatch = useAppDispatch()
  const [activeView, setActiveView] = useState('dashboard')
  const [activeFolder, setActiveFolder] = useState<string | undefined>()

  // Simple default user - no auth setup needed
  const currentUser = {
    id: '1',
    email: 'user@example.com',
    name: 'User',
    role: 'user' as const,
    avatar: undefined,
  }

  // Update active view based on pathname
  useEffect(() => {
    if (pathname?.includes('/dashboard')) {
      setActiveView('dashboard')
    }
  }, [pathname])

  const handleViewChange = (view: string) => {
    setActiveView(view)
    if (view === 'dashboard') {
      router.push('/dashboard')
    }
    // Documents/Main Section doesn't navigate - just expands/collapses
  }

  const handleFolderChange = (sectionId?: string) => {
    setActiveFolder(sectionId)
    // Navigate to documents page with section ID
    if (sectionId) {
      router.push(`/documents?section=${sectionId}`)
    } else {
      router.push('/dashboard/documents')
    }
  }

  const handleLogout = () => {
    dispatch(logout())
    router.push('/login')
  }

  return (
    <DataProvider>
      <div className="min-h-screen bg-gray-50 flex">
        {/* Sidebar */}
        <Sidebar
          activeView={activeView}
          onViewChange={handleViewChange}
          activeFolder={activeFolder}
          onFolderChange={handleFolderChange}
        />

        {/* Main content */}
        <div className="flex-1 flex flex-col">
          {/* Top navigation */}
          <DashboardHeader 
            user={currentUser}
            onLogout={handleLogout}
          />

          {/* Page content */}
          <main className="flex-1">
            <div className="">
              {children}
            </div>
          </main>
        </div>
      </div>
    </DataProvider>
  )
}
