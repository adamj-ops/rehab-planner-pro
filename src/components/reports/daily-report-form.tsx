'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { format } from 'date-fns'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
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
import { Separator } from '@/components/ui/separator'
import { IconLoader2, IconSend, IconDeviceFloppy } from '@tabler/icons-react'
import {
  useCreateReport,
  useUpdateReport,
  useSubmitReport,
} from '@/hooks/use-daily-reports'
import { WEATHER_OPTIONS } from '@/types/report'
import type { DailySiteReport, WeatherCondition } from '@/types/report'

const reportSchema = z.object({
  report_date: z.string(),
  weather_conditions: z.string().optional(),
  temperature_high: z.coerce.number().optional(),
  temperature_low: z.coerce.number().optional(),
  weather_notes: z.string().optional(),
  crew_count: z.coerce.number().min(0).default(0),
  work_completed: z.string().optional(),
  work_planned_tomorrow: z.string().optional(),
  issues_encountered: z.string().optional(),
  safety_incidents: z.string().optional(),
  delays: z.string().optional(),
  general_notes: z.string().optional(),
})

type ReportFormValues = z.infer<typeof reportSchema>

interface DailyReportFormProps {
  projectId: string
  report?: DailySiteReport | null
  onSuccess?: () => void
}

export function DailyReportForm({
  projectId,
  report,
  onSuccess,
}: DailyReportFormProps) {
  const isEditing = !!report
  const createReport = useCreateReport()
  const updateReport = useUpdateReport()
  const submitReport = useSubmitReport()

  const form = useForm<ReportFormValues>({
    resolver: zodResolver(reportSchema),
    defaultValues: {
      report_date: format(new Date(), 'yyyy-MM-dd'),
      crew_count: 0,
    },
  })

  // Populate form when editing
  useEffect(() => {
    if (report) {
      form.reset({
        report_date: report.report_date,
        weather_conditions: report.weather_conditions || undefined,
        temperature_high: report.temperature_high || undefined,
        temperature_low: report.temperature_low || undefined,
        weather_notes: report.weather_notes || '',
        crew_count: report.crew_count || 0,
        work_completed: report.work_completed || '',
        work_planned_tomorrow: report.work_planned_tomorrow || '',
        issues_encountered: report.issues_encountered || '',
        safety_incidents: report.safety_incidents || '',
        delays: report.delays || '',
        general_notes: report.general_notes || '',
      })
    }
  }, [report, form])

  const handleSave = async (values: ReportFormValues) => {
    try {
      if (isEditing && report) {
        await updateReport.mutateAsync({
          id: report.id,
          ...values,
          weather_conditions: values.weather_conditions as WeatherCondition,
        })
      } else {
        await createReport.mutateAsync({
          project_id: projectId,
          ...values,
          weather_conditions: values.weather_conditions as WeatherCondition,
        })
      }
      onSuccess?.()
    } catch {
      // Error handled by mutation
    }
  }

  const handleSubmit = async () => {
    if (!report) return

    const values = form.getValues()
    // Save first, then submit
    await updateReport.mutateAsync({
      id: report.id,
      ...values,
      weather_conditions: values.weather_conditions as WeatherCondition,
    })
    await submitReport.mutateAsync(report.id)
    onSuccess?.()
  }

  const isPending =
    createReport.isPending || updateReport.isPending || submitReport.isPending

  const isSubmitted = report?.status === 'submitted'

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSave)} className="space-y-6">
        {/* Date */}
        <FormField
          control={form.control}
          name="report_date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Report Date</FormLabel>
              <FormControl>
                <Input type="date" {...field} disabled={isSubmitted} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Weather Section */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Weather Conditions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="weather_conditions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Conditions</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={isSubmitted}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select weather" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {WEATHER_OPTIONS.map((opt) => (
                          <SelectItem key={opt.id} value={opt.id}>
                            {opt.icon} {opt.name}
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
                name="temperature_high"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>High (°F)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="e.g., 75"
                        {...field}
                        disabled={isSubmitted}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="temperature_low"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Low (°F)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="e.g., 55"
                        {...field}
                        disabled={isSubmitted}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="weather_notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Weather Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Any weather-related notes (rain delays, etc.)"
                      rows={2}
                      {...field}
                      disabled={isSubmitted}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Crew Section */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Crew & Vendors</CardTitle>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="crew_count"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Total Crew on Site</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      {...field}
                      disabled={isSubmitted}
                    />
                  </FormControl>
                  <FormDescription>
                    Total number of workers on site today
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* TODO: Add vendor multi-select when vendor data is available */}
          </CardContent>
        </Card>

        {/* Work Summary Section */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Work Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="work_completed"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Work Completed Today</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe work accomplished today..."
                      rows={4}
                      {...field}
                      disabled={isSubmitted}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="work_planned_tomorrow"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Planned for Tomorrow</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="What's planned for the next work day..."
                      rows={3}
                      {...field}
                      disabled={isSubmitted}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Issues Section */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Issues & Notes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="issues_encountered"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Issues Encountered</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Any problems or challenges..."
                      rows={3}
                      {...field}
                      disabled={isSubmitted}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="delays"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Delays</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Any delays and reasons..."
                      rows={2}
                      {...field}
                      disabled={isSubmitted}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="safety_incidents"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Safety Incidents</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Any safety concerns or incidents (leave blank if none)..."
                      rows={2}
                      {...field}
                      disabled={isSubmitted}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Separator />

            <FormField
              control={form.control}
              name="general_notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>General Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Any other notes or observations..."
                      rows={3}
                      {...field}
                      disabled={isSubmitted}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Actions */}
        {!isSubmitted && (
          <div className="flex items-center gap-3">
            <Button type="submit" variant="outline" disabled={isPending}>
              {isPending ? (
                <IconLoader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <IconDeviceFloppy className="h-4 w-4 mr-2" />
              )}
              Save Draft
            </Button>

            {isEditing && (
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={isPending}
              >
                {isPending ? (
                  <IconLoader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <IconSend className="h-4 w-4 mr-2" />
                )}
                Submit Report
              </Button>
            )}
          </div>
        )}

        {isSubmitted && (
          <div className="text-sm text-muted-foreground">
            This report was submitted on{' '}
            {report?.submitted_at
              ? format(new Date(report.submitted_at), 'PPP')
              : 'unknown date'}
            . Submitted reports cannot be edited.
          </div>
        )}
      </form>
    </Form>
  )
}
