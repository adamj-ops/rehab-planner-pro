'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { X, FileDown, MoreHorizontal, Copy, FileText, Hash, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { toast } from 'sonner'
import { useNotebookStore } from '@/hooks/use-notebook-store'
import type { NotebookPage } from '@/types/notebook'

// Common emojis for page icons
const EMOJI_OPTIONS = [
  '📝', '📋', '📄', '📑', '📖', '📚', '✏️', '🖊️',
  '🏠', '🏡', '🏗️', '🔨', '🔧', '🪚', '🧰', '🪜',
  '💡', '✨', '⭐', '🎯', '🎨', '🖼️', '📸', '🎬',
  '💰', '💵', '📊', '📈', '📉', '🧮', '💳', '🏦',
  '👷', '🤝', '👥', '📞', '📧', '📆', '⏰', '⚡',
  '✅', '❌', '⚠️', '❓', '❗', '🔴', '🟢', '🔵',
]

interface PageHeaderProps {
  page: NotebookPage
}

export function PageHeader({ page }: PageHeaderProps) {
  const [title, setTitle] = useState(page.title)
  const [newTag, setNewTag] = useState('')
  const [isAddingTag, setIsAddingTag] = useState(false)
  const tagInputRef = useRef<HTMLInputElement>(null)

  const { updatePage, addTag, removeTag, deletePage } = useNotebookStore()

  // Sync title with page changes
  useEffect(() => {
    setTitle(page.title)
  }, [page.title])

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value)
  }

  const handleTitleBlur = () => {
    // Trim and validate title
    const trimmedTitle = title.trim()
    
    // Don't allow empty titles
    if (!trimmedTitle) {
      setTitle(page.title) // Reset to original
      toast.error('Title cannot be empty')
      return
    }
    
    // Limit title length
    if (trimmedTitle.length > 200) {
      setTitle(trimmedTitle.slice(0, 200))
      toast.warning('Title truncated to 200 characters')
    }
    
    if (trimmedTitle !== page.title) {
      updatePage(page.id, { title: trimmedTitle })
    }
  }

  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.currentTarget.blur()
    }
  }

  const handleIconSelect = (icon: string) => {
    updatePage(page.id, { icon })
  }

  const handleRemoveIcon = () => {
    updatePage(page.id, { icon: null })
  }

  const handleAddTag = async () => {
    const trimmedTag = newTag.trim()
    
    // Validate tag
    if (!trimmedTag) {
      setNewTag('')
      setIsAddingTag(false)
      return
    }
    
    // Check length
    if (trimmedTag.length > 50) {
      toast.error('Tag must be 50 characters or less')
      return
    }
    
    // Remove special characters that might cause issues
    const sanitizedTag = trimmedTag.replace(/[<>]/g, '')
    
    // Check for duplicates
    if (page.tags?.includes(sanitizedTag)) {
      toast.warning('This tag already exists')
      setNewTag('')
      setIsAddingTag(false)
      return
    }
    
    try {
      await addTag(page.id, sanitizedTag)
      setNewTag('')
      setIsAddingTag(false)
    } catch {
      toast.error('Failed to add tag')
    }
  }

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddTag()
    } else if (e.key === 'Escape') {
      setNewTag('')
      setIsAddingTag(false)
    }
  }

  const handleRemoveTag = async (tag: string) => {
    await removeTag(page.id, tag)
  }

  useEffect(() => {
    if (isAddingTag && tagInputRef.current) {
      tagInputRef.current.focus()
    }
  }, [isAddingTag])

  // Convert Plate.js content to Markdown
  const convertToMarkdown = useCallback((content: unknown[]): string => {
    const lines: string[] = []
    
    const processNode = (node: unknown): void => {
      if (!node || typeof node !== 'object') return
      
      const n = node as Record<string, unknown>
      const type = n.type as string
      const children = n.children as unknown[]
      
      // Extract text from children
      const getText = (kids: unknown[]): string => {
        return kids
          .map((child) => {
            if (typeof child === 'object' && child !== null) {
              const c = child as Record<string, unknown>
              if (typeof c.text === 'string') return c.text
              if (Array.isArray(c.children)) return getText(c.children)
            }
            return ''
          })
          .join('')
      }
      
      const text = children ? getText(children) : ''
      
      switch (type) {
        case 'h1':
          lines.push(`# ${text}`)
          break
        case 'h2':
          lines.push(`## ${text}`)
          break
        case 'h3':
          lines.push(`### ${text}`)
          break
        case 'p':
          lines.push(text || '')
          break
        case 'blockquote':
          lines.push(`> ${text}`)
          break
        case 'ul':
        case 'ol':
          children?.forEach((child, i) => {
            const c = child as Record<string, unknown>
            const prefix = type === 'ol' ? `${i + 1}.` : '-'
            const itemText = getText(c.children as unknown[] || [])
            lines.push(`${prefix} ${itemText}`)
          })
          break
        case 'li':
          lines.push(`- ${text}`)
          break
        case 'code_block':
          lines.push('```')
          lines.push(text)
          lines.push('```')
          break
        case 'hr':
          lines.push('---')
          break
        default:
          if (text) lines.push(text)
      }
    }
    
    for (const node of content) {
      processNode(node)
    }
    return lines.join('\n\n')
  }, [])

  // Export as Markdown
  const handleExportMarkdown = useCallback(() => {
    try {
      const markdown = convertToMarkdown(page.content as unknown[])
      const fullContent = `# ${page.title}\n\n${page.tags?.length ? `Tags: ${page.tags.map(t => `#${t}`).join(' ')}\n\n` : ''}${markdown}`
      
      const blob = new Blob([fullContent], { type: 'text/markdown' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${page.title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.md`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      
      toast.success('Exported as Markdown')
    } catch (error) {
      console.error('Export failed:', error)
      toast.error('Failed to export')
    }
  }, [page, convertToMarkdown])

  // Export as PDF (using browser print)
  const handleExportPDF = useCallback(() => {
    try {
      const markdown = convertToMarkdown(page.content as unknown[])
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>${page.title}</title>
          <style>
            body { font-family: system-ui, -apple-system, sans-serif; max-width: 800px; margin: 40px auto; padding: 20px; line-height: 1.6; }
            h1 { border-bottom: 2px solid #e5e7eb; padding-bottom: 10px; }
            h2 { border-bottom: 1px solid #e5e7eb; padding-bottom: 8px; margin-top: 32px; }
            h3 { margin-top: 24px; }
            blockquote { border-left: 4px solid #e5e7eb; padding-left: 16px; margin-left: 0; color: #6b7280; }
            code { background: #f3f4f6; padding: 2px 6px; border-radius: 4px; }
            pre { background: #f3f4f6; padding: 16px; border-radius: 8px; overflow-x: auto; }
            .tags { display: flex; gap: 8px; margin-bottom: 24px; }
            .tag { background: #e5e7eb; padding: 4px 12px; border-radius: 12px; font-size: 12px; }
            @media print { body { margin: 0; } }
          </style>
        </head>
        <body>
          <h1>${page.icon ? page.icon + ' ' : ''}${page.title}</h1>
          ${page.tags?.length ? `<div class="tags">${page.tags.map(t => `<span class="tag">#${t}</span>`).join('')}</div>` : ''}
          ${markdown.split('\n\n').map(line => {
            if (line.startsWith('# ')) return `<h1>${line.slice(2)}</h1>`
            if (line.startsWith('## ')) return `<h2>${line.slice(3)}</h2>`
            if (line.startsWith('### ')) return `<h3>${line.slice(4)}</h3>`
            if (line.startsWith('> ')) return `<blockquote>${line.slice(2)}</blockquote>`
            if (line.startsWith('- ')) return `<ul><li>${line.slice(2)}</li></ul>`
            if (line.startsWith('---')) return '<hr>'
            if (line.startsWith('```')) return ''
            return `<p>${line}</p>`
          }).join('\n')}
        </body>
        </html>
      `
      
      const printWindow = window.open('', '_blank')
      if (printWindow) {
        printWindow.document.write(htmlContent)
        printWindow.document.close()
        printWindow.onload = () => {
          printWindow.print()
        }
        toast.success('Opening print dialog for PDF export')
      } else {
        toast.error('Please allow popups to export PDF')
      }
    } catch (error) {
      console.error('Export failed:', error)
      toast.error('Failed to export')
    }
  }, [page, convertToMarkdown])

  // Copy as Markdown to clipboard
  const handleCopyMarkdown = useCallback(async () => {
    try {
      const markdown = convertToMarkdown(page.content as unknown[])
      const fullContent = `# ${page.title}\n\n${page.tags?.length ? `Tags: ${page.tags.map(t => `#${t}`).join(' ')}\n\n` : ''}${markdown}`
      
      await navigator.clipboard.writeText(fullContent)
      toast.success('Copied to clipboard')
    } catch (error) {
      console.error('Copy failed:', error)
      toast.error('Failed to copy')
    }
  }, [page, convertToMarkdown])

  const handleDeletePage = useCallback(async () => {
    if (!window.confirm(`Are you sure you want to delete "${page.title}"? This action cannot be undone.`)) {
      return
    }
    
    try {
      await deletePage(page.id)
      toast.success('Page deleted', {
        description: `"${page.title}" has been deleted`,
      })
    } catch (error) {
      console.error('Delete failed:', error)
      toast.error('Failed to delete page')
    }
  }, [page.id, page.title, deletePage])

  return (
    <div className="px-6 py-4 border-b">
      {/* Icon, Title, and Actions */}
      <div className="flex items-center gap-3 mb-3">
        {/* Icon picker */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 text-2xl hover:bg-muted"
            >
              {page.icon || '📄'}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-2" align="start">
            <div className="grid grid-cols-8 gap-1">
              {EMOJI_OPTIONS.map((emoji) => (
                <Button
                  key={emoji}
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-lg"
                  onClick={() => handleIconSelect(emoji)}
                >
                  {emoji}
                </Button>
              ))}
            </div>
            {page.icon && (
              <Button
                variant="ghost"
                size="sm"
                className="w-full mt-2 text-muted-foreground"
                onClick={handleRemoveIcon}
              >
                Remove icon
              </Button>
            )}
          </PopoverContent>
        </Popover>

        {/* Title input */}
        <Input
          value={title}
          onChange={handleTitleChange}
          onBlur={handleTitleBlur}
          onKeyDown={handleTitleKeyDown}
          className="text-2xl font-bold border-none shadow-none focus-visible:ring-0 px-0 h-auto flex-1"
          placeholder="Untitled"
        />

        {/* Export dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Export</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleExportMarkdown}>
              <FileText className="h-4 w-4 mr-2" />
              Download as Markdown
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleExportPDF}>
              <FileDown className="h-4 w-4 mr-2" />
              Export as PDF
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleCopyMarkdown}>
              <Copy className="h-4 w-4 mr-2" />
              Copy as Markdown
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleDeletePage}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete page
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Tags */}
      <div className="flex items-center gap-2 flex-wrap">
        {page.tags?.map((tag) => (
          <Badge
            key={tag}
            variant="secondary"
            className="gap-1 pl-2 pr-1 py-0.5"
          >
            <Hash className="h-3 w-3" />
            {tag}
            <Button
              variant="ghost"
              size="icon"
              className="h-4 w-4 hover:bg-transparent"
              onClick={() => handleRemoveTag(tag)}
            >
              <X className="h-3 w-3" />
            </Button>
          </Badge>
        ))}

        {isAddingTag ? (
          <Input
            ref={tagInputRef}
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            onBlur={handleAddTag}
            onKeyDown={handleTagKeyDown}
            className="h-6 w-24 text-xs"
            placeholder="tag name"
          />
        ) : (
          <Button
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-xs text-muted-foreground"
            onClick={() => setIsAddingTag(true)}
          >
            <Hash className="h-3 w-3 mr-1" />
            Add tag
          </Button>
        )}
      </div>
    </div>
  )
}
