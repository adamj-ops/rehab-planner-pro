import { BadgeCheck, AlertCircle, User, Wrench, Package, Settings } from 'lucide-react'

export const vendorTypes = [
  {
    value: "contractor",
    label: "General Contractor",
    icon: User,
  },
  {
    value: "supplier",
    label: "Material Supplier",
    icon: Package,
  },
  {
    value: "service_provider",
    label: "Service Provider",
    icon: Settings,
  },
]

export const vendorSpecialties = [
  { value: "plumbing", label: "Plumbing" },
  { value: "electrical", label: "Electrical" },
  { value: "hvac", label: "HVAC" },
  { value: "roofing", label: "Roofing" },
  { value: "framing", label: "Framing" },
  { value: "drywall", label: "Drywall" },
  { value: "painting", label: "Painting" },
  { value: "flooring", label: "Flooring" },
  { value: "kitchen", label: "Kitchen & Bath" },
  { value: "landscaping", label: "Landscaping" },
  { value: "concrete", label: "Concrete" },
  { value: "masonry", label: "Masonry" },
  { value: "windows", label: "Windows & Doors" },
  { value: "siding", label: "Siding" },
  { value: "insulation", label: "Insulation" },
  { value: "demolition", label: "Demolition" },
  { value: "foundation", label: "Foundation" },
  { value: "carpentry", label: "Carpentry" },
]

export const vendorStatus = [
  {
    value: "active",
    label: "Active",
    icon: BadgeCheck,
  },
  {
    value: "inactive",
    label: "Inactive",
    icon: AlertCircle,
  },
]

export type Vendor = {
  id: string
  user_id: string
  company_name: string
  contact_name: string | null
  email: string | null
  phone: string | null
  address_street: string | null
  address_city: string | null
  address_state: string | null
  address_zip: string | null
  vendor_type: string
  specialties: string[] | null
  license_number: string | null
  insurance_verified: boolean
  insurance_expiry: string | null
  rating: number | null
  hourly_rate: number | null
  markup_percentage: number | null
  payment_terms: string | null
  projects_completed: number
  total_spent: number
  notes: string | null
  documents: any | null
  is_active: boolean
  preferred: boolean
  created_at: string
  updated_at: string
}

