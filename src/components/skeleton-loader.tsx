'use client'

// Skeleton Loader Component for file explorer

import { cn } from '@/lib/utils'

export function FileExplorerSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex flex-col space-y-3">
          <div className="h-48 bg-muted rounded-lg animate-pulse" />
          <div className="space-y-2">
            <div className="h-4 bg-muted rounded w-3/4 animate-pulse" />
            <div className="h-3 bg-muted rounded w-1/2 animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function ListViewSkeleton({ count = 10 }: { count?: number }) {
  return (
    <div className="border rounded-lg divide-y divide-border">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="p-4 flex items-center gap-4">
          <div className="h-10 w-10 bg-muted rounded animate-pulse" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-muted rounded w-1/3 animate-pulse" />
            <div className="h-3 bg-muted rounded w-1/4 animate-pulse" />
          </div>
          <div className="h-6 bg-muted rounded w-20 animate-pulse" />
          <div className="h-4 bg-muted rounded w-24 animate-pulse" />
        </div>
      ))}
    </div>
  )
}

export function BreadcrumbSkeleton() {
  return (
    <div className="flex items-center gap-2">
      <div className="h-6 bg-muted rounded w-24 animate-pulse" />
      <div className="h-4 w-4 bg-muted rounded animate-pulse" />
      <div className="h-6 bg-muted rounded w-32 animate-pulse" />
    </div>
  )
}

