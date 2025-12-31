'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useDealsStore, LEAD_SOURCES } from '@/hooks/use-deals-store'

export default function NewLeadPage() {
  const router = useRouter()
  const createLead = useDealsStore((state) => state.createLead)

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    const formData = new FormData(e.currentTarget)

    // Parse asking price - remove $ and commas
    const askingPriceRaw = formData.get('asking_price') as string
    const askingPrice = askingPriceRaw
      ? parseFloat(askingPriceRaw.replace(/[$,]/g, ''))
      : null

    const leadData = {
      address: formData.get('address') as string,
      city: formData.get('city') as string,
      state: (formData.get('state') as string) || 'MN',
      zip: formData.get('zip') as string,
      source: formData.get('source') as string,
      source_detail: (formData.get('source_detail') as string) || null,
      asking_price: askingPrice,
      bedrooms: formData.get('bedrooms') ? parseInt(formData.get('bedrooms') as string, 10) : null,
      bathrooms: formData.get('bathrooms') ? parseFloat(formData.get('bathrooms') as string) : null,
      sqft: formData.get('sqft') ? parseInt(formData.get('sqft') as string, 10) : null,
      year_built: formData.get('year_built') ? parseInt(formData.get('year_built') as string, 10) : null,
    }

    try {
      const result = await createLead(leadData)
      if (result) {
        router.push('/deals')
      } else {
        setError('Failed to create lead. Please try again.')
      }
    } catch (err) {
      console.error('Error creating lead:', err)
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <Link href="/deals" className="text-sm text-muted-foreground hover:text-foreground">
          ← Back to Pipeline
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight mt-2">Add New Lead</h1>
        <p className="text-muted-foreground text-sm">
          Quick entry to get a property into your pipeline
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-md bg-destructive/10 text-destructive text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Property Address */}
        <div className="space-y-4 p-4 rounded-lg border bg-card">
          <h2 className="font-medium">Property Address</h2>
          <div className="grid gap-4">
            <div>
              <label htmlFor="address" className="text-sm font-medium">
                Street Address *
              </label>
              <input
                id="address"
                name="address"
                type="text"
                placeholder="123 Main St"
                className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm"
                required
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label htmlFor="city" className="text-sm font-medium">
                  City *
                </label>
                <input
                  id="city"
                  name="city"
                  type="text"
                  placeholder="Minneapolis"
                  className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm"
                  required
                />
              </div>
              <div>
                <label htmlFor="state" className="text-sm font-medium">
                  State
                </label>
                <input
                  id="state"
                  name="state"
                  type="text"
                  defaultValue="MN"
                  className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label htmlFor="zip" className="text-sm font-medium">
                  ZIP *
                </label>
                <input
                  id="zip"
                  name="zip"
                  type="text"
                  placeholder="55401"
                  className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm"
                  required
                />
              </div>
            </div>
          </div>
        </div>

        {/* Lead Source & Price */}
        <div className="space-y-4 p-4 rounded-lg border bg-card">
          <h2 className="font-medium">Lead Details</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="source" className="text-sm font-medium">
                Lead Source *
              </label>
              <select
                id="source"
                name="source"
                className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm"
                required
                defaultValue=""
              >
                <option value="" disabled>
                  Select source...
                </option>
                {LEAD_SOURCES.map((source) => (
                  <option key={source.value} value={source.value}>
                    {source.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="asking_price" className="text-sm font-medium">
                Asking Price
              </label>
              <input
                id="asking_price"
                name="asking_price"
                type="text"
                placeholder="$250,000"
                className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm"
              />
            </div>
          </div>
          <div>
            <label htmlFor="source_detail" className="text-sm font-medium">
              Source Detail
            </label>
            <input
              id="source_detail"
              name="source_detail"
              type="text"
              placeholder="e.g., John's Wholesale Deals"
              className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm"
            />
          </div>
        </div>

        {/* Property Details (Optional) */}
        <div className="space-y-4 p-4 rounded-lg border bg-card">
          <h2 className="font-medium">
            Property Details <span className="text-muted-foreground font-normal">(optional)</span>
          </h2>
          <div className="grid grid-cols-4 gap-4">
            <div>
              <label htmlFor="bedrooms" className="text-sm font-medium">
                Beds
              </label>
              <input
                id="bedrooms"
                name="bedrooms"
                type="number"
                min="0"
                className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label htmlFor="bathrooms" className="text-sm font-medium">
                Baths
              </label>
              <input
                id="bathrooms"
                name="bathrooms"
                type="number"
                step="0.5"
                min="0"
                className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label htmlFor="sqft" className="text-sm font-medium">
                Sq Ft
              </label>
              <input
                id="sqft"
                name="sqft"
                type="number"
                min="0"
                className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label htmlFor="year_built" className="text-sm font-medium">
                Year Built
              </label>
              <input
                id="year_built"
                name="year_built"
                type="number"
                min="1800"
                max="2030"
                className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm"
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-end">
          <Link
            href="/deals"
            className="px-4 py-2 text-sm font-medium rounded-md border hover:bg-muted"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Adding...' : 'Add to Pipeline'}
          </button>
        </div>
      </form>
    </div>
  )
}
