'use client'

import { useState, useRef, useEffect } from 'react'
import { X, Hash, Smile } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { useNotebookStore } from '@/stores/notebook-store'
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

  const { updatePage, addTag, removeTag } = useNotebookStore()

  // Sync title with page changes
  useEffect(() => {
    setTitle(page.title)
  }, [page.title])

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value)
  }

  const handleTitleBlur = () => {
    if (title !== page.title) {
      updatePage(page.id, { title })
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
    if (newTag.trim()) {
      await addTag(page.id, newTag.trim())
      setNewTag('')
      setIsAddingTag(false)
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

  return (
    <div className="px-6 py-4 border-b">
      {/* Icon and Title */}
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
          className="text-2xl font-bold border-none shadow-none focus-visible:ring-0 px-0 h-auto"
          placeholder="Untitled"
        />
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
