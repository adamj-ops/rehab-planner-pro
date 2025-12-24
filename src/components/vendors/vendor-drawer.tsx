"use client"

import { useState, useEffect } from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Vendor, vendorTypes, vendorSpecialties } from "@/lib/vendors/definitions"
import { DollarSign, Save, X } from "lucide-react"
import { Separator } from "@/components/ui/separator"

interface VendorDrawerProps {
  vendor: Vendor | null
  open: boolean
  onClose: () => void
  onSave: (vendor: Partial<Vendor>) => Promise<void>
  mode: 'view' | 'edit' | 'create'
}

export function VendorDrawer({ vendor, open, onClose, onSave, mode }: VendorDrawerProps) {
  const [isEditing, setIsEditing] = useState(mode === 'create' || mode === 'edit')
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState<Partial<Vendor>>(vendor || {
    company_name: '',
    vendor_type: 'contractor',
    is_active: true,
    preferred: false,
    insurance_verified: false,
    projects_completed: 0,
    total_spent: 0,
    specialties: [],
  })

  useEffect(() => {
    if (vendor) {
      setFormData(vendor)
    }
    setIsEditing(mode === 'create' || mode === 'edit')
  }, [vendor, mode])

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await onSave(formData)
      setIsEditing(false)
      onClose()
    } catch (error) {
      console.error('Failed to save vendor:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const toggleSpecialty = (specialty: string) => {
    if (!isEditing) return
    const current = formData.specialties || []
    const updated = current.includes(specialty)
      ? current.filter(s => s !== specialty)
      : [...current, specialty]
    setFormData({ ...formData, specialties: updated })
  }

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <div className="flex items-center justify-between">
            <div>
              <SheetTitle>
                {mode === 'create' ? 'New Vendor' : formData.company_name}
              </SheetTitle>
              <SheetDescription>
                {mode === 'create' ? 'Add a new vendor or contractor' : 'View and edit vendor details'}
              </SheetDescription>
            </div>
            {mode === 'view' && !isEditing && (
              <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                Edit
              </Button>
            )}
          </div>
        </SheetHeader>

        <div className="space-y-6 py-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm">Basic Information</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="company_name">Company Name *</Label>
                <Input
                  id="company_name"
                  value={formData.company_name || ''}
                  onChange={(e) => setFormData({...formData, company_name: e.target.value})}
                  disabled={!isEditing}
                  placeholder="ABC Contractors LLC"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact_name">Contact Name</Label>
                <Input
                  id="contact_name"
                  value={formData.contact_name || ''}
                  onChange={(e) => setFormData({...formData, contact_name: e.target.value})}
                  disabled={!isEditing}
                  placeholder="John Smith"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email || ''}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  disabled={!isEditing}
                  placeholder="john@abccontractors.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={formData.phone || ''}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  disabled={!isEditing}
                  placeholder="+1 (555) 123-4567"
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Classification */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm">Classification</h3>
            
            <div className="space-y-2">
              <Label htmlFor="vendor_type">Vendor Type *</Label>
              <Select
                value={formData.vendor_type}
                onValueChange={(value) => setFormData({...formData, vendor_type: value})}
                disabled={!isEditing}
              >
                <SelectTrigger id="vendor_type">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {vendorTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Specialties</Label>
              <div className="flex flex-wrap gap-2">
                {vendorSpecialties.map((specialty) => (
                  <Badge
                    key={specialty.value}
                    variant={formData.specialties?.includes(specialty.value) ? "default" : "outline"}
                    className={isEditing ? "cursor-pointer" : ""}
                    onClick={() => toggleSpecialty(specialty.value)}
                  >
                    {specialty.label}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          <Separator />

          {/* Financial */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm">Financial Details</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="hourly_rate">Hourly Rate</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="hourly_rate"
                    type="number"
                    value={formData.hourly_rate || ''}
                    onChange={(e) => setFormData({...formData, hourly_rate: parseFloat(e.target.value) || 0})}
                    disabled={!isEditing}
                    className="pl-10"
                    placeholder="75.00"
                    step="0.01"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="markup_percentage">Markup %</Label>
                <Input
                  id="markup_percentage"
                  type="number"
                  value={formData.markup_percentage || ''}
                  onChange={(e) => setFormData({...formData, markup_percentage: parseFloat(e.target.value) || 0})}
                  disabled={!isEditing}
                  placeholder="15"
                  step="0.01"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="license_number">License Number</Label>
              <Input
                id="license_number"
                value={formData.license_number || ''}
                onChange={(e) => setFormData({...formData, license_number: e.target.value})}
                disabled={!isEditing}
                placeholder="LIC-123456"
              />
            </div>
          </div>

          <Separator />

          {/* Settings */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm">Settings</h3>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Preferred Vendor</Label>
                <div className="text-sm text-muted-foreground">
                  Show this vendor first in lists
                </div>
              </div>
              <Switch
                checked={formData.preferred || false}
                onCheckedChange={(checked) => setFormData({...formData, preferred: checked})}
                disabled={!isEditing}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Active Status</Label>
                <div className="text-sm text-muted-foreground">
                  Include in contractor selections
                </div>
              </div>
              <Switch
                checked={formData.is_active !== false}
                onCheckedChange={(checked) => setFormData({...formData, is_active: checked})}
                disabled={!isEditing}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Insurance Verified</Label>
                <div className="text-sm text-muted-foreground">
                  Confirm insurance coverage
                </div>
              </div>
              <Switch
                checked={formData.insurance_verified || false}
                onCheckedChange={(checked) => setFormData({...formData, insurance_verified: checked})}
                disabled={!isEditing}
              />
            </div>
          </div>

          <Separator />

          {/* Notes */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm">Notes</h3>
            <Textarea
              value={formData.notes || ''}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              disabled={!isEditing}
              placeholder="Add any notes about this vendor..."
              rows={4}
            />
          </div>

          {/* Actions */}
          {isEditing && (
            <div className="flex gap-2 pt-4">
              <Button 
                onClick={handleSave} 
                className="flex-1"
                disabled={isSaving || !formData.company_name || !formData.vendor_type}
              >
                {isSaving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsEditing(false)
                  if (mode === 'create') {
                    onClose()
                  } else {
                    setFormData(vendor || {})
                  }
                }}
                disabled={isSaving}
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}

