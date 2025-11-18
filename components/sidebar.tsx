"use client"

import React from "react"

import { useState } from "react"
import {
  Home,
  FileText,
  Inbox,
  Clock,
  Users,
  Tag,
  Hash,
  FolderOpen,
  SettingsIcon,
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
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useData } from "@/lib/data-context"
import { CreateSectionDialog } from "@/components/dialogs/create-section-dialog"
import { CreateFolderDialog } from "@/components/dialogs/create-folder-dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface SidebarProps {
  activeView: string
  onViewChange: (view: string) => void
  activeFolder?: string
  onFolderChange?: (folder: string) => void
}

const Sidebar = ({ activeView, onViewChange, activeFolder, onFolderChange }: SidebarProps) => {
  const { sections, deleteSection, deleteFolder } = useData()
  const [documentsExpanded, setDocumentsExpanded] = useState(true)
  const [sectionCreateDialogOpen, setSectionCreateDialogOpen] = useState(false)
  const [folderCreateDialogOpen, setFolderCreateDialogOpen] = useState(false)
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null)
  const [editingSection, setEditingSection] = useState<{ id: string; name: string } | null>(null)
  const [editingFolder, setEditingFolder] = useState<{ id: string; name: string } | null>(null)

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: Home },
    { id: "documents", label: "Documents", icon: FileText },
  ]

  const folders = [
    { id: "inbox", label: "Inbox", icon: Inbox, hasEmail: true },
    { id: "team", label: "#team", icon: Hash },
    { id: "projects", label: "Projects", icon: Folder },
    { id: "finance", label: "Finance", icon: Folder },
    { id: "human-resources", label: "Human Resources", icon: Folder },
    { id: "operations", label: "Operations", icon: Folder },
    { id: "legal", label: "Legal", icon: Folder },
    { id: "njj", label: "njj", icon: Folder },
  ]

  const savedViews = [
    { id: "inbox", label: "Inbox", icon: Inbox },
    { id: "recent", label: "Recently Added", icon: Clock },
  ]

  const manageItems = [
    { id: "correspondents", label: "Correspondents", icon: Users },
    { id: "tags", label: "Tags", icon: Tag },
    { id: "types", label: "Document Types", icon: Hash },
    { id: "storage", label: "Storage Paths", icon: FolderOpen },
    { id: "fields", label: "Custom Fields", icon: ListChecks },
    { id: "templates", label: "Templates", icon: FileCheck },
    { id: "mail", label: "Mail", icon: Mail },
  ]

  const adminItems = [
    { id: "settings", label: "Settings", icon: SettingsIcon },
    { id: "users", label: "Users & Groups", icon: UserCog },
  ]

  const handleCreateSection = () => {
    setEditingSection(null)
    setSectionCreateDialogOpen(true)
  }

  const handleEditSection = (section: { id: string; name: string }) => {
    setEditingSection(section)
    setSectionCreateDialogOpen(true)
  }

  const handleCreateFolder = (sectionId: string) => {
    setSelectedSectionId(sectionId)
    setEditingFolder(null)
    setFolderCreateDialogOpen(true)
  }

  const handleEditFolder = (sectionId: string, folder: { id: string; name: string }) => {
    setSelectedSectionId(sectionId)
    setEditingFolder(folder)
    setFolderCreateDialogOpen(true)
  }

  return (
    <>
      <aside className="w-60 bg-[hsl(var(--sidebar-bg))] text-[hsl(var(--sidebar-text))] min-h-screen flex flex-col">
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <FileText className="h-6 w-6" />
            <span className="font-semibold text-lg">DMS</span>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto py-4">
          {/* Main Navigation */}
          <div className="px-2 mb-6">
            {navItems.map((item) => {
              const isDocuments = item.id === "documents"
              return (
                <div key={item.id}>
                  <button
                    onClick={() => {
                      if (isDocuments) {
                        setDocumentsExpanded(!documentsExpanded)
                      }
                      onViewChange(item.id)
                    }}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2 rounded text-sm transition-colors",
                      activeView === item.id && !isDocuments
                        ? "bg-white/20 text-white"
                        : "text-white/80 hover:bg-[hsl(var(--sidebar-hover))] hover:text-white",
                    )}
                  >
                    {isDocuments &&
                      (documentsExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />)}
                    {!isDocuments && <item.icon className="h-4 w-4" />}
                    {item.label}
                  </button>

                  {/* Sections under Documents */}
                  {isDocuments && documentsExpanded && (
                    <div className="ml-2 mt-2 space-y-1">
                      {sections.map((section) => (
                        <div key={section.id}>
                          <div className="flex items-center justify-between group px-1">
                            <button
                              onClick={() => {
                                onViewChange("documents")
                                onFolderChange?.(section.id)
                              }}
                              className="flex-1 flex items-center gap-2 px-2 py-1.5 rounded text-sm transition-colors text-white/70 hover:bg-[hsl(var(--sidebar-hover))] hover:text-white text-left"
                            >
                              <Folder className="h-3.5 w-3.5" />
                              <span>{section.name}</span>
                            </button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <button className="opacity-0 group-hover:opacity-100 p-1 hover:bg-white/10 rounded transition-all">
                                  <MoreVertical className="h-3.5 w-3.5" />
                                </button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-32">
                                <DropdownMenuItem
                                  onClick={() => handleEditSection({ id: section.id, name: section.name })}
                                >
                                  <Edit2 className="h-3.5 w-3.5 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => deleteSection(section.id)} className="text-red-400">
                                  <Trash2 className="h-3.5 w-3.5 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>

                          {/* Folders under Section */}
                          {section.folders.length > 0 && (
                            <div className="ml-6 mt-1 space-y-1">
                              {section.folders.map((folder) => (
                                <div key={folder.id} className="flex items-center justify-between group">
                                  <button
                                    onClick={() => onFolderChange?.(folder.id)}
                                    className={cn(
                                      "flex-1 flex items-center gap-2 px-2 py-1 rounded text-sm transition-colors text-left",
                                      activeFolder === folder.id
                                        ? "bg-white/20 text-white"
                                        : "text-white/70 hover:bg-[hsl(var(--sidebar-hover))] hover:text-white",
                                    )}
                                  >
                                    <Folder className="h-3.5 w-3.5 flex-shrink-0" />
                                    <span className="truncate">{folder.name}</span>
                                    <span className="text-xs text-white/50 ml-auto flex-shrink-0">
                                      ({folder.documentCount})
                                    </span>
                                  </button>
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <button className="opacity-0 group-hover:opacity-100 p-1 hover:bg-white/10 rounded transition-all">
                                        <MoreVertical className="h-3.5 w-3.5" />
                                      </button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-32">
                                      <DropdownMenuItem
                                        onClick={() =>
                                          handleEditFolder(section.id, { id: folder.id, name: folder.name })
                                        }
                                      >
                                        <Edit2 className="h-3.5 w-3.5 mr-2" />
                                        Edit
                                      </DropdownMenuItem>
                                      <DropdownMenuItem
                                        onClick={() => deleteFolder(section.id, folder.id)}
                                        className="text-red-400"
                                      >
                                        <Trash2 className="h-3.5 w-3.5 mr-2" />
                                        Delete
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Add Folder button */}
                          <button
                            onClick={() => handleCreateFolder(section.id)}
                            className="w-full flex items-center gap-2 px-3 py-1.5 rounded text-sm transition-colors text-white/60 hover:text-white hover:bg-[hsl(var(--sidebar-hover))]"
                          >
                            <Plus className="h-3.5 w-3.5" />
                            <span className="text-xs">Add folder</span>
                          </button>
                        </div>
                      ))}

                      {/* Add Section button */}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start gap-2 px-3 py-1.5 h-auto text-white/60 hover:text-white hover:bg-[hsl(var(--sidebar-hover))]"
                        onClick={handleCreateSection}
                      >
                        <Plus className="h-3.5 w-3.5" />
                        <span className="text-sm">Create new section</span>
                      </Button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Saved Views */}
          <div className="px-2 mb-6">
            <h3 className="px-3 text-xs font-semibold text-white/60 uppercase mb-2">Saved Views</h3>
            {savedViews.map((item) => (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2 rounded text-sm transition-colors",
                  activeView === item.id
                    ? "bg-white/20 text-white"
                    : "text-white/80 hover:bg-[hsl(var(--sidebar-hover))] hover:text-white",
                )}
              >
                {React.createElement(item.icon, { className: "h-4 w-4" })}
                {item.label}
              </button>
            ))}
          </div>

          {/* Manage */}
          <div className="px-2 mb-6">
            <h3 className="px-3 text-xs font-semibold text-white/60 uppercase mb-2">Manage</h3>
            {manageItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2 rounded text-sm transition-colors",
                  activeView === item.id
                    ? "bg-white/20 text-white"
                    : "text-white/80 hover:bg-[hsl(var(--sidebar-hover))] hover:text-white",
                )}
              >
                {React.createElement(item.icon, { className: "h-4 w-4" })}
                {item.label}
              </button>
            ))}
          </div>

          {/* Administration */}
          <div className="px-2">
            <h3 className="px-3 text-xs font-semibold text-white/60 uppercase mb-2">Administration</h3>
            {adminItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2 rounded text-sm transition-colors",
                  activeView === item.id
                    ? "bg-white/20 text-white"
                    : "text-white/80 hover:bg-[hsl(var(--sidebar-hover))] hover:text-white",
                )}
              >
                {React.createElement(item.icon, { className: "h-4 w-4" })}
                {item.label}
              </button>
            ))}
          </div>
        </nav>

        <div className="p-4 border-t border-white/10">
          <p className="text-xs text-white/60">DMS v2.0.0</p>
        </div>
      </aside>

      {/* Dialogs */}
      <CreateSectionDialog
        open={sectionCreateDialogOpen}
        onOpenChange={setSectionCreateDialogOpen}
        section={editingSection}
      />
      <CreateFolderDialog
        open={folderCreateDialogOpen}
        onOpenChange={setFolderCreateDialogOpen}
        sectionId={selectedSectionId || ""}
        folder={editingFolder}
      />
    </>
  )
}

export default Sidebar
