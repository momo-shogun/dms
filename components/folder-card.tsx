"use client"

import { Folder } from "lucide-react"
import { Card } from "@/components/ui/card"

export interface FolderItem {
  id: string
  name: string
  documentCount: number
}

interface FolderCardProps {
  folder: FolderItem
  onClick: () => void
}

const FolderCard = ({ folder, onClick }: FolderCardProps) => {
  return (
    <Card className="p-4 hover:bg-accent cursor-pointer transition-colors leading-4 border-muted" onClick={onClick}>
      <div className="flex items-center gap-3">
        <Folder className="h-8 w-8 text-primary" />
        <div className="flex-1 min-w-0">
          <h3 className="font-medium truncate">{folder.name}</h3>
          <p className="text-sm text-muted-foreground">
            {folder.documentCount} document{folder.documentCount !== 1 ? "s" : ""}
          </p>
        </div>
      </div>
    </Card>
  )
}

export default FolderCard
