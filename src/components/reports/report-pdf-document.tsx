'use client'

import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from '@react-pdf/renderer'
import { format } from 'date-fns'
import type { DailySiteReport } from '@/types/report'
import type { RehabProject } from '@/types/database'

// Register fonts (using system fonts for compatibility)
Font.register({
  family: 'Roboto',
  fonts: [
    {
      src: 'https://fonts.gstatic.com/s/roboto/v30/KFOmCnqEu92Fr1Me5Q.ttf',
      fontWeight: 400,
    },
    {
      src: 'https://fonts.gstatic.com/s/roboto/v30/KFOlCnqEu92Fr1MmWUlvAw.ttf',
      fontWeight: 700,
    },
  ],
})

// Styles
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Roboto',
    fontSize: 10,
    lineHeight: 1.4,
  },
  header: {
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 2,
    borderBottomColor: '#333',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 700,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#666',
  },
  headerDate: {
    fontSize: 14,
    fontWeight: 700,
    marginTop: 10,
  },
  section: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 700,
    marginBottom: 8,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  row: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  label: {
    width: 120,
    fontWeight: 700,
    color: '#555',
  },
  value: {
    flex: 1,
  },
  textBlock: {
    marginTop: 4,
    padding: 8,
    backgroundColor: '#f9f9f9',
    borderRadius: 4,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: 8,
    color: '#999',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 10,
  },
  badge: {
    padding: '2 6',
    backgroundColor: '#e0e0e0',
    borderRadius: 3,
    fontSize: 8,
  },
  badgeSubmitted: {
    backgroundColor: '#4caf50',
    color: 'white',
  },
})

interface ReportPDFDocumentProps {
  report: DailySiteReport
  project: RehabProject
}

export function ReportPDFDocument({ report, project }: ReportPDFDocumentProps) {
  const reportDate = new Date(report.report_date)
  const projectName =
    project.project_name ||
    (project.address_street
      ? `${project.address_street}, ${project.address_city || ''}`
      : 'Unnamed Project')

  const weatherDisplay = report.weather_conditions
    ? `${report.weather_conditions.charAt(0).toUpperCase()}${report.weather_conditions.slice(1)}`
    : 'Not recorded'

  const tempDisplay =
    report.temperature_high || report.temperature_low
      ? `${report.temperature_low || '--'}°F - ${report.temperature_high || '--'}°F`
      : ''

  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Daily Site Report</Text>
          <Text style={styles.headerSubtitle}>{projectName}</Text>
          <Text style={styles.headerDate}>
            {format(reportDate, 'EEEE, MMMM d, yyyy')}
          </Text>
        </View>

        {/* Weather Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Weather Conditions</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Conditions:</Text>
            <Text style={styles.value}>{weatherDisplay}</Text>
          </View>
          {tempDisplay && (
            <View style={styles.row}>
              <Text style={styles.label}>Temperature:</Text>
              <Text style={styles.value}>{tempDisplay}</Text>
            </View>
          )}
          {report.weather_notes && (
            <View style={styles.textBlock}>
              <Text>{report.weather_notes}</Text>
            </View>
          )}
        </View>

        {/* Crew Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Crew & Vendors</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Crew on Site:</Text>
            <Text style={styles.value}>{report.crew_count || 0} workers</Text>
          </View>
        </View>

        {/* Work Completed */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Work Completed</Text>
          <View style={styles.textBlock}>
            <Text>{report.work_completed || 'No work recorded.'}</Text>
          </View>
        </View>

        {/* Planned for Tomorrow */}
        {report.work_planned_tomorrow && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Planned for Tomorrow</Text>
            <View style={styles.textBlock}>
              <Text>{report.work_planned_tomorrow}</Text>
            </View>
          </View>
        )}

        {/* Issues */}
        {report.issues_encountered && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Issues Encountered</Text>
            <View style={styles.textBlock}>
              <Text>{report.issues_encountered}</Text>
            </View>
          </View>
        )}

        {/* Delays */}
        {report.delays && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Delays</Text>
            <View style={styles.textBlock}>
              <Text>{report.delays}</Text>
            </View>
          </View>
        )}

        {/* Safety */}
        {report.safety_incidents && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Safety Incidents</Text>
            <View style={styles.textBlock}>
              <Text>{report.safety_incidents}</Text>
            </View>
          </View>
        )}

        {/* General Notes */}
        {report.general_notes && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>General Notes</Text>
            <View style={styles.textBlock}>
              <Text>{report.general_notes}</Text>
            </View>
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <Text>
            Report ID: {report.id.slice(0, 8)}... | Status:{' '}
            {report.status === 'submitted' ? 'Submitted' : 'Draft'}
          </Text>
          <Text>
            Generated: {format(new Date(), 'MMM d, yyyy h:mm a')}
          </Text>
        </View>
      </Page>
    </Document>
  )
}
