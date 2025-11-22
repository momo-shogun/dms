'use client'

// Animated Breadcrumb Navigation Component

import { Fragment } from 'react'
import { ChevronRight, Folder, File } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface BreadcrumbItem {
  id: string
  name: string
  path: string[]
  isFile?: boolean
}

interface BreadcrumbNavigationProps {
  items: BreadcrumbItem[]
  onNavigate: (path: string[]) => void
  className?: string
}

export default function BreadcrumbNavigation({
  items,
  onNavigate,
  className,
}: BreadcrumbNavigationProps) {
  if (items.length === 0) return null

  return (
    <nav
      className={cn(
        'flex items-center gap-1.5 text-sm text-muted-foreground',
        'overflow-x-auto scrollbar-hide',
        className
      )}
      aria-label="Breadcrumb"
    >
      {items.map((item, index) => {
        const isLast = index === items.length - 1
        const isFile = item.isFile || false
        const Icon = isFile ? File : Folder
        
        return (
          <Fragment key={item.id}>
            <button
              onClick={() => onNavigate(item.path)}
              className={cn(
                'flex items-center gap-1.5 px-2 py-1 rounded-md',
                'transition-all duration-200',
                isLast
                  ? 'text-foreground font-medium cursor-default'
                  : 'cursor-pointer hover:bg-accent hover:text-accent-foreground hover:scale-105'
              )}
              disabled={isLast}
            >
              <Icon className="h-3.5 w-3.5 shrink-0" />
              <span className="whitespace-nowrap">{item.name}</span>
            </button>
            {!isLast && (
              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50 shrink-0" />
            )}
          </Fragment>
        )
      })}
    </nav>
  )
}

