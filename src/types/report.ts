/**
 * Daily Site Report Types
 * Aligned with daily_site_reports table in Supabase
 */

export type WeatherCondition = 'sunny' | 'cloudy' | 'rainy' | 'snowy' | 'mixed' | 'windy'
export type ReportStatus = 'draft' | 'submitted'

export interface DailySiteReport {
  id: string
  project_id: string
  report_date: string
  
  // Weather
  weather_conditions: WeatherCondition | null
  temperature_high: number | null
  temperature_low: number | null
  weather_notes: string | null
  
  // Crew
  crew_count: number
  vendors_on_site: string[] | null
  
  // Work summary
  work_completed: string | null
  work_planned_tomorrow: string | null
  
  // Issues
  issues_encountered: string | null
  safety_incidents: string | null
  delays: string | null
  general_notes: string | null
  
  // Linked data
  linked_tasks: string[] | null
  linked_photos: string[] | null
  
  // Status
  status: ReportStatus
  submitted_at: string | null
  submitted_by: string | null
  
  // Timestamps
  created_at: string
  updated_at: string
}

export const WEATHER_OPTIONS: { id: WeatherCondition; name: string; icon: string }[] = [
  { id: 'sunny', name: 'Sunny', icon: '☀️' },
  { id: 'cloudy', name: 'Cloudy', icon: '☁️' },
  { id: 'rainy', name: 'Rainy', icon: '🌧️' },
  { id: 'snowy', name: 'Snowy', icon: '❄️' },
  { id: 'mixed', name: 'Mixed', icon: '🌤️' },
  { id: 'windy', name: 'Windy', icon: '💨' },
]

export interface CreateReportInput {
  project_id: string
  report_date?: string
  weather_conditions?: WeatherCondition
  temperature_high?: number
  temperature_low?: number
  weather_notes?: string
  crew_count?: number
  vendors_on_site?: string[]
  work_completed?: string
  work_planned_tomorrow?: string
  issues_encountered?: string
  safety_incidents?: string
  delays?: string
  general_notes?: string
  linked_tasks?: string[]
  linked_photos?: string[]
}

export interface UpdateReportInput extends Partial<CreateReportInput> {
  id: string
  status?: ReportStatus
}
