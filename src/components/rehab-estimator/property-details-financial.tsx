import { DollarSign, Calculator, TrendingUp, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

interface FinancialSectionProps {
  purchasePrice: number
  onPurchasePriceChange: (value: number) => void
}

export function FinancialSection({ purchasePrice, onPurchasePriceChange }: FinancialSectionProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-primary" />
          <CardTitle>Purchase Information</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Purchase Price Only */}
        <div>
          <Label>Purchase Price</Label>
          <div className="relative mt-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              $
            </span>
            <Input 
              type="text"
              inputMode="numeric"
              placeholder="0"
              className="pl-8 text-lg font-semibold"
              value={purchasePrice ? purchasePrice.toLocaleString() : ''}
              onChange={(e) => {
                // Remove non-numeric characters and format
                const value = e.target.value.replace(/[^0-9]/g, '')
                onPurchasePriceChange(value ? parseInt(value) : 0)
              }}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            The agreed purchase price for the property
          </p>
        </div>

        {/* What we'll calculate later */}
        <Separator />
        
        <div className="space-y-3">
          <p className="text-sm font-medium text-gray-700">
            We'll Calculate For You:
          </p>
          
          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs text-gray-600">1</span>
              </div>
              <div>
                <p className="text-sm font-medium">Rehab Costs</p>
                <p className="text-xs text-muted-foreground">
                  Based on your property assessment and scope
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-2">
              <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs text-gray-600">2</span>
              </div>
              <div>
                <p className="text-sm font-medium">After Repair Value (ARV)</p>
                <p className="text-xs text-muted-foreground">
                  Using comps and your renovation scope
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-2">
              <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs text-gray-600">3</span>
              </div>
              <div>
                <p className="text-sm font-medium">ROI & Profit Projections</p>
                <p className="text-xs text-muted-foreground">
                  Your expected returns based on strategy
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Analysis if they have purchase price */}
        {purchasePrice > 0 && (
          <>
            <Separator />
            <Alert>
              <TrendingUp className="w-4 h-4" />
              <AlertDescription>
                <strong>Next Steps:</strong> We'll assess the property condition to estimate repair costs, 
                then calculate your potential ARV based on the improvements.
              </AlertDescription>
            </Alert>
          </>
        )}
      </CardContent>
    </Card>
  )
}
