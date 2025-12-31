'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { 
  IconDownload, 
  IconFileText, 
  IconCopy, 
  IconMail,
  IconLoader2
} from '@/lib/icons'
import type { ARVReportData } from '@/lib/export/arv-export-service'
import { 
  generateARVPDF, 
  copyARVToClipboard, 
  generateEmailLink 
} from '@/lib/export/arv-export-service'

export type ExportFormat = 'pdf' | 'clipboard' | 'email'

interface ExportMenuProps {
  reportData: ARVReportData
  disabled?: boolean
  className?: string
}

export function ExportMenu({ reportData, disabled = false, className }: ExportMenuProps) {
  const [isExporting, setIsExporting] = useState<ExportFormat | null>(null)

  const handleExport = async (format: ExportFormat) => {
    setIsExporting(format)
    
    try {
      switch (format) {
        case 'pdf': {
          const blob = await generateARVPDF(reportData)
          if (blob) {
            const url = URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.href = url
            link.download = `ARV-Analysis-${reportData.property.address.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            URL.revokeObjectURL(url)
          }
          break
        }
        
        case 'clipboard': {
          const success = await copyARVToClipboard(reportData)
          if (success) {
            // Could add toast notification here
            console.log('ARV summary copied to clipboard')
          }
          break
        }
        
        case 'email': {
          const emailLink = generateEmailLink(reportData)
          window.open(emailLink, '_blank')
          break
        }
      }
    } catch (error) {
      console.error(`Failed to export as ${format}:`, error)
    } finally {
      setIsExporting(null)
    }
  }

  const isLoading = isExporting !== null

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          disabled={disabled || isLoading}
          className={className}
        >
          {isLoading ? (
            <IconLoader2 className="h-4 w-4 mr-1 animate-spin" />
          ) : (
            <IconDownload className="h-4 w-4 mr-1" />
          )}
          {isLoading ? 'Exporting...' : 'Export'}
          <ChevronDown className="h-4 w-4 ml-1" />
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem 
          onClick={() => handleExport('pdf')}
          disabled={isLoading}
        >
          <IconFileText className="h-4 w-4 mr-2" />
          <div className="flex flex-col">
            <span>PDF Report</span>
            <span className="text-xs text-muted-foreground">Complete analysis</span>
          </div>
        </DropdownMenuItem>
        
        <DropdownMenuItem 
          onClick={() => handleExport('clipboard')}
          disabled={isLoading}
        >
          <IconCopy className="h-4 w-4 mr-2" />
          <div className="flex flex-col">
            <span>Copy Summary</span>
            <span className="text-xs text-muted-foreground">Text format</span>
          </div>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem 
          onClick={() => handleExport('email')}
          disabled={isLoading}
        >
          <IconMail className="h-4 w-4 mr-2" />
          <div className="flex flex-col">
            <span>Email Report</span>
            <span className="text-xs text-muted-foreground">Open email client</span>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}