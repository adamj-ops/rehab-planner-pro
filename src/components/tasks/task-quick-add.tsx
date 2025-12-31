'use client'

import { useState, useRef, useEffect } from 'react'
import { IconPlus, IconLoader2 } from '@tabler/icons-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useCreateTask } from '@/hooks/use-task-mutations'
import type { TaskStatus } from '@/types/task'

interface TaskQuickAddProps {
  projectId: string
  status?: TaskStatus
  onAdd?: () => void
}

export function TaskQuickAdd({
  projectId,
  status = 'to_do',
  onAdd,
}: TaskQuickAddProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [title, setTitle] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const createTask = useCreateTask()

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    try {
      await createTask.mutateAsync({
        project_id: projectId,
        title: title.trim(),
        status,
      })
      setTitle('')
      onAdd?.()
    } catch {
      // Error handled by mutation
    }
  }

  const handleBlur = () => {
    if (!title.trim()) {
      setIsOpen(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setTitle('')
      setIsOpen(false)
    }
  }

  if (!isOpen) {
    return (
      <Button
        variant="ghost"
        size="sm"
        className="w-full justify-start text-muted-foreground hover:text-foreground"
        onClick={() => setIsOpen(true)}
      >
        <IconPlus className="h-4 w-4 mr-2" />
        Add task
      </Button>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <Input
        ref={inputRef}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        placeholder="Task title..."
        className="h-8 text-sm"
        disabled={createTask.isPending}
      />
      <Button
        type="submit"
        size="sm"
        className="h-8"
        disabled={!title.trim() || createTask.isPending}
      >
        {createTask.isPending ? (
          <IconLoader2 className="h-4 w-4 animate-spin" />
        ) : (
          <IconPlus className="h-4 w-4" />
        )}
      </Button>
    </form>
  )
}
