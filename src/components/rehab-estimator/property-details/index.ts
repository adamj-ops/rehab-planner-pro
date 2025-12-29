/**
 * Property Details Components
 * 
 * Barrel exports for the Property Details form components.
 */

// Property Type Selection
export { PropertyTypeSelector, propertyTypes } from './PropertyTypeSelector'
export type { PropertyTypeSelectorProps, PropertyTypeOption } from './PropertyTypeSelector'

// Property Specifications
export { PropertySpecsInputs, ButtonGroup, FormattedNumberInput } from './PropertySpecsInputs'
export type { PropertySpecsInputsProps, ButtonGroupProps, FormattedNumberInputProps } from './PropertySpecsInputs'

// Financial Inputs
export { FinancialInputs, CurrencyInput, PercentageSlider, ComputedValue } from './FinancialInputs'
export type { FinancialInputsProps, CurrencyInputProps, PercentageSliderProps } from './FinancialInputs'

// Financing Calculator
export { FinancingCalculator, LoanTypeToggle, MonthlyCostsInputs } from './FinancingCalculator'
export type { FinancingCalculatorProps, LoanTypeToggleProps, MonthlyCostsInputsProps } from './FinancingCalculator'

// Financial Timeline
export { FinancialTimeline, CashFlowChart, TimelineEventItem } from './FinancialTimeline'
export type { FinancialTimelineProps, CashFlowChartProps, TimelineEventProps } from './FinancialTimeline'

// Financing Summary
export { FinancingSummary, MetricCard, ROIGauge, DealAnalysisDisplay } from './FinancingSummary'
export type { FinancingSummaryProps, MetricCardProps, ROIGaugeProps, DealAnalysisDisplayProps } from './FinancingSummary'

// Save Status Indicator
export { SaveStatusIndicator, CompactSaveStatus, StatusIcon, formatLastSaved } from './SaveStatusIndicator'
export type { SaveStatusIndicatorProps, CompactSaveStatusProps, StatusIconProps } from './SaveStatusIndicator'
