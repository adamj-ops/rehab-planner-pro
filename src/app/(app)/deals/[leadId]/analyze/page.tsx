export default function DealAnalysisPage({ params }: { params: { leadId: string } }) {
  return (
    <div className="space-y-6">
      <div className="p-8 rounded-lg border-2 border-dashed text-center">
        <h2 className="font-medium mb-2">Phase 4: Deal Analysis</h2>
        <p className="text-muted-foreground text-sm">
          ROI calculator, scenario analysis, and MAO calculation
        </p>
        <p className="text-xs text-muted-foreground mt-4">Lead ID: {params.leadId}</p>
      </div>
    </div>
  )
}
