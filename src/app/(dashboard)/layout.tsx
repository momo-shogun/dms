'use client'

// Dashboard Layout with Sidebar

import { useState, useEffect, Suspense } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useAppDispatch } from '@/src/lib/store/store'
import { logout } from '@/src/lib/store/slices/auth-slice'
import Sidebar from '@/components/sidebar'
import DashboardHeader from '@/src/components/dashboard-header'
import { SectionsProvider } from '@/lib/sections-context'

function DashboardLayoutContent({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
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

  // Update active view and folder based on pathname and search params
  useEffect(() => {
    if (pathname) {
      // Check if we're on search page
      if (pathname.includes('/search')) {
        setActiveView('search')
        setActiveFolder(undefined)
      }
      // Check if we're on documents page
      else if (pathname.includes('/documents')) {
        setActiveView('documents')
        // Get section from search params
        const sectionId = searchParams?.get('section')
        if (sectionId) {
          setActiveFolder(sectionId)
        } else {
          setActiveFolder(undefined)
        }
      } 
      // Check if we're on dashboard page (exact match or just /dashboard)
      else if (pathname === '/dashboard' || pathname.endsWith('/dashboard')) {
        setActiveView('dashboard')
        setActiveFolder(undefined)
      }
    }
  }, [pathname, searchParams])

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
    <SectionsProvider>
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
    </SectionsProvider>
  )
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DashboardLayoutContent>{children}</DashboardLayoutContent>
    </Suspense>
  )
}
