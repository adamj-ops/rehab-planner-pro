'use client'

import { memo } from 'react'
import { Handle, Position, NodeProps } from '@xyflow/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { 
  User, 
  Briefcase, 
  DollarSign, 
  Phone,
  Mail,
  CheckCircle2,
  Clock,
  XCircle
} from 'lucide-react'
import { ContractorNodeData } from '@/lib/react-flow/types'
import { cn } from '@/lib/utils'

export const ContractorNode = memo(({ data, selected }: NodeProps<ContractorNodeData>) => {
  const { name, company, specialty, tasksAssigned, hourlyRate, availability, contact } = data

  const availabilityConfig = {
    available: {
      icon: CheckCircle2,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
      label: 'Available'
    },
    busy: {
      icon: Clock,
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10',
      label: 'Busy'
    },
    unavailable: {
      icon: XCircle,
      color: 'text-red-500',
      bgColor: 'bg-red-500/10',
      label: 'Unavailable'
    }
  }

  const config = availabilityConfig[availability]
  const AvailabilityIcon = config.icon
  
  // Get initials for avatar
  const initials = name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <div className="relative">
      <Handle
        type="target"
        position={Position.Left}
        className="!w-3 !h-3 !bg-primary"
      />
      
      <Card 
        className={cn(
          "w-72 transition-all",
          selected && "ring-2 ring-primary shadow-lg"
        )}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start gap-3">
            <Avatar className="w-12 h-12">
              <AvatarFallback className="bg-primary text-primary-foreground">
                {initials}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <CardTitle className="text-base mb-1">{name}</CardTitle>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Briefcase className="w-3 h-3" />
                <span className="truncate">{company}</span>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          {/* Specialty */}
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              {specialty}
            </Badge>
          </div>

          {/* Availability */}
          <div className="flex items-center gap-2">
            <div className={cn("flex items-center gap-1 text-xs px-2 py-1 rounded", config.bgColor)}>
              <AvailabilityIcon className={cn("w-3 h-3", config.color)} />
              <span className={config.color}>{config.label}</span>
            </div>
          </div>

          {/* Hourly Rate */}
          {hourlyRate && (
            <div className="flex items-center gap-2 text-sm">
              <DollarSign className="w-4 h-4 text-muted-foreground" />
              <span>${hourlyRate}/hr</span>
            </div>
          )}

          {/* Tasks Assigned */}
          {tasksAssigned.length > 0 && (
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">
                Assigned Tasks ({tasksAssigned.length})
              </p>
              <div className="max-h-20 overflow-y-auto space-y-1">
                {tasksAssigned.slice(0, 3).map((task, idx) => (
                  <div 
                    key={idx}
                    className="text-xs p-1.5 rounded bg-accent/50 truncate"
                  >
                    {task}
                  </div>
                ))}
                {tasksAssigned.length > 3 && (
                  <p className="text-xs text-muted-foreground italic">
                    +{tasksAssigned.length - 3} more
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Contact Info */}
          {contact && (
            <div className="pt-2 border-t space-y-1">
              {contact.phone && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Phone className="w-3 h-3" />
                  <span>{contact.phone}</span>
                </div>
              )}
              {contact.email && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Mail className="w-3 h-3" />
                  <span className="truncate">{contact.email}</span>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Handle
        type="source"
        position={Position.Right}
        className="!w-3 !h-3 !bg-primary"
      />
    </div>
  )
})

ContractorNode.displayName = 'ContractorNode'

