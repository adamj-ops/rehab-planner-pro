'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { 
  Home, 
  ChefHat, 
  Bath, 
  Bed, 
  Car, 
  TreePine, 
  Camera,
  X
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface PropertyAssessmentProps {
  project: any
  onNext: (data: any) => void
  onBack: () => void
}

// Room definitions with icons
const rooms = [
  { id: 'kitchen', name: 'Kitchen', icon: ChefHat },
  { id: 'living-room', name: 'Living Room', icon: Home },
  { id: 'dining-room', name: 'Dining Room', icon: Home },
  { id: 'master-bedroom', name: 'Master Bedroom', icon: Bed },
  { id: 'bedroom-2', name: 'Bedroom 2', icon: Bed },
  { id: 'bedroom-3', name: 'Bedroom 3', icon: Bed },
  { id: 'master-bathroom', name: 'Master Bath', icon: Bath },
  { id: 'bathroom-2', name: 'Bathroom 2', icon: Bath },
  { id: 'half-bath', name: 'Half Bath', icon: Bath },
  { id: 'garage', name: 'Garage', icon: Car },
  { id: 'basement', name: 'Basement', icon: Home },
  { id: 'attic', name: 'Attic', icon: TreePine }
]

// Component definitions for each room
const getComponents = (roomId: string) => {
  const componentMap: Record<string, any[]> = {
    'kitchen': [
      { id: 'cabinets', name: 'Cabinets', needsWork: false, action: 'repair' },
      { id: 'countertops', name: 'Countertops', needsWork: false, action: 'repair' },
      { id: 'appliances', name: 'Appliances', needsWork: false, action: 'repair' },
      { id: 'sink', name: 'Sink & Faucet', needsWork: false, action: 'repair' },
      { id: 'lighting', name: 'Lighting', needsWork: false, action: 'repair' },
      { id: 'flooring', name: 'Flooring', needsWork: false, action: 'repair' }
    ],
    'bathroom': [
      { id: 'vanity', name: 'Vanity', needsWork: false, action: 'repair' },
      { id: 'tub-shower', name: 'Tub/Shower', needsWork: false, action: 'repair' },
      { id: 'toilet', name: 'Toilet', needsWork: false, action: 'repair' },
      { id: 'tile', name: 'Tile', needsWork: false, action: 'repair' },
      { id: 'lighting', name: 'Lighting', needsWork: false, action: 'repair' },
      { id: 'flooring', name: 'Flooring', needsWork: false, action: 'repair' }
    ],
    'bedroom': [
      { id: 'closet', name: 'Closet', needsWork: false, action: 'repair' },
      { id: 'lighting', name: 'Lighting', needsWork: false, action: 'repair' },
      { id: 'flooring', name: 'Flooring', needsWork: false, action: 'repair' },
      { id: 'windows', name: 'Windows', needsWork: false, action: 'repair' }
    ],
    'living-room': [
      { id: 'lighting', name: 'Lighting', needsWork: false, action: 'repair' },
      { id: 'flooring', name: 'Flooring', needsWork: false, action: 'repair' },
      { id: 'windows', name: 'Windows', needsWork: false, action: 'repair' },
      { id: 'fireplace', name: 'Fireplace', needsWork: false, action: 'repair' }
    ],
    'garage': [
      { id: 'door', name: 'Garage Door', needsWork: false, action: 'repair' },
      { id: 'flooring', name: 'Flooring', needsWork: false, action: 'repair' },
      { id: 'electrical', name: 'Electrical', needsWork: false, action: 'repair' }
    ],
    'basement': [
      { id: 'foundation', name: 'Foundation', needsWork: false, action: 'repair' },
      { id: 'waterproofing', name: 'Waterproofing', needsWork: false, action: 'repair' },
      { id: 'electrical', name: 'Electrical', needsWork: false, action: 'repair' },
      { id: 'flooring', name: 'Flooring', needsWork: false, action: 'repair' }
    ]
  }

  // Return components based on room type
  if (roomId.includes('kitchen')) return componentMap.kitchen
  if (roomId.includes('bath')) return componentMap.bathroom
  if (roomId.includes('bedroom')) return componentMap.bedroom
  if (roomId.includes('living')) return componentMap['living-room']
  if (roomId.includes('garage')) return componentMap.garage
  if (roomId.includes('basement')) return componentMap.basement
  
  // Default components for other rooms
  return [
    { id: 'lighting', name: 'Lighting', needsWork: false, action: 'repair' },
    { id: 'flooring', name: 'Flooring', needsWork: false, action: 'repair' },
    { id: 'windows', name: 'Windows', needsWork: false, action: 'repair' }
  ]
}

export function PropertyAssessment({ project, onNext, onBack }: PropertyAssessmentProps) {
  const [selectedRoom, setSelectedRoom] = useState<string>('')
  const [assessments, setAssessments] = useState<Record<string, any>>({})
  const [photos, setPhotos] = useState<Array<{ url: string; file?: File }>>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Initialize assessments for all rooms
  useEffect(() => {
    const initialAssessments: Record<string, any> = {}
    rooms.forEach(room => {
      initialAssessments[room.id] = {
        roomId: room.id,
        condition: undefined,
        components: {},
        notes: '',
        photos: []
      }
    })
    setAssessments(initialAssessments)
  }, [])

  const updateCondition = (roomId: string, condition: string) => {
    setAssessments(prev => ({
      ...prev,
      [roomId]: {
        ...prev[roomId],
        condition: condition
      }
    }))
  }

  const updateComponent = (roomId: string, componentId: string, field: string, value: any) => {
    setAssessments(prev => ({
      ...prev,
      [roomId]: {
        ...prev[roomId],
        components: {
          ...prev[roomId]?.components,
          [componentId]: {
            ...prev[roomId]?.components?.[componentId],
            [field]: value
          }
        }
      }
    }))
  }

  const updateRoomAssessment = (roomId: string, field: string, value: any) => {
    setAssessments(prev => ({
      ...prev,
      [roomId]: {
        ...prev[roomId],
        [field]: value
      }
    }))
  }

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files) {
      Array.from(files).forEach(file => {
        const reader = new FileReader()
        reader.onload = (e) => {
          setPhotos(prev => [...prev, { url: e.target?.result as string, file }])
        }
        reader.readAsDataURL(file)
      })
    }
  }

  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index))
  }

  const calculateOverallScore = (): number => {
    const assessedRooms = Object.values(assessments).filter(a => a.condition)
    if (assessedRooms.length === 0) return 0

    const scoreMap: Record<string, number> = {
      'excellent': 100,
      'good': 80,
      'fair': 60,
      'poor': 30,
      'terrible': 10
    }

    const totalScore = assessedRooms.reduce((sum, room) => {
      return sum + (scoreMap[room.condition!] || 0)
    }, 0)

    return Math.round(totalScore / assessedRooms.length)
  }

  const handleSubmit = () => {
    onNext({ assessments })
  }

  const currentAssessment = selectedRoom ? assessments[selectedRoom] : null
  const components = selectedRoom ? getComponents(selectedRoom) : []
  const overallScore = calculateOverallScore()
  const assessedRooms = Object.values(assessments).filter(a => a.condition).length
  const selectedRoomData = rooms.find(r => r.id === selectedRoom)

  return (
    <div className="space-y-6">
      {/* Room Selection - IMPROVEMENT #1: Better Room Grid Layout */}
      <div className="mb-8">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Select a room to assess:</h3>
        
        {/* Room Grid - 3 columns for better organization */}
        <div className="grid grid-cols-3 gap-3">
          {rooms.map((room) => {
            const isSelected = selectedRoom === room.id
            const isAssessed = assessments[room.id]?.condition
            const condition = assessments[room.id]?.condition
            
            return (
              <button
                key={room.id}
                onClick={() => setSelectedRoom(room.id)}
                className={cn(
                  "relative p-4 rounded-lg border-2 transition-all",
                  "flex flex-col items-center gap-2",
                  isSelected 
                    ? "border-gray-900 bg-gray-50 shadow-sm" 
                    : "border-gray-200 hover:border-gray-400 bg-white",
                  isAssessed && !isSelected && "border-gray-300 bg-gray-50/50"
                )}
              >
                {/* Status indicator dot */}
                {isAssessed && (
                  <div className={cn(
                    "absolute top-2 right-2 w-2 h-2 rounded-full",
                    condition === 'excellent' && "bg-green-500",
                    condition === 'good' && "bg-green-400",
                    condition === 'fair' && "bg-yellow-500",
                    condition === 'poor' && "bg-orange-500",
                    condition === 'terrible' && "bg-red-500"
                  )} />
                )}
                
                {/* Room icon */}
                <room.icon className={cn(
                  "w-6 h-6",
                  isSelected ? "text-gray-900" : "text-gray-600"
                )} />
                
                {/* Room name */}
                <span className={cn(
                  "text-sm font-medium",
                  isSelected ? "text-gray-900" : "text-gray-700"
                )}>
                  {room.name}
                </span>
                
                {/* Assessment status */}
                {isAssessed && (
                  <span className="text-xs text-gray-500">
                    {condition}
                  </span>
                )}
              </button>
            )
          })}
        </div>
        
        {/* Progress indicator for rooms */}
        <div className="mt-4 flex items-center justify-between text-sm">
          <span className="text-gray-600">
            {assessedRooms} of {rooms.length} rooms assessed
          </span>
          <div className="flex gap-2">
            {rooms.map((room) => (
              <div
                key={room.id}
                className={cn(
                  "w-2 h-2 rounded-full",
                  assessments[room.id]?.condition ? "bg-gray-900" : "bg-gray-300"
                )}
              />
            ))}
          </div>
        </div>
      </div>

      {selectedRoom && currentAssessment && selectedRoomData && (
        <>
          {/* Room Assessment Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <selectedRoomData.icon className="w-5 h-5" />
                {selectedRoomData.name} Assessment
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              
              {/* IMPROVEMENT #2: Better Condition Selector */}
              <div className="mb-6">
                <Label className="text-base font-medium mb-3 block">Overall Room Condition</Label>
                
                <div className="grid grid-cols-5 gap-2">
                  {[
                    { value: 'terrible', label: 'Terrible', color: 'bg-red-500', description: 'Major issues' },
                    { value: 'poor', label: 'Poor', color: 'bg-orange-500', description: 'Needs work' },
                    { value: 'fair', label: 'Fair', color: 'bg-yellow-500', description: 'Average' },
                    { value: 'good', label: 'Good', color: 'bg-green-400', description: 'Minor issues' },
                    { value: 'excellent', label: 'Excellent', color: 'bg-green-500', description: 'Move-in ready' }
                  ].map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => updateCondition(selectedRoom, option.value)}
                      className={cn(
                        "p-3 rounded-lg border-2 transition-all",
                        "flex flex-col items-center gap-1",
                        currentAssessment.condition === option.value
                          ? "border-gray-900 bg-gray-50"
                          : "border-gray-200 hover:border-gray-400 bg-white"
                      )}
                    >
                      <div className={cn("w-8 h-8 rounded-full", option.color)} />
                      <span className="text-sm font-medium">{option.label}</span>
                      <span className="text-xs text-gray-500">{option.description}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* IMPROVEMENT #3: Better Component Checklist */}
              <div className="space-y-3">
                <Label className="text-base font-medium">Component Conditions</Label>
                
                <div className="space-y-2">
                  {components.map((component: any) => (
                    <div
                      key={component.id}
                      className="flex items-center justify-between p-3 rounded-lg border bg-white hover:bg-gray-50 transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <Checkbox
                          checked={currentAssessment.components?.[component.id]?.needsWork || false}
                          onCheckedChange={(checked) => updateComponent(selectedRoom, component.id, 'needsWork', checked)}
                        />
                        <Label className="text-sm font-medium cursor-pointer">
                          {component.name}
                        </Label>
                      </div>
                      
                      {currentAssessment.components?.[component.id]?.needsWork && (
                        <select
                          value={currentAssessment.components?.[component.id]?.action || 'repair'}
                          onChange={(e) => updateComponent(selectedRoom, component.id, 'action', e.target.value)}
                          className="px-3 py-1 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900"
                        >
                          <option value="repair">Repair</option>
                          <option value="replace">Replace</option>
                          <option value="upgrade">Upgrade</option>
                        </select>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div>
                <Label htmlFor="notes">Additional Notes</Label>
                <Textarea
                  id="notes"
                  value={currentAssessment.notes}
                  onChange={(e) => updateRoomAssessment(selectedRoom, 'notes', e.target.value)}
                  placeholder="Any specific issues or observations..."
                  className="mt-2"
                />
              </div>

              {/* IMPROVEMENT #5: Photo Upload */}
              <div className="mt-6">
                <Label className="text-base font-medium mb-3 block">Room Photos</Label>
                
                <div className="grid grid-cols-3 gap-3">
                  {photos.map((photo, index) => (
                    <div key={index} className="relative aspect-square rounded-lg overflow-hidden border">
                      <img src={photo.url} alt="" className="w-full h-full object-cover" />
                      <button
                        onClick={() => removePhoto(index)}
                        className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="aspect-square rounded-lg border-2 border-dashed border-gray-300 hover:border-gray-400 bg-gray-50 flex flex-col items-center justify-center transition-colors"
                  >
                    <Camera className="w-8 h-8 text-gray-400 mb-2" />
                    <span className="text-sm text-gray-600">Add Photo</span>
                  </button>
                </div>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handlePhotoUpload}
                />
              </div>
            </CardContent>
          </Card>

          {/* IMPROVEMENT #4: Visual Property Score */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Overall Property Condition</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-4xl font-bold">
                    {overallScore}/100
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    Based on {assessedRooms} of {rooms.length} rooms
                  </p>
                </div>
                
                <div className="relative w-32 h-32">
                  <svg className="w-32 h-32 transform -rotate-90">
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke="currentColor"
                      strokeWidth="12"
                      fill="none"
                      className="text-gray-200"
                    />
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke="currentColor"
                      strokeWidth="12"
                      fill="none"
                      strokeDasharray={`${2 * Math.PI * 56}`}
                      strokeDashoffset={`${2 * Math.PI * 56 * (1 - overallScore / 100)}`}
                      className={cn(
                        "transition-all duration-500",
                        overallScore >= 80 && "text-green-500",
                        overallScore >= 60 && overallScore < 80 && "text-yellow-500",
                        overallScore < 60 && "text-red-500"
                      )}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className={cn(
                      "text-sm font-medium",
                      overallScore >= 80 && "text-green-600",
                      overallScore >= 60 && overallScore < 80 && "text-yellow-600",
                      overallScore < 60 && "text-red-600"
                    )}>
                      {overallScore >= 80 ? 'Good' : overallScore >= 60 ? 'Fair' : 'Poor'}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Submit Handler - Navigation is handled by parent component */}
      <div className="hidden">
        <Button 
          onClick={handleSubmit}
          disabled={Object.keys(assessments).length === 0}
        >
          Continue to Strategy
        </Button>
      </div>
    </div>
  )
}
