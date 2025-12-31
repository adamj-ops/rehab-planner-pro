export default function ContractPage({ params }: { params: { leadId: string } }) {
  return (
    <div className="space-y-6">
      <div className="p-8 rounded-lg border-2 border-dashed text-center">
        <h2 className="font-medium mb-2">Phase 5: Contract</h2>
        <p className="text-muted-foreground text-sm">
          Contract milestones, pre-close checklist, and closing countdown
        </p>
        <p className="text-xs text-muted-foreground mt-4">Lead ID: {params.leadId}</p>
      </div>
    </div>
  )
}
