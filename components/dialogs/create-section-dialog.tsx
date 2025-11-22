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
import { useSections } from "@/lib/sections"

interface CreateSectionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  section?: { id: string; name: string } | null
}

export function CreateSectionDialog({ open, onOpenChange, section }: CreateSectionDialogProps) {
  const { addSection, updateSection } = useSections()
  const [name, setName] = useState(section?.name || "")

  const handleSubmit = () => {
    if (!name.trim()) return

    if (section) {
      updateSection(section.id, name)
    } else {
      addSection(name)
    }

    setName("")
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{section ? "Edit Section" : "Create New Section"}</DialogTitle>
          <DialogDescription>
            {section ? "Update the section name" : "Create a new section to organize your documents"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Input
            placeholder="Section name"
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
            {section ? "Update" : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
