"use client"

import { Badge } from "@/components/ui/badge"

export interface Document {
  id: string
  title: string
  correspondent?: string
  date: string
  tags?: { name: string; color: string }[]
}

interface DocumentCardProps {
  document: Document
  onClick: () => void
}

const DocumentCard = ({ document, onClick }: DocumentCardProps) => {
  return (
    <div
      className="p-4 border hover:bg-accent/50 cursor-pointer transition-colors rounded border-muted"
      onClick={onClick}
    >
      <div className="space-y-3">
        <h3 className="font-medium line-clamp-3 text-sm leading-snug">{document.title}</h3>
        {document.correspondent && <p className="text-xs text-muted-foreground">{document.correspondent}</p>}
        {document.tags && document.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {document.tags.map((tag) => (
              <Badge
                key={tag.name}
                className={`bg-tag-${tag.color} text-tag-${tag.color}-foreground`}
                variant="secondary"
              >
                {tag.name}
              </Badge>
            ))}
          </div>
        )}
        <p className="text-xs text-muted-foreground">{document.date}</p>
      </div>
    </div>
  )
}

export default DocumentCard
