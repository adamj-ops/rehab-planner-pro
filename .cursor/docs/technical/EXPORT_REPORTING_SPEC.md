# Export & Reporting System - Technical Specification

**Version**: 1.0.0  
**Last Updated**: December 28, 2025  
**Status**: Ready for Implementation  
**Epic**: Phase 4 - User Experience & Polish  
**Priority**: HIGH - Professional Output  

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Report Types](#report-types)
3. [PDF Generation](#pdf-generation)
4. [Excel Export](#excel-export)
5. [API Design](#api-design)
6. [Component Architecture](#component-architecture)
7. [Implementation Plan](#implementation-plan)

---

## 🎯 Overview

### Purpose

The Export & Reporting System transforms project data into professional, shareable documents for:

1. **Lender Packages** - Hard money/private lender deal submissions
2. **Contractor SOWs** - Scope of work for bidding
3. **Partner Reports** - Investment partner deal analysis
4. **Personal Records** - Project documentation and archives

### Business Value

```
┌────────────────────────────────────────────────────────────────┐
│                   EXPORT & REPORTING VALUE                       │
├────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. PROFESSIONAL PRESENTATION                                    │
│     ├── Branded PDF reports                                     │
│     ├── Consistent formatting                                   │
│     └── Print-ready layouts                                     │
│                                                                  │
│  2. LENDER APPROVAL                                              │
│     ├── Draw schedules for funding                              │
│     ├── Itemized scope documentation                            │
│     └── ROI projections with scenarios                          │
│                                                                  │
│  3. CONTRACTOR COMMUNICATION                                     │
│     ├── Detailed scope of work PDFs                             │
│     ├── Line-item breakdowns                                    │
│     └── Timeline requirements                                   │
│                                                                  │
│  4. DATA PORTABILITY                                             │
│     ├── Excel exports for further analysis                      │
│     ├── CSV for accounting integration                          │
│     └── JSON for system integrations                            │
│                                                                  │
└────────────────────────────────────────────────────────────────┘
```

---

## 📄 Report Types

### 1. Executive Summary Report

**Audience**: Lenders, Partners, Personal records  
**Format**: PDF (2-3 pages)

```
┌────────────────────────────────────────────────────────────────┐
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  REHAB ESTIMATOR PRO                    [Property Photo]  │  │
│  │  ════════════════════════════════════════════════════════ │  │
│  │                                                            │  │
│  │  EXECUTIVE SUMMARY                                         │  │
│  │  1234 Oak Street, Minneapolis, MN 55401                   │  │
│  │  Prepared: December 28, 2025                               │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
│  PROPERTY OVERVIEW                                               │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ Type: Single Family    Beds: 3    Baths: 2    Sqft: 1,850 │ │
│  │ Year: 1952             Lot: 0.25 ac                       │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  INVESTMENT ANALYSIS                                             │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                                                            │ │
│  │   Purchase Price     $185,000                              │ │
│  │   Renovation Budget  $52,450                               │ │
│  │   Holding Costs      $8,200                                │ │
│  │   ─────────────────────────────                           │ │
│  │   Total Investment   $245,650                              │ │
│  │                                                            │ │
│  │   After Repair Value $325,000                              │ │
│  │   Selling Costs      $26,000                               │ │
│  │   ─────────────────────────────                           │ │
│  │   Net Profit         $53,350                               │ │
│  │                                                            │ │
│  │   ROI: 21.7%    Annualized: 43.4%                         │ │
│  │                                                            │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  SCOPE SUMMARY BY CATEGORY                                       │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  [PIE CHART]           Kitchen      $18,500   35%          │ │
│  │                        Bathroom     $12,200   23%          │ │
│  │                        Exterior     $8,750    17%          │ │
│  │                        Systems      $7,000    13%          │ │
│  │                        Other        $6,000    12%          │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  TIMELINE                                                        │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  Start: Jan 15, 2026    End: Apr 15, 2026    90 days      │ │
│  │  [GANTT OVERVIEW]                                          │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  ─────────────────────────────────────────────────────────────  │
│  Generated by Rehab Estimator Pro | www.rehabestimator.com     │
│                                                                  │
└────────────────────────────────────────────────────────────────┘
```

### 2. Detailed Scope of Work

**Audience**: Contractors, Subcontractors  
**Format**: PDF (5-15 pages)

```
┌────────────────────────────────────────────────────────────────┐
│                                                                  │
│  SCOPE OF WORK                                                   │
│  1234 Oak Street, Minneapolis, MN 55401                         │
│                                                                  │
│  SECTION 1: KITCHEN                                              │
│  ════════════════════════════════════════════════════════════   │
│                                                                  │
│  1.1 Demolition                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ □ Remove existing cabinets (upper and lower)               │ │
│  │ □ Remove countertops and backsplash                        │ │
│  │ □ Remove flooring (vinyl, approx 150 sqft)                 │ │
│  │ □ Remove appliances (to be disposed)                       │ │
│  │                                                            │ │
│  │ Notes: Haul to dumpster on-site. Dumpster provided.       │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  1.2 Cabinetry                                                   │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ □ Install new base cabinets (12 linear ft)                 │ │
│  │   - Style: Shaker, White                                   │ │
│  │   - Brand: Hampton Bay or equivalent                       │ │
│  │ □ Install new upper cabinets (10 linear ft)                │ │
│  │ □ Install pantry cabinet (24" wide)                        │ │
│  │                                                            │ │
│  │ Materials: Provided by owner                               │ │
│  │ Labor Estimate: 16 hours                                   │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  1.3 Countertops                                                 │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ □ Template and install quartz countertops                  │ │
│  │   - Color: White/gray veining                              │ │
│  │   - Edge: Eased                                            │ │
│  │   - Area: ~35 sqft including island                        │ │
│  │ □ Cut and install sink opening (undermount)                │ │
│  │ □ Install backsplash (subway tile, 20 sqft)                │ │
│  │                                                            │ │
│  │ Materials: Owner provides countertops, contractor tile     │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  ... [Additional sections] ...                                   │
│                                                                  │
│  APPENDIX A: MATERIAL SPECIFICATIONS                             │
│  APPENDIX B: PHOTOS OF CURRENT CONDITION                         │
│  APPENDIX C: TIMELINE REQUIREMENTS                               │
│                                                                  │
└────────────────────────────────────────────────────────────────┘
```

### 3. Budget & Draw Schedule

**Audience**: Lenders, Accounting  
**Format**: PDF + Excel

```
┌────────────────────────────────────────────────────────────────┐
│                                                                  │
│  RENOVATION BUDGET & DRAW SCHEDULE                               │
│  1234 Oak Street | Total Budget: $52,450                        │
│                                                                  │
│  BUDGET BREAKDOWN                                                │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ Category        │ Labor    │ Materials│ Total   │ %     │   │
│  ├──────────────────────────────────────────────────────────┤   │
│  │ Kitchen         │ $8,500   │ $10,000  │ $18,500 │ 35%   │   │
│  │ Bathroom (Main) │ $5,200   │ $7,000   │ $12,200 │ 23%   │   │
│  │ Exterior        │ $4,250   │ $4,500   │ $8,750  │ 17%   │   │
│  │ HVAC            │ $3,500   │ $3,500   │ $7,000  │ 13%   │   │
│  │ Flooring        │ $2,000   │ $4,000   │ $6,000  │ 12%   │   │
│  ├──────────────────────────────────────────────────────────┤   │
│  │ TOTAL           │ $23,450  │ $29,000  │ $52,450 │ 100%  │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  DRAW SCHEDULE                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ Draw │ Phase           │ Amount   │ Cumulative │ Status  │   │
│  ├──────────────────────────────────────────────────────────┤   │
│  │ 1    │ Demo Complete   │ $5,245   │ $5,245     │ Pending │   │
│  │ 2    │ Rough-In Done   │ $15,735  │ $20,980    │ Pending │   │
│  │ 3    │ Drywall Done    │ $10,490  │ $31,470    │ Pending │   │
│  │ 4    │ Finishes 50%    │ $10,490  │ $41,960    │ Pending │   │
│  │ 5    │ Final/Punch     │ $10,490  │ $52,450    │ Pending │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  CONTINGENCY: $7,868 (15% reserved, not included above)         │
│                                                                  │
└────────────────────────────────────────────────────────────────┘
```

### 4. ROI Analysis Report

**Audience**: Partners, Investors, Lenders  
**Format**: PDF (3-5 pages)

```
┌────────────────────────────────────────────────────────────────┐
│                                                                  │
│  INVESTMENT ANALYSIS REPORT                                      │
│  1234 Oak Street, Minneapolis, MN 55401                         │
│                                                                  │
│  SCENARIO COMPARISON                                             │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │         │ Conservative │ Realistic  │ Optimistic │         │ │
│  │         │ (25% prob)   │ (50% prob) │ (25% prob) │         │ │
│  ├─────────┼──────────────┼────────────┼────────────┼─────────┤ │
│  │ ARV     │ $292,500     │ $325,000   │ $341,250   │         │ │
│  │ Costs   │ +20%         │ Base       │ -5%        │         │ │
│  │ Time    │ +2 months    │ 6 months   │ 5 months   │         │ │
│  ├─────────┼──────────────┼────────────┼────────────┼─────────┤ │
│  │ Profit  │ $21,850      │ $53,350    │ $68,425    │         │ │
│  │ ROI     │ 8.9%         │ 21.7%      │ 27.8%      │         │ │
│  └─────────┴──────────────┴────────────┴────────────┴─────────┘ │
│                                                                  │
│  WEIGHTED EXPECTED OUTCOME                                       │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                                                            │ │
│  │   Expected Net Profit: $49,244                             │ │
│  │   Expected ROI: 20.0%                                      │ │
│  │   Probability of Loss: 0%                                  │ │
│  │                                                            │ │
│  │   [PROFIT RANGE VISUALIZATION]                             │ │
│  │   ────|═════════════════════════|────                     │ │
│  │   $21,850              $53,350              $68,425        │ │
│  │   Conservative         Expected           Optimistic       │ │
│  │                                                            │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  70% RULE ANALYSIS                                               │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                                                            │ │
│  │   Maximum Allowable Offer: $175,050                        │ │
│  │   Your Purchase Price:     $185,000                        │ │
│  │   Status: ⚠️ ABOVE 70% RULE                                │ │
│  │                                                            │ │
│  │   However, the deal still works because:                   │ │
│  │   • Strong ARV comps in the area                          │ │
│  │   • Below-market renovation costs                          │ │
│  │   • Quick 90-day timeline reduces holding costs            │ │
│  │                                                            │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  CASH FLOW PROJECTION                                            │
│  [LINE CHART: Monthly cash flow over holding period]            │
│                                                                  │
└────────────────────────────────────────────────────────────────┘
```

---

## 📄 PDF Generation

### Technology Stack

| Component | Technology | Reason |
|-----------|------------|--------|
| PDF Engine | **@react-pdf/renderer** | React-native PDF creation |
| Charts | **Recharts** → **SVG** | Convert to static SVG for PDF |
| Server | **Next.js API Route** | Server-side generation |
| Storage | **Supabase Storage** | Temporary file hosting |

### PDF Document Structure

```tsx
// src/lib/pdf/executive-summary.tsx

import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
  Font,
} from '@react-pdf/renderer';
import type { ProjectExportData } from '@/types/export';

// Register custom fonts
Font.register({
  family: 'Inter',
  fonts: [
    { src: '/fonts/Inter-Regular.ttf', fontWeight: 'normal' },
    { src: '/fonts/Inter-Bold.ttf', fontWeight: 'bold' },
    { src: '/fonts/Inter-SemiBold.ttf', fontWeight: 600 },
  ],
});

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Inter',
    fontSize: 10,
    color: '#1a1a1a',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 2,
    borderBottomColor: '#3b82f6',
  },
  logo: {
    width: 150,
    height: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    color: '#666',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#3b82f6',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  table: {
    width: '100%',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    paddingVertical: 6,
  },
  tableHeader: {
    backgroundColor: '#f3f4f6',
    fontWeight: 'bold',
  },
  tableCell: {
    flex: 1,
    paddingHorizontal: 4,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  metricCard: {
    width: '48%',
    padding: 12,
    backgroundColor: '#f8fafc',
    borderRadius: 4,
  },
  metricLabel: {
    fontSize: 9,
    color: '#666',
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: 'center',
    fontSize: 8,
    color: '#999',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 10,
  },
});

interface ExecutiveSummaryProps {
  data: ProjectExportData;
}

export function ExecutiveSummaryPDF({ data }: ExecutiveSummaryProps) {
  const { project, analysis, scope, timeline } = data;
  
  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Executive Summary</Text>
            <Text style={styles.subtitle}>{project.address}</Text>
            <Text style={styles.subtitle}>
              Prepared: {new Date().toLocaleDateString()}
            </Text>
          </View>
          <Image 
            src="/images/logo-pdf.png" 
            style={styles.logo} 
          />
        </View>
        
        {/* Property Overview */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Property Overview</Text>
          <View style={styles.metricsGrid}>
            <MetricCard label="Property Type" value={project.propertyType} />
            <MetricCard label="Square Feet" value={project.squareFeet.toLocaleString()} />
            <MetricCard label="Bedrooms" value={project.bedrooms.toString()} />
            <MetricCard label="Bathrooms" value={project.bathrooms.toString()} />
            <MetricCard label="Year Built" value={project.yearBuilt.toString()} />
            <MetricCard label="Lot Size" value={project.lotSize || 'N/A'} />
          </View>
        </View>
        
        {/* Investment Analysis */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Investment Analysis</Text>
          <View style={styles.table}>
            <TableRow 
              label="Purchase Price" 
              value={`$${project.purchasePrice.toLocaleString()}`}
            />
            <TableRow 
              label="Renovation Budget" 
              value={`$${scope.totalCost.toLocaleString()}`}
            />
            <TableRow 
              label="Holding Costs" 
              value={`$${analysis.holdingCosts.toLocaleString()}`}
            />
            <TableRow 
              label="Total Investment" 
              value={`$${analysis.totalInvestment.toLocaleString()}`}
              bold
            />
            <View style={{ height: 10 }} />
            <TableRow 
              label="After Repair Value" 
              value={`$${project.arv.toLocaleString()}`}
            />
            <TableRow 
              label="Selling Costs" 
              value={`$${analysis.sellingCosts.toLocaleString()}`}
            />
            <TableRow 
              label="Net Profit" 
              value={`$${analysis.netProfit.toLocaleString()}`}
              bold
              highlight
            />
          </View>
          
          <View style={[styles.metricsGrid, { marginTop: 15 }]}>
            <MetricCard 
              label="Return on Investment" 
              value={`${analysis.roi.toFixed(1)}%`}
              highlight
            />
            <MetricCard 
              label="Annualized ROI" 
              value={`${analysis.annualizedROI.toFixed(1)}%`}
            />
          </View>
        </View>
        
        {/* Scope Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Renovation Scope Summary</Text>
          <View style={styles.table}>
            <View style={[styles.tableRow, styles.tableHeader]}>
              <Text style={[styles.tableCell, { flex: 2 }]}>Category</Text>
              <Text style={styles.tableCell}>Items</Text>
              <Text style={styles.tableCell}>Amount</Text>
              <Text style={styles.tableCell}>%</Text>
            </View>
            {scope.byCategory.map((cat) => (
              <View key={cat.name} style={styles.tableRow}>
                <Text style={[styles.tableCell, { flex: 2 }]}>{cat.name}</Text>
                <Text style={styles.tableCell}>{cat.itemCount}</Text>
                <Text style={styles.tableCell}>
                  ${cat.total.toLocaleString()}
                </Text>
                <Text style={styles.tableCell}>
                  {((cat.total / scope.totalCost) * 100).toFixed(0)}%
                </Text>
              </View>
            ))}
          </View>
        </View>
        
        {/* Timeline */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Project Timeline</Text>
          <View style={styles.metricsGrid}>
            <MetricCard label="Start Date" value={timeline.startDate} />
            <MetricCard label="End Date" value={timeline.endDate} />
            <MetricCard label="Duration" value={`${timeline.totalDays} days`} />
            <MetricCard label="Phases" value={timeline.phases.length.toString()} />
          </View>
        </View>
        
        {/* Footer */}
        <Text style={styles.footer}>
          Generated by Rehab Estimator Pro | www.rehabestimator.com | 
          Confidential - For intended recipient only
        </Text>
      </Page>
    </Document>
  );
}

function MetricCard({ 
  label, 
  value, 
  highlight = false 
}: { 
  label: string; 
  value: string; 
  highlight?: boolean;
}) {
  return (
    <View style={[
      styles.metricCard,
      highlight && { backgroundColor: '#dbeafe', borderColor: '#3b82f6', borderWidth: 1 }
    ]}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={[styles.metricValue, highlight && { color: '#1d4ed8' }]}>
        {value}
      </Text>
    </View>
  );
}

function TableRow({ 
  label, 
  value, 
  bold = false,
  highlight = false,
}: {
  label: string;
  value: string;
  bold?: boolean;
  highlight?: boolean;
}) {
  return (
    <View style={[
      styles.tableRow,
      highlight && { backgroundColor: '#dcfce7' }
    ]}>
      <Text style={[
        styles.tableCell, 
        { flex: 2 },
        bold && { fontWeight: 'bold' }
      ]}>
        {label}
      </Text>
      <Text style={[
        styles.tableCell,
        bold && { fontWeight: 'bold' }
      ]}>
        {value}
      </Text>
    </View>
  );
}
```

### Chart Generation for PDF

```tsx
// src/lib/pdf/chart-utils.tsx

import { renderToStaticMarkup } from 'react-dom/server';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis } from 'recharts';

// Convert Recharts to SVG string for PDF embedding
export function renderChartToSvg(
  ChartComponent: React.ReactNode,
  width: number,
  height: number
): string {
  const markup = renderToStaticMarkup(
    <svg width={width} height={height}>
      {ChartComponent}
    </svg>
  );
  return `data:image/svg+xml;base64,${btoa(markup)}`;
}

export function generateCostBreakdownChart(
  data: { name: string; value: number }[]
): string {
  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
  
  const chart = (
    <PieChart width={200} height={200}>
      <Pie
        data={data}
        cx={100}
        cy={100}
        innerRadius={40}
        outerRadius={80}
        dataKey="value"
      >
        {data.map((entry, index) => (
          <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
        ))}
      </Pie>
    </PieChart>
  );
  
  return renderChartToSvg(chart, 200, 200);
}
```

---

## 📊 Excel Export

### Export Structure

```typescript
// src/lib/export/excel-generator.ts

import ExcelJS from 'exceljs';
import type { ProjectExportData } from '@/types/export';

export async function generateProjectExcel(
  data: ProjectExportData
): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Rehab Estimator Pro';
  workbook.created = new Date();
  
  // ═══════════════════════════════════════════════════════════════
  // SHEET 1: Summary
  // ═══════════════════════════════════════════════════════════════
  
  const summarySheet = workbook.addWorksheet('Summary', {
    properties: { tabColor: { argb: '3B82F6' } },
  });
  
  // Header
  summarySheet.mergeCells('A1:D1');
  summarySheet.getCell('A1').value = 'Project Summary';
  summarySheet.getCell('A1').font = { size: 16, bold: true };
  
  // Property info
  summarySheet.getCell('A3').value = 'Property Address';
  summarySheet.getCell('B3').value = data.project.address;
  summarySheet.getCell('A4').value = 'Property Type';
  summarySheet.getCell('B4').value = data.project.propertyType;
  // ... more fields
  
  // Financial summary
  summarySheet.getCell('A10').value = 'Financial Summary';
  summarySheet.getCell('A10').font = { bold: true };
  
  const financialData = [
    ['Purchase Price', data.project.purchasePrice],
    ['Renovation Budget', data.scope.totalCost],
    ['Holding Costs', data.analysis.holdingCosts],
    ['Total Investment', data.analysis.totalInvestment],
    ['After Repair Value', data.project.arv],
    ['Selling Costs', data.analysis.sellingCosts],
    ['Net Profit', data.analysis.netProfit],
    ['ROI', `${data.analysis.roi.toFixed(1)}%`],
  ];
  
  financialData.forEach((row, index) => {
    summarySheet.getCell(`A${12 + index}`).value = row[0];
    summarySheet.getCell(`B${12 + index}`).value = row[1];
    if (typeof row[1] === 'number') {
      summarySheet.getCell(`B${12 + index}`).numFmt = '"$"#,##0.00';
    }
  });
  
  // ═══════════════════════════════════════════════════════════════
  // SHEET 2: Scope Items
  // ═══════════════════════════════════════════════════════════════
  
  const scopeSheet = workbook.addWorksheet('Scope Items', {
    properties: { tabColor: { argb: '10B981' } },
  });
  
  // Headers
  const scopeHeaders = [
    'Item #',
    'Room',
    'Category',
    'Description',
    'Qty',
    'Unit',
    'Unit Price',
    'Total',
    'Priority',
    'Phase',
    'Notes',
  ];
  
  scopeSheet.addRow(scopeHeaders);
  scopeSheet.getRow(1).font = { bold: true };
  scopeSheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'E5E7EB' },
  };
  
  // Data rows
  data.scope.items.forEach((item, index) => {
    scopeSheet.addRow([
      index + 1,
      item.room,
      item.category,
      item.description,
      item.quantity,
      item.unit,
      item.unitPrice,
      item.totalPrice,
      item.priority,
      item.phase,
      item.notes || '',
    ]);
  });
  
  // Format currency columns
  ['G', 'H'].forEach((col) => {
    scopeSheet.getColumn(col).numFmt = '"$"#,##0.00';
  });
  
  // Auto-fit columns
  scopeSheet.columns.forEach((column) => {
    column.width = 15;
  });
  
  // ═══════════════════════════════════════════════════════════════
  // SHEET 3: Budget by Category
  // ═══════════════════════════════════════════════════════════════
  
  const budgetSheet = workbook.addWorksheet('Budget', {
    properties: { tabColor: { argb: 'F59E0B' } },
  });
  
  budgetSheet.addRow(['Category', 'Labor', 'Materials', 'Total', '%']);
  budgetSheet.getRow(1).font = { bold: true };
  
  data.scope.byCategory.forEach((cat) => {
    budgetSheet.addRow([
      cat.name,
      cat.labor,
      cat.materials,
      cat.total,
      cat.total / data.scope.totalCost,
    ]);
  });
  
  // Totals row
  const totalRow = budgetSheet.addRow([
    'TOTAL',
    data.scope.totalLabor,
    data.scope.totalMaterials,
    data.scope.totalCost,
    1,
  ]);
  totalRow.font = { bold: true };
  
  // Format
  ['B', 'C', 'D'].forEach((col) => {
    budgetSheet.getColumn(col).numFmt = '"$"#,##0.00';
  });
  budgetSheet.getColumn('E').numFmt = '0%';
  
  // ═══════════════════════════════════════════════════════════════
  // SHEET 4: Timeline
  // ═══════════════════════════════════════════════════════════════
  
  const timelineSheet = workbook.addWorksheet('Timeline', {
    properties: { tabColor: { argb: 'EF4444' } },
  });
  
  timelineSheet.addRow(['Phase', 'Start Date', 'End Date', 'Duration', 'Status']);
  timelineSheet.getRow(1).font = { bold: true };
  
  data.timeline.phases.forEach((phase) => {
    timelineSheet.addRow([
      phase.name,
      phase.startDate,
      phase.endDate,
      `${phase.durationDays} days`,
      phase.status,
    ]);
  });
  
  // ═══════════════════════════════════════════════════════════════
  // SHEET 5: ROI Scenarios
  // ═══════════════════════════════════════════════════════════════
  
  const roiSheet = workbook.addWorksheet('ROI Analysis', {
    properties: { tabColor: { argb: '8B5CF6' } },
  });
  
  roiSheet.addRow(['Scenario', 'ARV', 'Costs', 'Profit', 'ROI', 'Probability']);
  roiSheet.getRow(1).font = { bold: true };
  
  data.analysis.scenarios.forEach((scenario) => {
    roiSheet.addRow([
      scenario.name,
      scenario.arv,
      scenario.totalCosts,
      scenario.profit,
      scenario.roi,
      scenario.probability,
    ]);
  });
  
  // Format
  ['B', 'C', 'D'].forEach((col) => {
    roiSheet.getColumn(col).numFmt = '"$"#,##0.00';
  });
  roiSheet.getColumn('E').numFmt = '0.0%';
  roiSheet.getColumn('F').numFmt = '0%';
  
  // Generate buffer
  return await workbook.xlsx.writeBuffer() as Buffer;
}
```

---

## 🔌 API Design

### Export Endpoints

```typescript
// src/app/api/export/pdf/[type]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { renderToBuffer } from '@react-pdf/renderer';
import { ExecutiveSummaryPDF } from '@/lib/pdf/executive-summary';
import { ScopeOfWorkPDF } from '@/lib/pdf/scope-of-work';
import { BudgetSchedulePDF } from '@/lib/pdf/budget-schedule';
import { ROIAnalysisPDF } from '@/lib/pdf/roi-analysis';

type ReportType = 'executive-summary' | 'scope-of-work' | 'budget' | 'roi-analysis';

export async function GET(
  request: NextRequest,
  { params }: { params: { type: ReportType } }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get('projectId');
  
  if (!projectId) {
    return NextResponse.json({ error: 'Project ID required' }, { status: 400 });
  }
  
  // Fetch project data
  const exportData = await getProjectExportData(projectId, user.id);
  
  if (!exportData) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 });
  }
  
  // Generate PDF based on type
  let pdfDocument;
  let filename;
  
  switch (params.type) {
    case 'executive-summary':
      pdfDocument = <ExecutiveSummaryPDF data={exportData} />;
      filename = `${exportData.project.projectName}-Executive-Summary.pdf`;
      break;
    case 'scope-of-work':
      pdfDocument = <ScopeOfWorkPDF data={exportData} />;
      filename = `${exportData.project.projectName}-Scope-of-Work.pdf`;
      break;
    case 'budget':
      pdfDocument = <BudgetSchedulePDF data={exportData} />;
      filename = `${exportData.project.projectName}-Budget.pdf`;
      break;
    case 'roi-analysis':
      pdfDocument = <ROIAnalysisPDF data={exportData} />;
      filename = `${exportData.project.projectName}-ROI-Analysis.pdf`;
      break;
    default:
      return NextResponse.json({ error: 'Invalid report type' }, { status: 400 });
  }
  
  // Render PDF
  const pdfBuffer = await renderToBuffer(pdfDocument);
  
  // Return PDF
  return new NextResponse(pdfBuffer, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  });
}
```

```typescript
// src/app/api/export/excel/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateProjectExcel } from '@/lib/export/excel-generator';

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get('projectId');
  
  if (!projectId) {
    return NextResponse.json({ error: 'Project ID required' }, { status: 400 });
  }
  
  const exportData = await getProjectExportData(projectId, user.id);
  
  if (!exportData) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 });
  }
  
  const excelBuffer = await generateProjectExcel(exportData);
  const filename = `${exportData.project.projectName}-Full-Export.xlsx`;
  
  return new NextResponse(excelBuffer, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  });
}
```

---

## 🧩 Component Architecture

### File Structure

```
src/
├── lib/
│   ├── pdf/
│   │   ├── index.ts                # Barrel export
│   │   ├── executive-summary.tsx   # Executive summary PDF
│   │   ├── scope-of-work.tsx       # Detailed SOW PDF
│   │   ├── budget-schedule.tsx     # Budget & draws PDF
│   │   ├── roi-analysis.tsx        # ROI report PDF
│   │   ├── chart-utils.tsx         # Chart to SVG helpers
│   │   └── styles.ts               # Shared PDF styles
│   │
│   └── export/
│       ├── index.ts                # Barrel export
│       ├── excel-generator.ts      # Excel generation
│       ├── csv-generator.ts        # CSV generation
│       └── data-fetcher.ts         # Prepare export data
│
├── components/
│   └── export/
│       ├── ExportMenu.tsx          # Export dropdown menu
│       ├── ExportDialog.tsx        # Options dialog
│       ├── ReportPreview.tsx       # PDF preview modal
│       └── ExportProgress.tsx      # Generation progress
│
├── hooks/
│   └── use-export.ts               # Export generation hook
│
└── app/
    └── api/
        └── export/
            ├── pdf/
            │   └── [type]/route.ts # PDF generation
            ├── excel/
            │   └── route.ts        # Excel generation
            └── csv/
                └── route.ts        # CSV generation
```

### Export Menu Component

```tsx
// src/components/export/ExportMenu.tsx

'use client';

import { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { 
  IconDownload, 
  IconFileTypePdf,
  IconFileSpreadsheet,
  IconFileTypeCsv,
  IconPresentation,
} from '@tabler/icons-react';
import { useExport } from '@/hooks/use-export';
import { toast } from 'sonner';

interface ExportMenuProps {
  projectId: string;
}

export function ExportMenu({ projectId }: ExportMenuProps) {
  const { exportPdf, exportExcel, isExporting } = useExport();
  
  const handleExport = async (type: string) => {
    try {
      switch (type) {
        case 'executive-summary':
        case 'scope-of-work':
        case 'budget':
        case 'roi-analysis':
          await exportPdf(projectId, type);
          break;
        case 'excel':
          await exportExcel(projectId);
          break;
      }
      toast.success('Export downloaded successfully');
    } catch (error) {
      toast.error('Export failed. Please try again.');
    }
  };
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" disabled={isExporting}>
          <IconDownload className="h-4 w-4 mr-2" />
          {isExporting ? 'Exporting...' : 'Export'}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>PDF Reports</DropdownMenuLabel>
        <DropdownMenuItem onClick={() => handleExport('executive-summary')}>
          <IconFileTypePdf className="h-4 w-4 mr-2" />
          Executive Summary
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport('scope-of-work')}>
          <IconFileTypePdf className="h-4 w-4 mr-2" />
          Scope of Work
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport('budget')}>
          <IconFileTypePdf className="h-4 w-4 mr-2" />
          Budget & Draw Schedule
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport('roi-analysis')}>
          <IconFileTypePdf className="h-4 w-4 mr-2" />
          ROI Analysis
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuLabel>Spreadsheets</DropdownMenuLabel>
        <DropdownMenuItem onClick={() => handleExport('excel')}>
          <IconFileSpreadsheet className="h-4 w-4 mr-2" />
          Full Excel Export
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
```

---

## 📅 Implementation Plan

### Phase 1: Core PDF Engine (3 days)

| Task | Description | Est. |
|------|-------------|------|
| Setup @react-pdf/renderer | Install and configure | 2h |
| PDF styles system | Shared styles and fonts | 3h |
| Executive Summary PDF | First report template | 6h |
| API route for PDF | Server-side generation | 3h |

### Phase 2: Additional PDF Reports (3 days)

| Task | Description | Est. |
|------|-------------|------|
| Scope of Work PDF | Detailed SOW report | 5h |
| Budget Schedule PDF | Budget and draws | 4h |
| ROI Analysis PDF | Scenarios and charts | 5h |
| Chart to SVG conversion | Embed charts in PDF | 3h |

### Phase 3: Excel Export (2 days)

| Task | Description | Est. |
|------|-------------|------|
| Setup ExcelJS | Install and configure | 1h |
| Excel generator | Multi-sheet workbook | 6h |
| Formatting and styling | Professional appearance | 3h |
| API route for Excel | Server-side generation | 2h |

### Phase 4: UI Components (2 days)

| Task | Description | Est. |
|------|-------------|------|
| ExportMenu component | Dropdown with options | 2h |
| ExportDialog | Options configuration | 3h |
| ReportPreview modal | PDF preview | 4h |
| Export progress indicator | Loading states | 2h |

**Total Estimated Time: 10-12 days**

---

## 📊 Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Export usage | > 50% of active projects | Track downloads |
| PDF generation time | < 5 seconds | API response time |
| Export completion rate | > 95% | Error tracking |
| User satisfaction | > 4.5/5 | Survey feedback |

---

## 🔗 Related Documentation

- [ROI Calculator Spec](./ROI_CALCULATOR_SPEC.md)
- [Contractor Management Spec](./CONTRACTOR_MANAGEMENT_SPEC.md)
- [PRD - Reporting & Export](../PRD.md#7-final-review-module)
