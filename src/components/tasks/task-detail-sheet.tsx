'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { format } from 'date-fns'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { IconCalendar, IconLoader2, IconTrash } from '@tabler/icons-react'
import { useCreateTask, useUpdateTask, useDeleteTask } from '@/hooks/use-task-mutations'
import { TASK_COLUMNS, TASK_PRIORITIES } from '@/types/task'
import type { ProjectTask, TaskStatus, TaskPriority } from '@/types/task'

const taskSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  status: z.enum(['to_do', 'in_progress', 'blocked', 'done']),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  due_date: z.date().optional().nullable(),
})

type TaskFormValues = z.infer<typeof taskSchema>

interface TaskDetailSheetProps {
  isOpen: boolean
  onClose: () => void
  projectId: string
  task?: ProjectTask | null
  defaultStatus?: TaskStatus
}

export function TaskDetailSheet({
  isOpen,
  onClose,
  projectId,
  task,
  defaultStatus = 'to_do',
}: TaskDetailSheetProps) {
  const isEditing = !!task
  const createTask = useCreateTask()
  const updateTask = useUpdateTask()
  const deleteTask = useDeleteTask()

  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: '',
      description: '',
      status: defaultStatus,
      priority: 'medium',
      due_date: null,
    },
  })

  // Reset form when task changes
  useEffect(() => {
    if (task) {
      form.reset({
        title: task.title,
        description: task.description || '',
        status: task.status,
        priority: task.priority,
        due_date: task.due_date ? new Date(task.due_date) : null,
      })
    } else {
      form.reset({
        title: '',
        description: '',
        status: defaultStatus,
        priority: 'medium',
        due_date: null,
      })
    }
  }, [task, defaultStatus, form])

  const handleSubmit = async (values: TaskFormValues) => {
    try {
      if (isEditing && task) {
        await updateTask.mutateAsync({
          id: task.id,
          title: values.title,
          description: values.description || null,
          status: values.status as TaskStatus,
          priority: values.priority as TaskPriority,
          due_date: values.due_date?.toISOString().split('T')[0] || null,
        })
      } else {
        await createTask.mutateAsync({
          project_id: projectId,
          title: values.title,
          description: values.description,
          status: values.status as TaskStatus,
          priority: values.priority as TaskPriority,
          due_date: values.due_date?.toISOString().split('T')[0],
        })
      }
      onClose()
    } catch {
      // Error handled by mutations
    }
  }

  const handleDelete = async () => {
    if (!task) return
    if (!confirm('Are you sure you want to delete this task?')) return

    try {
      await deleteTask.mutateAsync({ taskId: task.id, projectId })
      onClose()
    } catch {
      // Error handled by mutation
    }
  }

  const isPending = createTask.isPending || updateTask.isPending

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>{isEditing ? 'Edit Task' : 'Create Task'}</SheetTitle>
          <SheetDescription>
            {isEditing
              ? 'Update the task details below.'
              : 'Add a new task to your project.'}
          </SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4 mt-6"
          >
            {/* Title */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Task title..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Add details about this task..."
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Status and Priority row */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {TASK_COLUMNS.map((col) => (
                          <SelectItem key={col.id} value={col.id}>
                            {col.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priority</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {TASK_PRIORITIES.map((p) => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Due Date */}
            <FormField
              control={form.control}
              name="due_date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Due Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            'w-full pl-3 text-left font-normal',
                            !field.value && 'text-muted-foreground'
                          )}
                        >
                          {field.value ? (
                            format(field.value, 'PPP')
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <IconCalendar className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value || undefined}
                        onSelect={field.onChange}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Actions */}
            <div className="flex items-center gap-2 pt-4">
              <Button type="submit" disabled={isPending} className="flex-1">
                {isPending && (
                  <IconLoader2 className="h-4 w-4 mr-2 animate-spin" />
                )}
                {isEditing ? 'Save Changes' : 'Create Task'}
              </Button>

              {isEditing && (
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  onClick={handleDelete}
                  disabled={deleteTask.isPending}
                >
                  {deleteTask.isPending ? (
                    <IconLoader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <IconTrash className="h-4 w-4" />
                  )}
                </Button>
              )}
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  )
}
