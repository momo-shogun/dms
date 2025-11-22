"use client"

import React, { useState, useMemo } from "react"
import {
  Home,
  FileText,
  Inbox,
  Clock,
  Users,
  Tag,
  Hash,
  FolderOpen,
  Settings,
  UserCog,
  ListChecks,
  Mail,
  FileCheck,
  ChevronRight,
  ChevronDown,
  Plus,
  Folder,
  MoreVertical,
  Edit2,
  Trash2,
  Sparkles,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useSections } from "@/lib/sections"
import { CreateSectionDialog } from "@/components/dialogs/create-section-dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu"

interface SidebarProps {
  activeView: string
  onViewChange: (view: string) => void
  activeFolder?: string
  onFolderChange?: (folder: string) => void
}

const Sidebar = ({ activeView, onViewChange, activeFolder, onFolderChange }: SidebarProps) => {
  const { sections, deleteSection } = useSections()
  const [documentsExpanded, setDocumentsExpanded] = useState(true)
  const [sectionCreateDialogOpen, setSectionCreateDialogOpen] = useState(false)
  const [editingSection, setEditingSection] = useState<{ id: string; name: string } | null>(null)

  // Navigation items
  const navItems = useMemo(() => [
    { id: "dashboard", label: "Dashboard", icon: Home },
    { id: "documents", label: "Main Section", icon: FileText },
  ], [])

  // Saved views
  const savedViews = useMemo(() => [
    { id: "inbox", label: "Inbox", icon: Inbox, count: 12 },
    { id: "recent", label: "Recently Added", icon: Clock },
  ], [])

  // Manage items
  const manageItems = useMemo(() => [
    { id: "correspondents", label: "Correspondents", icon: Users },
    { id: "tags", label: "Tags", icon: Tag },
    { id: "types", label: "Document Types", icon: Hash },
    { id: "storage", label: "Storage Paths", icon: FolderOpen },
    { id: "fields", label: "Custom Fields", icon: ListChecks },
    { id: "templates", label: "Templates", icon: FileCheck },
    { id: "mail", label: "Mail", icon: Mail },
  ], [])

  // Admin items
  const adminItems = useMemo(() => [
    { id: "settings", label: "Settings", icon: Settings },
    { id: "users", label: "Users & Groups", icon: UserCog },
  ], [])

  // Handlers
  const handleCreateSection = () => {
    setEditingSection(null)
    setSectionCreateDialogOpen(true)
  }

  const handleEditSection = (section: { id: string; name: string }) => {
    setEditingSection(section)
    setSectionCreateDialogOpen(true)
  }

  const handleSectionClick = (sectionId: string) => {
    onViewChange("documents")
    onFolderChange?.(sectionId)
  }

  // Navigation item component
  const NavItem = ({ item, isActive, onClick, children }: { 
    item: { id: string; label: string; icon: React.ElementType }
    isActive: boolean
    onClick: () => void
    children?: React.ReactNode
  }) => {
    const Icon = item.icon
    return (
      <button
        onClick={onClick}
        className={cn(
          "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
          "hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground",
          isActive
            ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
            : "text-sidebar-foreground/70"
        )}
      >
        <Icon className="h-4 w-4 shrink-0" />
        <span className="flex-1 text-left">{item.label}</span>
        {children}
      </button>
    )
  }

  // Section item component - simplified, no folders
  const SectionItem = ({ section }: { section: { id: string; name: string } }) => {
    const isActive = activeFolder === section.id

    return (
      <div className="flex items-center justify-between group">
        <button
          onClick={() => handleSectionClick(section.id)}
          className={cn(
            "flex-1 flex items-center gap-2 px-2.5 py-2 rounded-md text-sm font-medium transition-all duration-200 text-left",
            "hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground",
            isActive
              ? "bg-sidebar-primary/20 text-sidebar-primary border-l-2 border-sidebar-primary"
              : "text-sidebar-foreground/70"
          )}
        >
          <Folder className="h-4 w-4 shrink-0" />
          <span className="flex-1 truncate">{section.name}</span>
        </button>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="p-1.5 hover:bg-sidebar-accent/50 rounded-md transition-colors">
                <MoreVertical className="h-3.5 w-3.5 text-sidebar-foreground/60" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem
                onClick={() => handleEditSection({ id: section.id, name: section.name })}
                className="cursor-pointer"
              >
                <Edit2 className="h-3.5 w-3.5 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => deleteSection(section.id)} 
                className="text-destructive cursor-pointer focus:text-destructive"
              >
                <Trash2 className="h-3.5 w-3.5 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    )
  }

  return (
    <>
      <aside className="w-64 bg-sidebar border-r border-sidebar-border flex flex-col h-screen sticky top-0">
        {/* Header */}
        <div className="p-4 border-b border-sidebar-border">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-sidebar-primary/10 rounded-lg">
              <FileText className="h-5 w-5 text-sidebar-primary" />
            </div>
            <div>
              <h1 className="font-semibold text-base text-sidebar-foreground">DMS</h1>
              <p className="text-xs text-sidebar-foreground/50">Document Management</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
          {/* Main Navigation */}
          <div className="space-y-1">
            {navItems.map((item) => {
              const isDocuments = item.id === "documents"
              const isActive = activeView === item.id && !isDocuments
              
              return (
                <div key={item.id}>
                  <NavItem
                    item={item}
                    isActive={isActive}
                    onClick={() => {
                      if (isDocuments) {
                        setDocumentsExpanded(!documentsExpanded)
                        // Don't navigate, just expand/collapse
                      } else {
                        onViewChange(item.id)
                      }
                    }}
                  >
                    {isDocuments && (
                      documentsExpanded ? (
                        <ChevronDown className="h-3.5 w-3.5" />
                      ) : (
                        <ChevronRight className="h-3.5 w-3.5" />
                      )
                    )}
                  </NavItem>

                  {/* Sections under Documents */}
                  {isDocuments && documentsExpanded && (
                    <div className="mt-2 ml-1 space-y-2">
                      {sections.map((section) => (
                        <SectionItem key={section.id} section={section} />
                      ))}

                      {/* Add Section button */}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start gap-2 px-3 py-2 h-auto text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/30 border border-sidebar-border/50"
                        onClick={handleCreateSection}
                      >
                        <Plus className="h-4 w-4" />
                        <span className="text-sm font-medium">Create Section</span>
                      </Button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Saved Views */}
          <div className="space-y-1">
            <h3 className="px-3 text-xs font-semibold text-sidebar-foreground/50 uppercase tracking-wider mb-2">
              Saved Views
            </h3>
            {savedViews.map((item) => {
              const Icon = item.icon
              const isActive = activeView === item.id
              return (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id)}
                className={cn(
                    "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                    "hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground",
                    isActive
                      ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
                      : "text-sidebar-foreground/70"
                )}
              >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="flex-1 text-left">{item.label}</span>
                  {item.count && (
                    <span className="text-xs bg-sidebar-accent/30 text-sidebar-foreground/60 px-1.5 py-0.5 rounded">
                      {item.count}
                    </span>
                  )}
              </button>
              )
            })}
          </div>

          {/* Manage */}
          <div className="space-y-1">
            <h3 className="px-3 text-xs font-semibold text-sidebar-foreground/50 uppercase tracking-wider mb-2">
              Manage
            </h3>
            {manageItems.map((item) => {
              const Icon = item.icon
              const isActive = activeView === item.id
              return (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id)}
                className={cn(
                    "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                    "hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground",
                    isActive
                      ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
                      : "text-sidebar-foreground/70"
                )}
              >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="flex-1 text-left">{item.label}</span>
              </button>
              )
            })}
          </div>

          {/* Administration */}
          <div className="space-y-1">
            <h3 className="px-3 text-xs font-semibold text-sidebar-foreground/50 uppercase tracking-wider mb-2">
              Administration
            </h3>
            {adminItems.map((item) => {
              const Icon = item.icon
              const isActive = activeView === item.id
              return (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id)}
                className={cn(
                    "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                    "hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground",
                    isActive
                      ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
                      : "text-sidebar-foreground/70"
                )}
              >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="flex-1 text-left">{item.label}</span>
              </button>
              )
            })}
          </div>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-sidebar-border">
          <div className="flex items-center gap-2 text-xs text-sidebar-foreground/50">
            <Sparkles className="h-3.5 w-3.5" />
            <span>DMS v2.0.0</span>
          </div>
        </div>
      </aside>

      {/* Dialogs */}
      <CreateSectionDialog
        open={sectionCreateDialogOpen}
        onOpenChange={setSectionCreateDialogOpen}
        section={editingSection}
      />
    </>
  )
}

export default Sidebar


