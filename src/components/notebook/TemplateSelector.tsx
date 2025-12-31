'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { NOTEBOOK_TEMPLATES, type NotebookTemplate } from '@/types/notebook'
import { cn } from '@/lib/utils'

interface TemplateSelectorProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (template: NotebookTemplate | null) => void
}

export function TemplateSelector({
  open,
  onOpenChange,
  onSelect,
}: TemplateSelectorProps) {
  const handleSelect = (template: NotebookTemplate | null) => {
    onSelect(template)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Choose a template</DialogTitle>
          <DialogDescription>
            Start with a template or create a blank page
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-3 py-4">
          {/* Blank page option */}
          <button
            onClick={() => handleSelect(null)}
            className={cn(
              'flex flex-col items-start gap-2 p-4 border rounded-lg text-left',
              'hover:border-primary hover:bg-muted/50 transition-colors'
            )}
          >
            <span className="text-2xl">📄</span>
            <div>
              <h4 className="font-medium">Blank Page</h4>
              <p className="text-sm text-muted-foreground">
                Start from scratch
              </p>
            </div>
          </button>

          {/* Template options */}
          {NOTEBOOK_TEMPLATES.map((template) => (
            <button
              key={template.type}
              onClick={() => handleSelect(template.type)}
              className={cn(
                'flex flex-col items-start gap-2 p-4 border rounded-lg text-left',
                'hover:border-primary hover:bg-muted/50 transition-colors'
              )}
            >
              <span className="text-2xl">{template.icon}</span>
              <div>
                <h4 className="font-medium">{template.label}</h4>
                <p className="text-sm text-muted-foreground">
                  {template.description}
                </p>
              </div>
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
