'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Target, TrendingUp, Clock, DollarSign } from 'lucide-react'

interface StrategySelectorProps {
  project: any
  onNext: (data: any) => void
  onBack: () => void
}

export function StrategySelector({ project, onNext, onBack }: StrategySelectorProps) {
  const [selectedStrategy, setSelectedStrategy] = useState(project.investmentStrategy || 'flip')

  const strategies = [
    {
      id: 'flip',
      name: 'Quick Flip',
      description: 'Buy, renovate, and sell within 3-6 months',
      icon: Target,
      pros: ['Fastest ROI', 'Lower holding costs', 'Market timing flexibility'],
      cons: ['Higher transaction costs', 'Tax implications', 'Market risk'],
      typicalROI: '15-25%',
      timeline: '3-6 months'
    },
    {
      id: 'rental',
      name: 'Long-term Rental',
      description: 'Renovate for rental income and appreciation',
      icon: TrendingUp,
      pros: ['Steady cash flow', 'Tax benefits', 'Appreciation'],
      cons: ['Longer timeline', 'Property management', 'Market cycles'],
      typicalROI: '8-15%',
      timeline: '5+ years'
    },
    {
      id: 'wholetail',
      name: 'Wholetail',
      description: 'Sell to other investors with minimal work',
      icon: Clock,
      pros: ['Fast exit', 'Lower risk', 'No renovation costs'],
      cons: ['Lower profit margins', 'Limited to investor market'],
      typicalROI: '5-15%',
      timeline: '1-3 months'
    },
    {
      id: 'airbnb',
      name: 'Short-term Rental',
      description: 'Optimize for high nightly rates and occupancy',
      icon: DollarSign,
      pros: ['Higher nightly rates', 'Flexibility', 'Tax advantages'],
      cons: ['Seasonal fluctuations', 'Regulatory changes', 'Management intensive'],
      typicalROI: '12-20%',
      timeline: '2-5 years'
    }
  ]

  const handleSubmit = () => {
    onNext({ investmentStrategy: selectedStrategy })
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2">Choose Your Investment Strategy</h2>
        <p className="text-muted-foreground">
          Select the strategy that best fits your goals, timeline, and risk tolerance
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {strategies.map((strategy) => {
          const Icon = strategy.icon
          const isSelected = selectedStrategy === strategy.id
          
          return (
            <Card 
              key={strategy.id}
              className={`cursor-pointer transition-all ${
                isSelected ? 'ring-2 ring-primary shadow-lg' : 'hover:shadow-md'
              }`}
              onClick={() => setSelectedStrategy(strategy.id)}
            >
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${
                    isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted'
                  }`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{strategy.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">{strategy.description}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span>Typical ROI:</span>
                  <Badge variant="secondary">{strategy.typicalROI}</Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Timeline:</span>
                  <Badge variant="outline">{strategy.timeline}</Badge>
                </div>
                
                <div>
                  <h4 className="font-medium text-sm mb-2 text-green-600">Pros:</h4>
                  <ul className="text-sm space-y-1">
                    {strategy.pros.map((pro, index) => (
                      <li key={index} className="flex items-center space-x-2">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                        <span>{pro}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-medium text-sm mb-2 text-red-600">Cons:</h4>
                  <ul className="text-sm space-y-1">
                    {strategy.cons.map((con, index) => (
                      <li key={index} className="flex items-center space-x-2">
                        <div className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                        <span>{con}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Submit Handler - Navigation is handled by parent component */}
      <div className="hidden">
        <Button onClick={handleSubmit} disabled={!selectedStrategy}>
          Continue to Scope Building
        </Button>
      </div>
    </div>
  )
}
