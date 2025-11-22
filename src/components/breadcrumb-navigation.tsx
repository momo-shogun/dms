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
  alwaysClickable?: boolean // If true, item is clickable even when it's the last item
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
        // Section name (first item) should always be clickable, even if it's the last item
        const isClickable = !isLast || item.alwaysClickable || index === 0
        
        return (
          <Fragment key={item.id}>
            <button
              onClick={() => onNavigate(item.path)}
              className={cn(
                'flex items-center gap-1.5 px-2 py-1 rounded-md',
                'transition-colors duration-200',
                isClickable
                  ? 'cursor-pointer hover:text-foreground text-muted-foreground'
                  : 'text-foreground font-medium cursor-default'
              )}
              disabled={!isClickable}
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

