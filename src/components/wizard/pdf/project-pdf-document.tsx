"use client";

import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";
import { format } from "date-fns";

// Register fonts (using system fonts for compatibility)
Font.register({
  family: "Roboto",
  fonts: [
    {
      src: "https://fonts.gstatic.com/s/roboto/v30/KFOmCnqEu92Fr1Me5Q.ttf",
      fontWeight: 400,
    },
    {
      src: "https://fonts.gstatic.com/s/roboto/v30/KFOlCnqEu92Fr1MmWUlvAw.ttf",
      fontWeight: 700,
    },
  ],
});

// =============================================================================
// TYPES
// =============================================================================

export interface ProjectPDFData {
  projectName: string;
  address: {
    street: string;
    city: string;
    state: string;
    zip: string;
  };
  property: {
    type: string;
    sqft: number;
    yearBuilt: number;
    beds: number;
    baths: number;
  };
  strategy: {
    type: string;
    targetMarket: string;
    arv: number;
    maxBudget: number;
    targetRoi: number;
    contingency: number;
  };
  scopeItems: Array<{
    name: string;
    category: string;
    priority: string;
    cost: number;
    durationDays: number;
  }>;
  timeline: {
    startDate: Date | null;
    totalDays: number;
    phases: Array<{ name: string; days: number; itemCount: number }>;
  };
  totals: {
    baseCost: number;
    contingencyAmount: number;
    grandTotal: number;
  };
  generatedAt: Date;
}

// =============================================================================
// STYLES
// =============================================================================

const colors = {
  primary: "#2563eb",
  primaryLight: "#dbeafe",
  dark: "#1f2937",
  gray: "#6b7280",
  lightGray: "#f3f4f6",
  border: "#e5e7eb",
  white: "#ffffff",
  success: "#10b981",
  warning: "#f59e0b",
};

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: "Roboto",
    fontSize: 10,
    lineHeight: 1.5,
    backgroundColor: colors.white,
  },
  // Header
  header: {
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 700,
    color: colors.primary,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: colors.dark,
    fontWeight: 700,
    marginBottom: 2,
  },
  headerAddress: {
    fontSize: 11,
    color: colors.gray,
  },
  headerDate: {
    fontSize: 10,
    color: colors.gray,
    marginTop: 8,
  },
  // Section
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 700,
    color: colors.dark,
    marginBottom: 10,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  // Cards / Info Boxes
  infoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  infoBox: {
    width: "48%",
    padding: 10,
    backgroundColor: colors.lightGray,
    borderRadius: 4,
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 9,
    color: colors.gray,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 11,
    fontWeight: 700,
    color: colors.dark,
  },
  // Tables
  table: {
    width: "100%",
    marginTop: 8,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: colors.primary,
    padding: 8,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  tableHeaderCell: {
    color: colors.white,
    fontSize: 9,
    fontWeight: 700,
    textTransform: "uppercase",
  },
  tableRow: {
    flexDirection: "row",
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tableRowAlt: {
    backgroundColor: colors.lightGray,
  },
  tableCell: {
    fontSize: 9,
    color: colors.dark,
  },
  tableCellBold: {
    fontSize: 9,
    fontWeight: 700,
    color: colors.dark,
  },
  // Budget Summary
  budgetRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  budgetTotal: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 10,
    backgroundColor: colors.primary,
    borderRadius: 4,
    marginTop: 4,
  },
  budgetTotalLabel: {
    fontSize: 12,
    fontWeight: 700,
    color: colors.white,
  },
  budgetTotalValue: {
    fontSize: 12,
    fontWeight: 700,
    color: colors.white,
  },
  // Priority Badge
  priorityBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
    fontSize: 8,
    fontWeight: 700,
  },
  priorityMust: {
    backgroundColor: "#fef2f2",
    color: "#dc2626",
  },
  priorityShould: {
    backgroundColor: "#fffbeb",
    color: "#d97706",
  },
  priorityCould: {
    backgroundColor: "#f0fdf4",
    color: "#16a34a",
  },
  priorityNice: {
    backgroundColor: "#f0f9ff",
    color: "#0284c7",
  },
  // Summary Stats
  statsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  statBox: {
    flex: 1,
    padding: 12,
    backgroundColor: colors.lightGray,
    borderRadius: 4,
    alignItems: "center",
  },
  statValue: {
    fontSize: 18,
    fontWeight: 700,
    color: colors.primary,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 9,
    color: colors.gray,
    textAlign: "center",
  },
  // Footer
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 8,
    color: colors.gray,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 10,
  },
  pageNumber: {
    fontSize: 8,
    color: colors.gray,
  },
  // Timeline
  timelineRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  timelineBar: {
    height: 8,
    backgroundColor: colors.primary,
    borderRadius: 2,
    marginRight: 8,
  },
  timelineLabel: {
    fontSize: 9,
    color: colors.dark,
    flex: 1,
  },
  timelineDays: {
    fontSize: 9,
    color: colors.gray,
    width: 60,
    textAlign: "right",
  },
});

// =============================================================================
// HELPER COMPONENTS
// =============================================================================

function formatCurrency(amount: number): string {
  return `$${amount.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

function formatPropertyType(type: string): string {
  const typeMap: Record<string, string> = {
    single_family: "Single Family",
    multi_family: "Multi-Family",
    condo: "Condo",
    townhome: "Townhome",
  };
  return typeMap[type] || type.replace(/_/g, " ");
}

function formatStrategy(strategy: string): string {
  const strategyMap: Record<string, string> = {
    flip: "Fix & Flip",
    rental: "Buy & Hold Rental",
    wholetail: "Wholetail",
    airbnb: "Short-Term Rental (Airbnb)",
    personal_residence: "Personal Residence",
  };
  return strategyMap[strategy] || strategy.replace(/_/g, " ");
}

function formatTargetMarket(market: string): string {
  const marketMap: Record<string, string> = {
    first_time_buyer: "First-Time Buyer",
    move_up: "Move-Up Buyer",
    investor: "Investor",
    luxury: "Luxury",
    family: "Family",
  };
  return marketMap[market] || market.replace(/_/g, " ");
}

function formatPriority(priority: string): string {
  const priorityMap: Record<string, string> = {
    must: "Must Have",
    should: "Should Have",
    could: "Could Have",
    nice_to_have: "Nice to Have",
    nice: "Nice to Have",
  };
  return priorityMap[priority] || priority;
}

function getPriorityStyle(priority: string) {
  switch (priority) {
    case "must":
      return styles.priorityMust;
    case "should":
      return styles.priorityShould;
    case "could":
      return styles.priorityCould;
    case "nice_to_have":
    case "nice":
      return styles.priorityNice;
    default:
      return styles.priorityShould;
  }
}

// =============================================================================
// PDF DOCUMENT COMPONENT
// =============================================================================

interface ProjectPDFDocumentProps {
  data: ProjectPDFData;
}

export function ProjectPDFDocument({ data }: ProjectPDFDocumentProps) {
  const {
    projectName,
    address,
    property,
    strategy,
    scopeItems,
    timeline,
    totals,
    generatedAt,
  } = data;

  // Group scope items by category
  const itemsByCategory = scopeItems.reduce<Record<string, typeof scopeItems>>(
    (acc, item) => {
      const category = item.category || "Other";
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(item);
      return acc;
    },
    {}
  );

  // Calculate priority distribution
  const priorityCounts = scopeItems.reduce<Record<string, number>>(
    (acc, item) => {
      const priority = item.priority || "should";
      acc[priority] = (acc[priority] || 0) + 1;
      return acc;
    },
    {}
  );

  // Calculate max phase days for timeline bar widths
  const maxPhaseDays = Math.max(...timeline.phases.map((p) => p.days), 1);

  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Scope of Work</Text>
          <Text style={styles.headerSubtitle}>{projectName}</Text>
          <Text style={styles.headerAddress}>
            {address.street}, {address.city}, {address.state} {address.zip}
          </Text>
          <Text style={styles.headerDate}>
            Generated: {format(generatedAt, "MMMM d, yyyy 'at' h:mm a")}
          </Text>
        </View>

        {/* Summary Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{formatCurrency(totals.grandTotal)}</Text>
            <Text style={styles.statLabel}>Total Budget</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{timeline.totalDays}</Text>
            <Text style={styles.statLabel}>Days</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{scopeItems.length}</Text>
            <Text style={styles.statLabel}>Scope Items</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{formatCurrency(strategy.arv)}</Text>
            <Text style={styles.statLabel}>ARV</Text>
          </View>
        </View>

        {/* Property Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Property Details</Text>
          <View style={styles.infoGrid}>
            <View style={styles.infoBox}>
              <Text style={styles.infoLabel}>Property Type</Text>
              <Text style={styles.infoValue}>{formatPropertyType(property.type)}</Text>
            </View>
            <View style={styles.infoBox}>
              <Text style={styles.infoLabel}>Square Footage</Text>
              <Text style={styles.infoValue}>{property.sqft.toLocaleString()} sqft</Text>
            </View>
            <View style={styles.infoBox}>
              <Text style={styles.infoLabel}>Bedrooms / Bathrooms</Text>
              <Text style={styles.infoValue}>{property.beds} bed / {property.baths} bath</Text>
            </View>
            <View style={styles.infoBox}>
              <Text style={styles.infoLabel}>Year Built</Text>
              <Text style={styles.infoValue}>{property.yearBuilt}</Text>
            </View>
          </View>
        </View>

        {/* Investment Strategy */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Investment Strategy</Text>
          <View style={styles.infoGrid}>
            <View style={styles.infoBox}>
              <Text style={styles.infoLabel}>Strategy</Text>
              <Text style={styles.infoValue}>{formatStrategy(strategy.type)}</Text>
            </View>
            <View style={styles.infoBox}>
              <Text style={styles.infoLabel}>Target Market</Text>
              <Text style={styles.infoValue}>{formatTargetMarket(strategy.targetMarket)}</Text>
            </View>
            <View style={styles.infoBox}>
              <Text style={styles.infoLabel}>Target ROI</Text>
              <Text style={styles.infoValue}>{strategy.targetRoi}%</Text>
            </View>
            <View style={styles.infoBox}>
              <Text style={styles.infoLabel}>Max Budget</Text>
              <Text style={styles.infoValue}>{formatCurrency(strategy.maxBudget)}</Text>
            </View>
          </View>
        </View>

        {/* Timeline Overview */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Timeline Overview</Text>
          <View style={styles.infoGrid}>
            <View style={styles.infoBox}>
              <Text style={styles.infoLabel}>Start Date</Text>
              <Text style={styles.infoValue}>
                {timeline.startDate ? format(timeline.startDate, "MMM d, yyyy") : "TBD"}
              </Text>
            </View>
            <View style={styles.infoBox}>
              <Text style={styles.infoLabel}>Estimated Duration</Text>
              <Text style={styles.infoValue}>{timeline.totalDays} days</Text>
            </View>
          </View>
          {timeline.phases.length > 0 && (
            <View style={{ marginTop: 12 }}>
              {timeline.phases.map((phase) => (
                <View key={phase.name} style={styles.timelineRow}>
                  <View
                    style={[
                      styles.timelineBar,
                      { width: `${(phase.days / maxPhaseDays) * 40}%`, minWidth: 20 },
                    ]}
                  />
                  <Text style={styles.timelineLabel}>
                    {phase.name} ({phase.itemCount} items)
                  </Text>
                  <Text style={styles.timelineDays}>{phase.days} days</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text>Generated by Rehab Planner Pro</Text>
          <Text render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} />
        </View>
      </Page>

      {/* Page 2: Scope of Work Table */}
      <Page size="LETTER" style={styles.page}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Scope of Work</Text>

          {/* Priority Summary */}
          <View style={{ flexDirection: "row", gap: 12, marginBottom: 16 }}>
            {Object.entries(priorityCounts).map(([priority, count]) => (
              <View
                key={priority}
                style={[
                  styles.priorityBadge,
                  getPriorityStyle(priority),
                  { paddingHorizontal: 10, paddingVertical: 4 },
                ]}
              >
                <Text>
                  {formatPriority(priority)}: {count}
                </Text>
              </View>
            ))}
          </View>

          {/* Scope Items by Category */}
          {Object.entries(itemsByCategory).map(([category, items]) => {
            const categoryTotal = items.reduce((sum, item) => sum + item.cost, 0);
            return (
              <View key={category} style={{ marginBottom: 16 }}>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    backgroundColor: colors.lightGray,
                    padding: 8,
                    borderRadius: 4,
                    marginBottom: 4,
                  }}
                >
                  <Text style={{ fontSize: 11, fontWeight: 700, color: colors.dark }}>
                    {category}
                  </Text>
                  <Text style={{ fontSize: 11, fontWeight: 700, color: colors.primary }}>
                    {formatCurrency(categoryTotal)}
                  </Text>
                </View>

                {/* Table Header */}
                <View style={styles.tableHeader}>
                  <Text style={[styles.tableHeaderCell, { width: "45%" }]}>Item</Text>
                  <Text style={[styles.tableHeaderCell, { width: "20%" }]}>Priority</Text>
                  <Text style={[styles.tableHeaderCell, { width: "15%", textAlign: "right" }]}>
                    Days
                  </Text>
                  <Text style={[styles.tableHeaderCell, { width: "20%", textAlign: "right" }]}>
                    Cost
                  </Text>
                </View>

                {/* Table Rows */}
                {items.map((item, index) => (
                  <View
                    key={`${item.name}-${item.cost}`}
                    style={[styles.tableRow, index % 2 === 1 && styles.tableRowAlt]}
                  >
                    <Text style={[styles.tableCell, { width: "45%" }]}>{item.name}</Text>
                    <View style={{ width: "20%" }}>
                      <Text style={[styles.priorityBadge, getPriorityStyle(item.priority)]}>
                        {formatPriority(item.priority)}
                      </Text>
                    </View>
                    <Text style={[styles.tableCell, { width: "15%", textAlign: "right" }]}>
                      {item.durationDays}
                    </Text>
                    <Text style={[styles.tableCellBold, { width: "20%", textAlign: "right" }]}>
                      {formatCurrency(item.cost)}
                    </Text>
                  </View>
                ))}
              </View>
            );
          })}
        </View>

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text>Generated by Rehab Planner Pro</Text>
          <Text render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} />
        </View>
      </Page>

      {/* Page 3: Budget Breakdown */}
      <Page size="LETTER" style={styles.page}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Budget Breakdown</Text>

          {/* Category Totals */}
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderCell, { width: "60%" }]}>Category</Text>
              <Text style={[styles.tableHeaderCell, { width: "20%", textAlign: "center" }]}>
                Items
              </Text>
              <Text style={[styles.tableHeaderCell, { width: "20%", textAlign: "right" }]}>
                Cost
              </Text>
            </View>
            {Object.entries(itemsByCategory).map(([category, items], index) => {
              const categoryTotal = items.reduce((sum, item) => sum + item.cost, 0);
              return (
                <View
                  key={category}
                  style={[styles.tableRow, index % 2 === 1 && styles.tableRowAlt]}
                >
                  <Text style={[styles.tableCell, { width: "60%" }]}>{category}</Text>
                  <Text style={[styles.tableCell, { width: "20%", textAlign: "center" }]}>
                    {items.length}
                  </Text>
                  <Text style={[styles.tableCellBold, { width: "20%", textAlign: "right" }]}>
                    {formatCurrency(categoryTotal)}
                  </Text>
                </View>
              );
            })}
          </View>

          {/* Budget Summary */}
          <View style={{ marginTop: 24 }}>
            <View style={styles.budgetRow}>
              <Text style={{ fontSize: 11, color: colors.dark }}>Base Cost (Scope Items)</Text>
              <Text style={{ fontSize: 11, fontWeight: 700, color: colors.dark }}>
                {formatCurrency(totals.baseCost)}
              </Text>
            </View>
            <View style={styles.budgetRow}>
              <Text style={{ fontSize: 11, color: colors.dark }}>
                Contingency ({strategy.contingency}%)
              </Text>
              <Text style={{ fontSize: 11, fontWeight: 700, color: colors.dark }}>
                {formatCurrency(totals.contingencyAmount)}
              </Text>
            </View>
            <View style={styles.budgetTotal}>
              <Text style={styles.budgetTotalLabel}>Grand Total</Text>
              <Text style={styles.budgetTotalValue}>{formatCurrency(totals.grandTotal)}</Text>
            </View>
          </View>

          {/* Investment Analysis */}
          <View style={{ marginTop: 24 }}>
            <Text style={styles.sectionTitle}>Investment Analysis</Text>
            <View style={styles.infoGrid}>
              <View style={styles.infoBox}>
                <Text style={styles.infoLabel}>After Repair Value (ARV)</Text>
                <Text style={styles.infoValue}>{formatCurrency(strategy.arv)}</Text>
              </View>
              <View style={styles.infoBox}>
                <Text style={styles.infoLabel}>Total Rehab Budget</Text>
                <Text style={styles.infoValue}>{formatCurrency(totals.grandTotal)}</Text>
              </View>
              <View style={styles.infoBox}>
                <Text style={styles.infoLabel}>Budget vs ARV</Text>
                <Text style={styles.infoValue}>
                  {strategy.arv > 0
                    ? `${((totals.grandTotal / strategy.arv) * 100).toFixed(1)}%`
                    : "N/A"}
                </Text>
              </View>
              <View style={styles.infoBox}>
                <Text style={styles.infoLabel}>Target ROI</Text>
                <Text style={styles.infoValue}>{strategy.targetRoi}%</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Disclaimer */}
        <View style={{ marginTop: 24, padding: 12, backgroundColor: colors.lightGray, borderRadius: 4 }}>
          <Text style={{ fontSize: 9, color: colors.gray, fontStyle: "italic" }}>
            This Scope of Work is an estimate based on the information provided. Actual costs may
            vary based on site conditions, material availability, and contractor pricing. A
            contingency of {strategy.contingency}% has been included to account for unforeseen
            expenses.
          </Text>
        </View>

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text>Generated by Rehab Planner Pro</Text>
          <Text render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} />
        </View>
      </Page>
    </Document>
  );
}
