export default function OfferStrategyPage({ params }: { params: { leadId: string } }) {
  return (
    <div className="space-y-6">
      <div className="p-8 rounded-lg border-2 border-dashed text-center">
        <h2 className="font-medium mb-2">Phase 4b: Offer Strategy</h2>
        <p className="text-muted-foreground text-sm">
          Offer builder, negotiation tracking, and counter management
        </p>
        <p className="text-xs text-muted-foreground mt-4">Lead ID: {params.leadId}</p>
      </div>
    </div>
  )
}
