'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import type {
  DailySiteReport,
  CreateReportInput,
  UpdateReportInput,
} from '@/types/report'

// Fetch all reports for a project
export function useProjectReports(projectId: string) {
  return useQuery({
    queryKey: ['reports', projectId],
    queryFn: async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('daily_site_reports')
        .select('*')
        .eq('project_id', projectId)
        .order('report_date', { ascending: false })

      if (error) throw error
      return data as DailySiteReport[]
    },
    enabled: !!projectId,
  })
}

// Fetch a single report by ID
export function useReport(reportId: string) {
  return useQuery({
    queryKey: ['report', reportId],
    queryFn: async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('daily_site_reports')
        .select('*')
        .eq('id', reportId)
        .single()

      if (error) throw error
      return data as DailySiteReport
    },
    enabled: !!reportId,
  })
}

// Check if report exists for a specific date
export function useReportByDate(projectId: string, date: string) {
  return useQuery({
    queryKey: ['report', projectId, 'date', date],
    queryFn: async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('daily_site_reports')
        .select('*')
        .eq('project_id', projectId)
        .eq('report_date', date)
        .maybeSingle()

      if (error) throw error
      return data as DailySiteReport | null
    },
    enabled: !!projectId && !!date,
  })
}

// Create a new report
export function useCreateReport() {
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation({
    mutationFn: async (input: CreateReportInput) => {
      const { data, error } = await supabase
        .from('daily_site_reports')
        .insert({
          ...input,
          report_date: input.report_date || new Date().toISOString().split('T')[0],
          status: 'draft',
        })
        .select()
        .single()

      if (error) throw error
      return data as DailySiteReport
    },
    onSuccess: (newReport) => {
      queryClient.invalidateQueries({ queryKey: ['reports', newReport.project_id] })
      toast.success('Report created')
    },
    onError: (error) => {
      toast.error('Failed to create report', {
        description: error.message,
      })
    },
  })
}

// Update an existing report
export function useUpdateReport() {
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation({
    mutationFn: async (input: UpdateReportInput) => {
      const { id, ...updates } = input
      const { data, error } = await supabase
        .from('daily_site_reports')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data as DailySiteReport
    },
    onSuccess: (updatedReport) => {
      queryClient.invalidateQueries({ queryKey: ['reports', updatedReport.project_id] })
      queryClient.invalidateQueries({ queryKey: ['report', updatedReport.id] })
    },
    onError: (error) => {
      toast.error('Failed to update report', {
        description: error.message,
      })
    },
  })
}

// Submit a report
export function useSubmitReport() {
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation({
    mutationFn: async (reportId: string) => {
      const user = (await supabase.auth.getUser()).data.user

      const { data, error } = await supabase
        .from('daily_site_reports')
        .update({
          status: 'submitted',
          submitted_at: new Date().toISOString(),
          submitted_by: user?.id,
        })
        .eq('id', reportId)
        .select()
        .single()

      if (error) throw error
      return data as DailySiteReport
    },
    onSuccess: (report) => {
      queryClient.invalidateQueries({ queryKey: ['reports', report.project_id] })
      queryClient.invalidateQueries({ queryKey: ['report', report.id] })
      toast.success('Report submitted')
    },
    onError: (error) => {
      toast.error('Failed to submit report', {
        description: error.message,
      })
    },
  })
}

// Delete a report
export function useDeleteReport() {
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation({
    mutationFn: async ({ reportId, projectId }: { reportId: string; projectId: string }) => {
      const { error } = await supabase
        .from('daily_site_reports')
        .delete()
        .eq('id', reportId)

      if (error) throw error
      return { reportId, projectId }
    },
    onSuccess: ({ projectId }) => {
      queryClient.invalidateQueries({ queryKey: ['reports', projectId] })
      toast.success('Report deleted')
    },
    onError: (error) => {
      toast.error('Failed to delete report', {
        description: error.message,
      })
    },
  })
}
