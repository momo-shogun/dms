"use client"

import { X, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { Document } from "./document-card"

interface DocumentDetailProps {
  document: Document
  onClose: () => void
  totalDocuments: number
  currentIndex: number
}

const DocumentDetail = ({ document, onClose, totalDocuments, currentIndex }: DocumentDetailProps) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-card border border-border rounded-lg w-full max-w-2xl mx-4 max-h-[90vh] overflow-auto">
        <div className="p-6 space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-2">{document.title}</h2>
              {document.correspondent && <p className="text-muted-foreground mb-2">{document.correspondent}</p>}
            </div>
            <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            <span className="text-sm text-muted-foreground self-center">
              {currentIndex + 1} of {totalDocuments}
            </span>
            <Button variant="outline" size="sm">
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>

          {document.tags && document.tags.length > 0 && (
            <div>
              <p className="text-sm font-medium mb-2">Tags</p>
              <div className="flex flex-wrap gap-2">
                {document.tags.map((tag) => (
                  <Badge key={tag.name} variant="secondary">
                    {tag.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <div className="pt-4 border-t border-border">
            <p className="text-sm text-muted-foreground">Date: {document.date}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DocumentDetail
