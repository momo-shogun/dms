"use client"

import { useState } from "react"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core"
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Badge } from "@/components/ui/badge"
import { GripVertical, Share, Settings, Download, Folder } from "lucide-react"
import type { Document } from "./document-card"
import type { FolderItem } from "./folder-card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"

interface DocumentTableRowProps {
  document: Document
  onClick: () => void
}

function DocumentTableRow({ document, onClick }: DocumentTableRowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: document.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <tr ref={setNodeRef} style={style} className="border-b border-border hover:bg-accent/50 cursor-pointer">
      <td className="py-3 px-4">
        <div className="flex items-center gap-2">
          <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing">
            <GripVertical className="h-4 w-4 text-muted-foreground" />
          </div>
          <Checkbox />
        </div>
      </td>
      <td className="py-3 px-4" onClick={onClick}>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">{document.title}</span>
        </div>
      </td>
      <td className="py-3 px-4" onClick={onClick}>
        <div className="flex flex-wrap gap-1">
          {document.tags?.map((tag) => (
            <Badge key={tag.name} className={`bg-tag-${tag.color} text-tag-${tag.color}-foreground`}>
              {tag.name}
            </Badge>
          ))}
        </div>
      </td>
      <td className="py-3 px-4 text-sm text-muted-foreground" onClick={onClick}>
        {document.date}
      </td>
      <td className="py-3 px-4">
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
            <Share className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
            <Settings className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
            <Download className="h-3.5 w-3.5" />
          </Button>
        </div>
      </td>
    </tr>
  )
}

interface DocumentTableViewProps {
  folders?: FolderItem[]
  documents: Document[]
  onDocumentClick: (doc: Document) => void
  onFolderClick?: (folder: FolderItem) => void
}

export default function DocumentTableView({
  folders = [],
  documents: initialDocuments,
  onDocumentClick,
  onFolderClick,
}: DocumentTableViewProps) {
  const [documents, setDocuments] = useState(initialDocuments)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      setDocuments((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id)
        const newIndex = items.findIndex((item) => item.id === over.id)
        return arrayMove(items, oldIndex, newIndex)
      })
    }
  }

  return (
    <div className="overflow-auto">
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="py-3 px-4 text-left">
                <Checkbox />
              </th>
              <th className="py-3 px-4 text-left text-sm font-medium">Name</th>
              <th className="py-3 px-4 text-left text-sm font-medium">Tags</th>
              <th className="py-3 px-4 text-left text-sm font-medium">Date</th>
              <th className="py-3 px-4 text-left text-sm font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {folders.map((folder) => (
              <tr
                key={folder.id}
                className="border-b border-border hover:bg-accent/50 cursor-pointer"
                onClick={() => onFolderClick?.(folder)}
              >
                <td className="py-3 px-4">
                  <Checkbox />
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <Folder className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">{folder.name}</span>
                  </div>
                </td>
                <td className="py-3 px-4 text-sm text-muted-foreground">{folder.documentCount} documents</td>
                <td className="py-3 px-4 text-sm text-muted-foreground">-</td>
                <td className="py-3 px-4">-</td>
              </tr>
            ))}
            <SortableContext items={documents.map((d) => d.id)} strategy={verticalListSortingStrategy}>
              {documents.map((doc) => (
                <DocumentTableRow key={doc.id} document={doc} onClick={() => onDocumentClick(doc)} />
              ))}
            </SortableContext>
          </tbody>
        </table>
      </DndContext>
    </div>
  )
}
