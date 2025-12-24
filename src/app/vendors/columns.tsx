"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { DataTableColumnHeader } from "./data-table-column-header"
import { DataTableRowActions } from "./data-table-row-actions"
import { vendorTypes, vendorStatus, Vendor } from "@/lib/vendors/definitions"
import { Star, Phone, Mail } from "lucide-react"

export const columns: (options?: {
  onView?: (vendor: Vendor) => void
  onEdit?: (vendor: Vendor) => void
  onDelete?: (vendor: Vendor) => void
}) => ColumnDef<Vendor>[] = (options = {}) => [
  {
    accessorKey: "preferred",
    header: "",
    cell: ({ row }) => {
      return row.getValue("preferred") ? (
        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
      ) : null
    },
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "company_name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Company" />
    ),
    cell: ({ row }) => {
      return (
        <div>
          <div className="font-medium">{row.getValue("company_name")}</div>
          {row.original.contact_name && (
            <div className="text-sm text-muted-foreground">
              {row.original.contact_name}
            </div>
          )}
        </div>
      )
    },
  },
  {
    accessorKey: "vendor_type",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Type" />
    ),
    cell: ({ row }) => {
      const type = vendorTypes.find(
        (type) => type.value === row.getValue("vendor_type")
      )
      return type ? (
        <Badge variant="outline">{type.label}</Badge>
      ) : null
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
  {
    accessorKey: "specialties",
    header: "Specialties",
    cell: ({ row }) => {
      const specialties = row.getValue("specialties") as string[] | null
      if (!specialties || specialties.length === 0) return null
      
      return (
        <div className="flex gap-1 flex-wrap max-w-xs compact">
          {specialties.slice(0, 2).map((specialty) => (
            <Badge key={specialty} variant="secondary" className="text-xs">
              {specialty}
            </Badge>
          ))}
          {specialties.length > 2 && (
            <Badge variant="secondary" className="text-xs">
              +{specialties.length - 2}
            </Badge>
          )}
        </div>
      )
    },
    enableSorting: false,
  },
  {
    accessorKey: "contact",
    id: "contact",
    header: "Contact",
    cell: ({ row }) => {
      return (
        <div className="space-y-1 compact">
          {row.original.phone && (
            <div className="flex items-center gap-1 text-sm">
              <Phone className="h-3 w-3" />
              {row.original.phone}
            </div>
          )}
          {row.original.email && (
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Mail className="h-3 w-3" />
              {row.original.email}
            </div>
          )}
        </div>
      )
    },
    enableSorting: false,
  },
  {
    accessorKey: "rating",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Rating" />
    ),
    cell: ({ row }) => {
      const rating = row.getValue("rating") as number | null
      return rating ? (
        <div className="flex items-center gap-1">
          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
          <span className="text-sm font-medium">{rating.toFixed(1)}</span>
        </div>
      ) : (
        <span className="text-sm text-muted-foreground">Not rated</span>
      )
    },
  },
  {
    accessorKey: "hourly_rate",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Rate" />
    ),
    cell: ({ row }) => {
      const rate = row.getValue("hourly_rate") as number | null
      return rate ? (
        <div className="text-sm font-medium">${rate}/hr</div>
      ) : null
    },
  },
  {
    accessorKey: "projects_completed",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Projects" />
    ),
    cell: ({ row }) => {
      return (
        <div className="text-sm text-center">
          {row.getValue("projects_completed")}
        </div>
      )
    },
  },
  {
    accessorKey: "is_active",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {
      const isActive = row.getValue("is_active") as boolean
      const status = isActive ? "active" : "inactive"
      const statusConfig = vendorStatus.find((s) => s.value === status)
      
      return statusConfig ? (
        <Badge variant={status === "active" ? "default" : "secondary"}>
          {statusConfig.label}
        </Badge>
      ) : null
    },
    filterFn: (row, id, value) => {
      const isActive = row.getValue(id) as boolean
      const status = isActive ? "active" : "inactive"
      return value.includes(status)
    },
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <DataTableRowActions 
        row={row} 
        onView={options.onView}
        onEdit={options.onEdit}
        onDelete={options.onDelete}
      />
    ),
  },
]

