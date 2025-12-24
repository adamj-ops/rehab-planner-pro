"use client"

import { useState, useEffect } from "react"
import { columns } from "./columns"
import { DataTable } from "./data-table"
import { Vendor } from "@/lib/vendors/definitions"
import { VendorDrawer } from "@/components/vendors/vendor-drawer"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { toast } from "sonner"

export default function VendorsPage() {
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null)
  const [drawerMode, setDrawerMode] = useState<'view' | 'edit' | 'create'>('view')

  useEffect(() => {
    loadVendors()
  }, [])

  const loadVendors = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/vendors')
      if (response.ok) {
        const data = await response.json()
        setVendors(data.data || [])
      } else {
        toast.error("Failed to load vendors")
      }
    } catch (error) {
      console.error('Failed to load vendors:', error)
      toast.error("Failed to load vendors")
    } finally {
      setIsLoading(false)
    }
  }

  const handleView = (vendor: Vendor) => {
    setSelectedVendor(vendor)
    setDrawerMode('view')
    setDrawerOpen(true)
  }

  const handleEdit = (vendor: Vendor) => {
    setSelectedVendor(vendor)
    setDrawerMode('edit')
    setDrawerOpen(true)
  }

  const handleCreate = () => {
    setSelectedVendor(null)
    setDrawerMode('create')
    setDrawerOpen(true)
  }

  const handleDelete = async (vendor: Vendor) => {
    if (!confirm(`Are you sure you want to delete ${vendor.company_name}?`)) {
      return
    }

    try {
      const response = await fetch(`/api/vendors/${vendor.id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setVendors(vendors.filter(v => v.id !== vendor.id))
        toast.success("Vendor deleted successfully")
      } else {
        toast.error("Failed to delete vendor")
      }
    } catch (error) {
      console.error('Failed to delete vendor:', error)
      toast.error("Failed to delete vendor")
    }
  }

  const handleSave = async (vendorData: Partial<Vendor>) => {
    try {
      if (drawerMode === 'create') {
        const response = await fetch('/api/vendors', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(vendorData),
        })

        if (response.ok) {
          const data = await response.json()
          setVendors([...vendors, data.data])
          toast.success("Vendor created successfully")
        } else {
          throw new Error('Failed to create vendor')
        }
      } else if (selectedVendor) {
        const response = await fetch(`/api/vendors/${selectedVendor.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(vendorData),
        })

        if (response.ok) {
          const data = await response.json()
          setVendors(vendors.map(v => v.id === selectedVendor.id ? data.data : v))
          toast.success("Vendor updated successfully")
        } else {
          throw new Error('Failed to update vendor')
        }
      }
    } catch (error) {
      console.error('Failed to save vendor:', error)
      toast.error(`Failed to ${drawerMode === 'create' ? 'create' : 'update'} vendor`)
      throw error
    }
  }

  const tableColumns = columns({
    onView: handleView,
    onEdit: handleEdit,
    onDelete: handleDelete,
  })

  if (isLoading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Vendors & Contractors</h1>
          <p className="text-muted-foreground mt-2">
            Manage your contractor and supplier database
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Add Vendor
        </Button>
      </div>

      <DataTable data={vendors} columns={tableColumns} />

      <VendorDrawer
        vendor={selectedVendor}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onSave={handleSave}
        mode={drawerMode}
      />
    </div>
  )
}
