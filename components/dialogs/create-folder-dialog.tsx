"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useData } from "@/lib/data-context"

interface CreateFolderDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  sectionId: string
  folder?: { id: string; name: string } | null
}

export function CreateFolderDialog({ open, onOpenChange, sectionId, folder }: CreateFolderDialogProps) {
  const { addFolder, updateFolder } = useData()
  const [name, setName] = useState(folder?.name || "")

  const handleSubmit = () => {
    if (!name.trim()) return

    if (folder) {
      updateFolder(sectionId, folder.id, name)
    } else {
      addFolder(sectionId, name)
    }

    setName("")
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{folder ? "Edit Folder" : "Create New Folder"}</DialogTitle>
          <DialogDescription>
            {folder ? "Update the folder name" : "Create a new folder in this section"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Input
            placeholder="Folder name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSubmit()
            }}
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!name.trim()}>
            {folder ? "Update" : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
