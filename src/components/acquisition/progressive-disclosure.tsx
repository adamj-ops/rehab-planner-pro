'use client'

import { useState, useEffect, type ReactNode } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { IconCircleCheck, IconCircle, IconAlertCircle } from '@/lib/icons'
import { cn } from '@/lib/utils'

export interface DisclosureSection {
  id: string
  title: string
  required: boolean
  completed: boolean
  hasError?: boolean
  content: ReactNode
}

interface ProgressiveDisclosureProps {
  sections: DisclosureSection[]
  autoExpand?: boolean
  showProgress?: boolean
  className?: string
}

interface SectionHeaderProps {
  section: DisclosureSection
  isExpanded: boolean
  onToggle: () => void
  sectionNumber: number
}

function SectionHeader({ section, isExpanded, onToggle, sectionNumber }: SectionHeaderProps) {
  const getStatusIcon = () => {
    if (section.hasError) {
      return <IconAlertCircle className="h-5 w-5 text-destructive" />
    }
    if (section.completed) {
      return <IconCircleCheck className="h-5 w-5 text-emerald-500" />
    }
    return <IconCircle className="h-5 w-5 text-muted-foreground" />
  }
  
  return (
    <CardHeader className="pb-3">
      <Button
        variant="ghost"
        onClick={onToggle}
        className={cn(
          "w-full flex items-center justify-between p-0 h-auto hover:bg-transparent",
          "text-left font-medium"
        )}
      >
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground bg-muted rounded-full w-6 h-6 flex items-center justify-center">
              {sectionNumber}
            </span>
            {getStatusIcon()}
          </div>
          <span className={cn(
            "text-sm",
            section.completed && "text-foreground",
            section.hasError && "text-destructive",
            !section.completed && !section.hasError && "text-muted-foreground"
          )}>
            {section.title}
            {section.required && <span className="text-destructive ml-1">*</span>}
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          {section.completed && (
            <span className="text-xs text-emerald-600 font-medium">Complete</span>
          )}
          {section.hasError && (
            <span className="text-xs text-destructive font-medium">Needs attention</span>
          )}
          {isExpanded ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </div>
      </Button>
    </CardHeader>
  )
}

export function ProgressiveDisclosure({ 
  sections, 
  autoExpand = true, 
  showProgress = true,
  className 
}: ProgressiveDisclosureProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set())
  const [showAdvanced, setShowAdvanced] = useState(false)
  
  // Auto-expand logic
  useEffect(() => {
    if (!autoExpand) return
    
    const requiredSections = sections.filter(s => s.required)
    const optionalSections = sections.filter(s => !s.required)
    
    // Always expand first incomplete required section
    const firstIncomplete = requiredSections.find(s => !s.completed)
    if (firstIncomplete) {
      setExpandedSections(prev => new Set([...prev, firstIncomplete.id]))
    }
    
    // Auto-expand optional sections if all required are complete and user wants advanced
    if (requiredSections.every(s => s.completed) && showAdvanced) {
      const incompleteOptional = optionalSections.find(s => !s.completed)
      if (incompleteOptional) {
        setExpandedSections(prev => new Set([...prev, incompleteOptional.id]))
      }
    }
  }, [sections, autoExpand, showAdvanced])
  
  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev)
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId)
      } else {
        newSet.add(sectionId)
      }
      return newSet
    })
  }
  
  const completedCount = sections.filter(s => s.completed).length
  const requiredSections = sections.filter(s => s.required)
  const optionalSections = sections.filter(s => !s.required)
  const requiredCompleted = requiredSections.filter(s => s.completed).length
  
  return (
    <div className={className}>
      {/* Progress Header */}
      {showProgress && (
        <div className="mb-6 p-4 rounded-lg bg-muted/30 border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">ARV Analysis Progress</span>
            <span className="text-xs text-muted-foreground">
              {completedCount}/{sections.length} complete
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-500"
                style={{ width: `${(completedCount / sections.length) * 100}%` }}
              />
            </div>
            <span className="text-xs text-muted-foreground">
              {Math.round((completedCount / sections.length) * 100)}%
            </span>
          </div>
          
          {requiredCompleted === requiredSections.length && !showAdvanced && (
            <div className="mt-3 pt-3 border-t">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAdvanced(true)}
                className="w-full"
              >
                Show Advanced Options
              </Button>
            </div>
          )}
        </div>
      )}
      
      {/* Required Sections */}
      <div className="space-y-4">
        <div className="text-sm font-medium text-muted-foreground mb-2">Required</div>
        {requiredSections.map((section, index) => (
          <Card 
            key={section.id}
            className={cn(
              "transition-all duration-200",
              section.completed && "border-emerald-200 bg-emerald-50/30",
              section.hasError && "border-destructive bg-destructive/5"
            )}
          >
            <SectionHeader
              section={section}
              isExpanded={expandedSections.has(section.id)}
              onToggle={() => toggleSection(section.id)}
              sectionNumber={index + 1}
            />
            
            {expandedSections.has(section.id) && (
              <CardContent className="pt-0 pb-4">
                {section.content}
              </CardContent>
            )}
          </Card>
        ))}
      </div>
      
      {/* Optional Sections */}
      {(showAdvanced || optionalSections.some(s => s.completed)) && (
        <div className="space-y-4 mt-6">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium text-muted-foreground">Optional</div>
            {showAdvanced && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAdvanced(false)}
                className="text-xs"
              >
                Hide Advanced
              </Button>
            )}
          </div>
          
          {optionalSections.map((section, index) => (
            <Card key={section.id} className="transition-all duration-200">
              <SectionHeader
                section={section}
                isExpanded={expandedSections.has(section.id)}
                onToggle={() => toggleSection(section.id)}
                sectionNumber={requiredSections.length + index + 1}
              />
              
              {expandedSections.has(section.id) && (
                <CardContent className="pt-0 pb-4">
                  {section.content}
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}