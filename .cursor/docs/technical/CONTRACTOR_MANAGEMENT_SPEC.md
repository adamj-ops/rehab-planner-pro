# Contractor Management System - Technical Specification

**Version**: 1.0.0  
**Last Updated**: December 28, 2025  
**Status**: Ready for Implementation  
**Epic**: Phase 3 - Advanced Features  
**Priority**: HIGH - Workflow Enabler  

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Data Model](#data-model)
3. [Feature Modules](#feature-modules)
4. [API Design](#api-design)
5. [Database Schema](#database-schema)
6. [Component Architecture](#component-architecture)
7. [Implementation Plan](#implementation-plan)
8. [Testing Strategy](#testing-strategy)

---

## 🎯 Overview

### Purpose

The Contractor Management System provides comprehensive vendor tracking, bid management, and performance analytics for real estate investors managing renovation projects.

### Business Value

```
┌────────────────────────────────────────────────────────────────┐
│                 CONTRACTOR MANAGEMENT VALUE                      │
├────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. VENDOR ORGANIZATION                                          │
│     ├── Centralized contractor database                         │
│     ├── License & insurance tracking                            │
│     └── Specialty categorization                                │
│                                                                  │
│  2. BID MANAGEMENT                                               │
│     ├── Request bids from multiple contractors                  │
│     ├── Side-by-side comparison                                 │
│     └── Auto-populate scope from project                        │
│                                                                  │
│  3. PERFORMANCE TRACKING                                         │
│     ├── Rating and review history                               │
│     ├── On-time/on-budget metrics                               │
│     └── Project history per contractor                          │
│                                                                  │
│  4. SCHEDULING INTEGRATION                                       │
│     ├── Assign contractors to timeline phases                   │
│     └── Conflict detection                                       │
│                                                                  │
└────────────────────────────────────────────────────────────────┘
```

### User Stories

| As a... | I want to... | So that... |
|---------|--------------|------------|
| Investor | Store contractor details | I can quickly find vendors for future projects |
| Investor | Track license expiration | I ensure compliance and avoid liability |
| Investor | Request multiple bids | I can compare pricing and select best value |
| Investor | Rate contractor performance | I remember who to use again (or avoid) |
| Investor | Assign contractors to phases | My timeline reflects who does what |

---

## 💾 Data Model

### Core Entities

```typescript
// src/types/contractors.ts

export interface Contractor {
  id: string;
  userId: string;                    // Owner of this contractor record
  
  // Basic Information
  companyName: string;
  contactFirstName: string;
  contactLastName: string;
  email: string;
  phone: string;
  website?: string;
  
  // Address
  addressStreet?: string;
  addressCity?: string;
  addressState?: string;
  addressZip?: string;
  
  // Business Details
  vendorType: VendorType;
  specialties: ContractorSpecialty[];
  serviceArea?: string[];            // Zip codes or regions
  
  // Compliance
  licenseNumber?: string;
  licenseState?: string;
  licenseExpiration?: Date;
  insuranceCarrier?: string;
  insurancePolicyNumber?: string;
  insuranceExpiration?: Date;
  insuranceCoverageAmount?: number;
  bondedAmount?: number;
  
  // Financial
  hourlyRate?: number;
  markupPercent?: number;
  paymentTerms?: PaymentTerms;
  taxId?: string;                    // W-9 info
  
  // Status & Preferences
  status: ContractorStatus;
  isPreferred: boolean;
  notes?: string;
  tags?: string[];
  
  // Performance Metrics (computed)
  averageRating?: number;
  totalProjects?: number;
  totalSpent?: number;
  onTimePercent?: number;
  onBudgetPercent?: number;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

export type VendorType = 
  | 'contractor'          // General contractor
  | 'subcontractor'       // Trade-specific sub
  | 'supplier'            // Materials vendor
  | 'service_provider';   // Inspectors, appraisers, etc.

export type ContractorSpecialty =
  | 'general'
  | 'plumbing'
  | 'electrical'
  | 'hvac'
  | 'roofing'
  | 'flooring'
  | 'painting'
  | 'drywall'
  | 'carpentry'
  | 'masonry'
  | 'landscaping'
  | 'demo'
  | 'kitchen'
  | 'bathroom'
  | 'windows_doors'
  | 'foundation'
  | 'framing'
  | 'insulation'
  | 'siding'
  | 'concrete'
  | 'fencing'
  | 'appliances'
  | 'cabinets'
  | 'countertops'
  | 'tile'
  | 'smart_home'
  | 'security'
  | 'pool'
  | 'cleaning'
  | 'staging'
  | 'inspection'
  | 'appraisal'
  | 'permit_expediter';

export type ContractorStatus = 
  | 'active'
  | 'inactive'
  | 'on_hold'
  | 'blocked';

export type PaymentTerms =
  | 'on_completion'
  | 'net_15'
  | 'net_30'
  | 'net_45'
  | 'draw_schedule'
  | 'custom';
```

### Bid Management

```typescript
// src/types/bids.ts

export interface BidRequest {
  id: string;
  projectId: string;
  
  // Request details
  title: string;
  description?: string;
  scopeItems: string[];              // IDs of scope items to bid on
  
  // Timeline
  dueDate: Date;
  startDateRange?: { from: Date; to: Date };
  
  // Recipients
  contractorIds: string[];
  
  // Status
  status: BidRequestStatus;
  sentAt?: Date;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

export type BidRequestStatus =
  | 'draft'
  | 'sent'
  | 'closed'
  | 'awarded';

export interface Bid {
  id: string;
  bidRequestId: string;
  contractorId: string;
  projectId: string;
  
  // Bid details
  totalAmount: number;
  laborAmount?: number;
  materialsAmount?: number;
  
  // Line items
  lineItems: BidLineItem[];
  
  // Timeline
  estimatedDays: number;
  proposedStartDate?: Date;
  
  // Terms
  warrantyPeriod?: number;           // Months
  paymentSchedule?: PaymentMilestone[];
  validUntil?: Date;
  
  // Files
  attachments?: BidAttachment[];
  
  // Status
  status: BidStatus;
  submittedAt?: Date;
  
  // Notes
  contractorNotes?: string;
  internalNotes?: string;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

export interface BidLineItem {
  scopeItemId?: string;
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalPrice: number;
  category?: string;
}

export interface PaymentMilestone {
  name: string;
  percentOfTotal: number;
  dueOn: 'start' | 'completion' | 'specific_date';
  specificDate?: Date;
}

export interface BidAttachment {
  id: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  uploadedAt: Date;
}

export type BidStatus =
  | 'invited'        // Contractor invited but not responded
  | 'pending'        // Bid submitted, awaiting review
  | 'under_review'   // Being actively evaluated
  | 'accepted'       // Bid was accepted
  | 'rejected'       // Bid was rejected
  | 'withdrawn'      // Contractor withdrew bid
  | 'expired';       // Bid validity expired
```

### Performance Tracking

```typescript
// src/types/contractor-performance.ts

export interface ContractorReview {
  id: string;
  contractorId: string;
  projectId: string;
  reviewerId: string;
  
  // Ratings (1-5)
  overallRating: number;
  qualityRating: number;
  communicationRating: number;
  punctualityRating: number;
  cleanlinessRating: number;
  valueRating: number;
  
  // Yes/No questions
  wouldHireAgain: boolean;
  completedOnTime: boolean;
  stayedOnBudget: boolean;
  
  // Details
  pros?: string;
  cons?: string;
  notes?: string;
  
  // Visibility
  isPublic: boolean;                 // Can be shared
  
  // Timestamps
  projectCompletedAt?: Date;
  createdAt: Date;
}

export interface ContractorAssignment {
  id: string;
  contractorId: string;
  projectId: string;
  
  // Assignment scope
  phaseId?: string;
  scopeItemIds: string[];
  
  // Timeline
  scheduledStartDate: Date;
  scheduledEndDate: Date;
  actualStartDate?: Date;
  actualEndDate?: Date;
  
  // Financials
  agreedAmount: number;
  paidAmount: number;
  paymentStatus: PaymentStatus;
  
  // Status
  status: AssignmentStatus;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

export type AssignmentStatus =
  | 'scheduled'
  | 'in_progress'
  | 'completed'
  | 'on_hold'
  | 'cancelled';

export type PaymentStatus =
  | 'not_started'
  | 'partial'
  | 'complete';
```

---

## 🧩 Feature Modules

### 1. Contractor Directory

```
┌────────────────────────────────────────────────────────────────┐
│                    CONTRACTOR DIRECTORY                         │
├────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────┐  ┌──────────────────────────────────────┐│
│  │ Filters          │  │ Contractor Cards                     ││
│  │                  │  │                                      ││
│  │ [x] Active       │  │ ┌────────────────────────────────┐  ││
│  │ [ ] Inactive     │  │ │ 🔧 ABC Plumbing Co.            │  ││
│  │                  │  │ │ ★★★★★ (4.8) | 12 projects     │  ││
│  │ Specialty:       │  │ │ Plumbing, HVAC                 │  ││
│  │ [ ] Plumbing     │  │ │ License: Valid until Dec 2026  │  ││
│  │ [ ] Electrical   │  │ │ 📞 555-1234  ✉️ contact@abc.com│  ││
│  │ [ ] HVAC         │  │ │ [View] [Request Bid] [Assign]  │  ││
│  │ [ ] Roofing      │  │ └────────────────────────────────┘  ││
│  │ [ ] Flooring     │  │                                      ││
│  │ [ ] Painting     │  │ ┌────────────────────────────────┐  ││
│  │ ...              │  │ │ 🎨 Quality Painters LLC        │  ││
│  │                  │  │ │ ★★★★☆ (4.2) | 8 projects      │  ││
│  │ Rating:          │  │ │ Painting, Drywall              │  ││
│  │ ★★★★☆ & up     │  │ │ ⚠️ Insurance expires in 30 days│  ││
│  │                  │  │ │ [View] [Request Bid] [Assign]  │  ││
│  │ [x] Preferred    │  │ └────────────────────────────────┘  ││
│  │                  │  │                                      ││
│  └──────────────────┘  └──────────────────────────────────────┘│
│                                                                  │
│  [+ Add Contractor]                                             │
│                                                                  │
└────────────────────────────────────────────────────────────────┘
```

### 2. Contractor Profile

```
┌────────────────────────────────────────────────────────────────┐
│  ← Back to Directory           🔧 ABC Plumbing Co.              │
├────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ [Contact] [Compliance] [Performance] [Projects] [Documents] ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  CONTACT TAB:                                                    │
│  ┌─────────────────────┐  ┌──────────────────────────────────┐ │
│  │ Primary Contact     │  │ Business Details                 │ │
│  │                     │  │                                  │ │
│  │ John Smith          │  │ Type: Subcontractor              │ │
│  │ 📞 (555) 123-4567  │  │ Specialties: Plumbing, HVAC      │ │
│  │ ✉️ john@abcplumb.com│  │ Service Area: 55401, 55402...   │ │
│  │ 🌐 abcplumbing.com  │  │                                  │ │
│  │                     │  │ Hourly Rate: $85/hr              │ │
│  │ 123 Main Street     │  │ Markup: 15%                      │ │
│  │ Minneapolis, MN     │  │ Payment: Net 30                  │ │
│  │ 55401               │  │                                  │ │
│  └─────────────────────┘  └──────────────────────────────────┘ │
│                                                                  │
│  COMPLIANCE TAB:                                                 │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ LICENSE                        INSURANCE                    ││
│  │ ┌───────────────────┐         ┌───────────────────┐        ││
│  │ │ ✅ MN-PL-123456    │         │ ✅ State Farm       │        ││
│  │ │ Expires: Dec 2026 │         │ Policy: INS-789    │        ││
│  │ │ Status: Active    │         │ Coverage: $1M      │        ││
│  │ │ [View License]    │         │ Expires: Jun 2025  │        ││
│  │ └───────────────────┘         │ [View COI]         │        ││
│  │                               └───────────────────┘        ││
│  │                                                              ││
│  │ [Upload Documents]  [Set Expiration Alerts]                 ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  PERFORMANCE TAB:                                                │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │         ★★★★★                                               ││
│  │         4.8 Average (12 reviews)                            ││
│  │                                                              ││
│  │  Quality:       ████████████░░ 4.7                         ││
│  │  Communication: █████████████░ 4.9                         ││
│  │  Punctuality:   ████████████░░ 4.6                         ││
│  │  Cleanliness:   █████████████░ 4.8                         ││
│  │  Value:         ███████████░░░ 4.5                         ││
│  │                                                              ││
│  │  ✅ 92% On Time  |  ✅ 88% On Budget  |  ✅ 100% Would Rehire ││
│  │                                                              ││
│  │  Recent Review:                                              ││
│  │  "Great work on the kitchen repipe. Professional crew..."   ││
│  │  — Oak Street Flip, Oct 2025                                 ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  [Edit Contractor] [Request Bid] [Add to Project]               │
│                                                                  │
└────────────────────────────────────────────────────────────────┘
```

### 3. Bid Management

```
┌────────────────────────────────────────────────────────────────┐
│                    BID COMPARISON VIEW                          │
├────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Project: Oak Street Flip                                        │
│  Scope: Kitchen Renovation (15 items)                            │
│  Requested: Dec 15  |  Due: Dec 22  |  3 bids received          │
│                                                                  │
│  ┌────────────────┬────────────────┬────────────────┐           │
│  │ ABC Plumbing   │ XYZ Kitchen Co │ Budget Build   │           │
│  │ ★★★★★ (4.8)   │ ★★★★☆ (4.2)   │ ★★★☆☆ (3.5)   │           │
│  ├────────────────┼────────────────┼────────────────┤           │
│  │ $18,500        │ $22,000        │ $15,200        │           │
│  │ Labor: $12,000 │ Labor: $15,000 │ Labor: $9,500  │           │
│  │ Mat'l: $6,500  │ Mat'l: $7,000  │ Mat'l: $5,700  │           │
│  ├────────────────┼────────────────┼────────────────┤           │
│  │ 14 days        │ 12 days        │ 18 days        │           │
│  │ Start: Jan 5   │ Start: Jan 8   │ Start: Jan 3   │           │
│  ├────────────────┼────────────────┼────────────────┤           │
│  │ 1-year warranty│ 2-year warranty│ 90-day warranty│           │
│  ├────────────────┼────────────────┼────────────────┤           │
│  │ 50% up front   │ 25/25/50       │ Net 30         │           │
│  │ 50% completion │                │                │           │
│  ├────────────────┼────────────────┼────────────────┤           │
│  │ [View Details] │ [View Details] │ [View Details] │           │
│  │ [✓ ACCEPT]     │ [Accept]       │ [Accept]       │           │
│  │ [Negotiate]    │ [Negotiate]    │ [Decline]      │           │
│  └────────────────┴────────────────┴────────────────┘           │
│                                                                  │
│  📊 Analysis: ABC offers best value (quality × price × time)    │
│                                                                  │
└────────────────────────────────────────────────────────────────┘
```

---

## 🔌 API Design

### Contractor CRUD

```typescript
// src/app/api/contractors/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

const contractorSchema = z.object({
  companyName: z.string().min(1),
  contactFirstName: z.string().min(1),
  contactLastName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(10),
  website: z.string().url().optional(),
  vendorType: z.enum(['contractor', 'subcontractor', 'supplier', 'service_provider']),
  specialties: z.array(z.string()).min(1),
  addressStreet: z.string().optional(),
  addressCity: z.string().optional(),
  addressState: z.string().optional(),
  addressZip: z.string().optional(),
  licenseNumber: z.string().optional(),
  licenseState: z.string().optional(),
  licenseExpiration: z.string().datetime().optional(),
  insuranceCarrier: z.string().optional(),
  insurancePolicyNumber: z.string().optional(),
  insuranceExpiration: z.string().datetime().optional(),
  insuranceCoverageAmount: z.number().optional(),
  hourlyRate: z.number().optional(),
  markupPercent: z.number().min(0).max(100).optional(),
  paymentTerms: z.string().optional(),
  status: z.enum(['active', 'inactive', 'on_hold', 'blocked']).default('active'),
  isPreferred: z.boolean().default(false),
  notes: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

// GET /api/contractors - List all contractors
export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const { searchParams } = new URL(request.url);
  const specialty = searchParams.get('specialty');
  const status = searchParams.get('status');
  const isPreferred = searchParams.get('isPreferred');
  const search = searchParams.get('search');
  
  let query = supabase
    .from('contractors')
    .select('*')
    .eq('user_id', user.id)
    .order('company_name');
  
  if (specialty) {
    query = query.contains('specialties', [specialty]);
  }
  if (status) {
    query = query.eq('status', status);
  }
  if (isPreferred === 'true') {
    query = query.eq('is_preferred', true);
  }
  if (search) {
    query = query.or(`company_name.ilike.%${search}%,contact_first_name.ilike.%${search}%,contact_last_name.ilike.%${search}%`);
  }
  
  const { data, error } = await query;
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  
  return NextResponse.json(data);
}

// POST /api/contractors - Create contractor
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const body = await request.json();
  const validated = contractorSchema.parse(body);
  
  const { data, error } = await supabase
    .from('contractors')
    .insert({
      user_id: user.id,
      ...validated,
    })
    .select()
    .single();
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  
  return NextResponse.json(data, { status: 201 });
}
```

### Bid Management

```typescript
// src/app/api/bids/route.ts

// POST /api/bids/request - Create bid request
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const body = await request.json();
  const { projectId, title, description, scopeItems, dueDate, contractorIds } = body;
  
  // Create bid request
  const { data: bidRequest, error: requestError } = await supabase
    .from('bid_requests')
    .insert({
      project_id: projectId,
      title,
      description,
      scope_items: scopeItems,
      due_date: dueDate,
      status: 'draft',
    })
    .select()
    .single();
  
  if (requestError) {
    return NextResponse.json({ error: requestError.message }, { status: 500 });
  }
  
  // Create bid invitations for each contractor
  const invitations = contractorIds.map((contractorId: string) => ({
    bid_request_id: bidRequest.id,
    contractor_id: contractorId,
    project_id: projectId,
    status: 'invited',
  }));
  
  const { error: inviteError } = await supabase
    .from('bids')
    .insert(invitations);
  
  if (inviteError) {
    return NextResponse.json({ error: inviteError.message }, { status: 500 });
  }
  
  // TODO: Send email notifications to contractors
  
  return NextResponse.json(bidRequest, { status: 201 });
}

// PATCH /api/bids/[id] - Submit or update bid
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = await createClient();
  const body = await request.json();
  
  const { data, error } = await supabase
    .from('bids')
    .update({
      ...body,
      submitted_at: body.status === 'pending' ? new Date().toISOString() : undefined,
    })
    .eq('id', params.id)
    .select()
    .single();
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  
  return NextResponse.json(data);
}

// POST /api/bids/[id]/accept - Accept a bid
export async function acceptBid(bidId: string) {
  const supabase = await createClient();
  
  // Get bid details
  const { data: bid } = await supabase
    .from('bids')
    .select('*, bid_request:bid_requests(*)')
    .eq('id', bidId)
    .single();
  
  if (!bid) throw new Error('Bid not found');
  
  // Update accepted bid
  await supabase
    .from('bids')
    .update({ status: 'accepted' })
    .eq('id', bidId);
  
  // Reject other bids for same request
  await supabase
    .from('bids')
    .update({ status: 'rejected' })
    .eq('bid_request_id', bid.bid_request_id)
    .neq('id', bidId)
    .in('status', ['pending', 'under_review', 'invited']);
  
  // Close bid request
  await supabase
    .from('bid_requests')
    .update({ status: 'awarded' })
    .eq('id', bid.bid_request_id);
  
  // Create contractor assignment
  await supabase
    .from('contractor_assignments')
    .insert({
      contractor_id: bid.contractor_id,
      project_id: bid.project_id,
      scope_item_ids: bid.bid_request.scope_items,
      agreed_amount: bid.total_amount,
      scheduled_start_date: bid.proposed_start_date,
      status: 'scheduled',
    });
  
  return bid;
}
```

### Performance Tracking

```typescript
// src/app/api/contractors/[id]/reviews/route.ts

// POST - Add review
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const body = await request.json();
  
  const { data: review, error } = await supabase
    .from('contractor_reviews')
    .insert({
      contractor_id: params.id,
      reviewer_id: user.id,
      ...body,
    })
    .select()
    .single();
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  
  // Update contractor's average rating
  await updateContractorMetrics(params.id);
  
  return NextResponse.json(review, { status: 201 });
}

async function updateContractorMetrics(contractorId: string) {
  const supabase = await createClient();
  
  // Get all reviews for this contractor
  const { data: reviews } = await supabase
    .from('contractor_reviews')
    .select('*')
    .eq('contractor_id', contractorId);
  
  if (!reviews || reviews.length === 0) return;
  
  // Calculate metrics
  const avgRating = reviews.reduce((sum, r) => sum + r.overall_rating, 0) / reviews.length;
  const onTimeCount = reviews.filter(r => r.completed_on_time).length;
  const onBudgetCount = reviews.filter(r => r.stayed_on_budget).length;
  
  // Update contractor
  await supabase
    .from('contractors')
    .update({
      average_rating: Math.round(avgRating * 10) / 10,
      total_projects: reviews.length,
      on_time_percent: Math.round((onTimeCount / reviews.length) * 100),
      on_budget_percent: Math.round((onBudgetCount / reviews.length) * 100),
    })
    .eq('id', contractorId);
}
```

---

## 💾 Database Schema

```sql
-- Contractor Management Tables

-- Main contractors table
CREATE TABLE contractors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Basic info
    company_name TEXT NOT NULL,
    contact_first_name TEXT NOT NULL,
    contact_last_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    website TEXT,
    
    -- Address
    address_street TEXT,
    address_city TEXT,
    address_state TEXT,
    address_zip TEXT,
    
    -- Business details
    vendor_type TEXT NOT NULL CHECK (vendor_type IN ('contractor', 'subcontractor', 'supplier', 'service_provider')),
    specialties TEXT[] NOT NULL,
    service_area TEXT[],
    
    -- Compliance
    license_number TEXT,
    license_state TEXT,
    license_expiration DATE,
    insurance_carrier TEXT,
    insurance_policy_number TEXT,
    insurance_expiration DATE,
    insurance_coverage_amount NUMERIC,
    bonded_amount NUMERIC,
    
    -- Financial
    hourly_rate NUMERIC,
    markup_percent NUMERIC,
    payment_terms TEXT,
    tax_id TEXT,
    
    -- Status
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'on_hold', 'blocked')),
    is_preferred BOOLEAN DEFAULT false,
    notes TEXT,
    tags TEXT[],
    
    -- Computed metrics (updated by triggers)
    average_rating NUMERIC,
    total_projects INTEGER DEFAULT 0,
    total_spent NUMERIC DEFAULT 0,
    on_time_percent INTEGER,
    on_budget_percent INTEGER,
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_contractors_user ON contractors(user_id);
CREATE INDEX idx_contractors_specialties ON contractors USING GIN(specialties);
CREATE INDEX idx_contractors_status ON contractors(status);

-- Bid requests
CREATE TABLE bid_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    
    title TEXT NOT NULL,
    description TEXT,
    scope_items UUID[],
    
    due_date TIMESTAMPTZ NOT NULL,
    start_date_range_from DATE,
    start_date_range_to DATE,
    
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'closed', 'awarded')),
    sent_at TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Individual bids
CREATE TABLE bids (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bid_request_id UUID NOT NULL REFERENCES bid_requests(id) ON DELETE CASCADE,
    contractor_id UUID NOT NULL REFERENCES contractors(id) ON DELETE CASCADE,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    
    -- Bid amounts
    total_amount NUMERIC,
    labor_amount NUMERIC,
    materials_amount NUMERIC,
    
    -- Line items (JSON array)
    line_items JSONB DEFAULT '[]',
    
    -- Timeline
    estimated_days INTEGER,
    proposed_start_date DATE,
    
    -- Terms
    warranty_period INTEGER, -- months
    payment_schedule JSONB,
    valid_until DATE,
    
    -- Files
    attachments JSONB DEFAULT '[]',
    
    -- Status
    status TEXT NOT NULL DEFAULT 'invited' CHECK (status IN ('invited', 'pending', 'under_review', 'accepted', 'rejected', 'withdrawn', 'expired')),
    submitted_at TIMESTAMPTZ,
    
    -- Notes
    contractor_notes TEXT,
    internal_notes TEXT,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    
    UNIQUE(bid_request_id, contractor_id)
);

-- Contractor reviews
CREATE TABLE contractor_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contractor_id UUID NOT NULL REFERENCES contractors(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    reviewer_id UUID NOT NULL REFERENCES auth.users(id),
    
    -- Ratings (1-5)
    overall_rating INTEGER NOT NULL CHECK (overall_rating BETWEEN 1 AND 5),
    quality_rating INTEGER CHECK (quality_rating BETWEEN 1 AND 5),
    communication_rating INTEGER CHECK (communication_rating BETWEEN 1 AND 5),
    punctuality_rating INTEGER CHECK (punctuality_rating BETWEEN 1 AND 5),
    cleanliness_rating INTEGER CHECK (cleanliness_rating BETWEEN 1 AND 5),
    value_rating INTEGER CHECK (value_rating BETWEEN 1 AND 5),
    
    -- Boolean metrics
    would_hire_again BOOLEAN,
    completed_on_time BOOLEAN,
    stayed_on_budget BOOLEAN,
    
    -- Text
    pros TEXT,
    cons TEXT,
    notes TEXT,
    
    is_public BOOLEAN DEFAULT false,
    project_completed_at DATE,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Contractor assignments to projects
CREATE TABLE contractor_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contractor_id UUID NOT NULL REFERENCES contractors(id) ON DELETE CASCADE,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    
    phase_id UUID,
    scope_item_ids UUID[],
    
    -- Timeline
    scheduled_start_date DATE NOT NULL,
    scheduled_end_date DATE NOT NULL,
    actual_start_date DATE,
    actual_end_date DATE,
    
    -- Financials
    agreed_amount NUMERIC NOT NULL,
    paid_amount NUMERIC DEFAULT 0,
    payment_status TEXT DEFAULT 'not_started' CHECK (payment_status IN ('not_started', 'partial', 'complete')),
    
    -- Status
    status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'on_hold', 'cancelled')),
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS Policies
ALTER TABLE contractors ENABLE ROW LEVEL SECURITY;
ALTER TABLE bid_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE bids ENABLE ROW LEVEL SECURITY;
ALTER TABLE contractor_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE contractor_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own contractors"
    ON contractors FOR ALL
    USING (user_id = auth.uid());

CREATE POLICY "Users can manage bid requests for own projects"
    ON bid_requests FOR ALL
    USING (
        project_id IN (SELECT id FROM projects WHERE user_id = auth.uid())
    );

CREATE POLICY "Users can manage bids for own projects"
    ON bids FOR ALL
    USING (
        project_id IN (SELECT id FROM projects WHERE user_id = auth.uid())
    );

CREATE POLICY "Users can manage reviews they created"
    ON contractor_reviews FOR ALL
    USING (reviewer_id = auth.uid());

CREATE POLICY "Users can manage assignments for own projects"
    ON contractor_assignments FOR ALL
    USING (
        project_id IN (SELECT id FROM projects WHERE user_id = auth.uid())
    );

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER contractors_updated_at
    BEFORE UPDATE ON contractors
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER bids_updated_at
    BEFORE UPDATE ON bids
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
```

---

## 🧩 Component Architecture

### File Structure

```
src/
├── types/
│   ├── contractors.ts              # Contractor interfaces
│   └── bids.ts                     # Bid interfaces
│
├── lib/
│   └── contractors/
│       ├── index.ts                # Barrel export
│       └── bid-comparison.ts       # Bid analysis utilities
│
├── components/
│   └── contractors/
│       ├── ContractorDirectory.tsx # Main list view
│       ├── ContractorCard.tsx      # Card in directory
│       ├── ContractorProfile.tsx   # Full profile view
│       ├── ContractorForm.tsx      # Add/edit form
│       ├── ComplianceSection.tsx   # License/insurance display
│       ├── PerformanceSection.tsx  # Ratings and metrics
│       ├── ReviewForm.tsx          # Add review form
│       ├── BidRequestForm.tsx      # Create bid request
│       ├── BidComparison.tsx       # Side-by-side bids
│       ├── BidCard.tsx             # Single bid display
│       ├── AssignmentManager.tsx   # Assign to project
│       └── ExpirationAlerts.tsx    # License/insurance warnings
│
├── hooks/
│   ├── use-contractors.ts          # Contractor CRUD hook
│   └── use-bids.ts                 # Bid management hook
│
└── app/
    ├── (app)/
    │   └── contractors/
    │       ├── page.tsx            # Directory page
    │       ├── [id]/
    │       │   └── page.tsx        # Profile page
    │       └── new/
    │           └── page.tsx        # Add contractor
    │
    └── api/
        ├── contractors/
        │   ├── route.ts            # List/create
        │   ├── [id]/
        │   │   ├── route.ts        # Get/update/delete
        │   │   └── reviews/
        │   │       └── route.ts    # Manage reviews
        │
        └── bids/
            ├── route.ts            # Create bid request
            └── [id]/
                └── route.ts        # Update bid status
```

---

## 📅 Implementation Plan

### Phase 1: Data Model & API (3 days)

| Task | Description | Est. |
|------|-------------|------|
| Type definitions | TypeScript interfaces | 2h |
| Database migration | All tables and indexes | 3h |
| Contractor CRUD API | List, create, update, delete | 4h |
| RLS policies | Row-level security | 2h |

### Phase 2: Contractor Directory (2 days)

| Task | Description | Est. |
|------|-------------|------|
| ContractorDirectory page | Main listing with filters | 4h |
| ContractorCard component | Card display | 2h |
| ContractorForm | Add/edit form | 4h |
| Search and filter | Search, specialty, status | 3h |

### Phase 3: Contractor Profile (2 days)

| Task | Description | Est. |
|------|-------------|------|
| ContractorProfile page | Full profile view | 4h |
| ComplianceSection | License/insurance display | 2h |
| PerformanceSection | Ratings and reviews | 3h |
| Document upload | File attachments | 3h |

### Phase 4: Bid Management (3 days)

| Task | Description | Est. |
|------|-------------|------|
| Bid request API | Create and send requests | 4h |
| BidRequestForm | UI for creating requests | 3h |
| Bid submission API | Contractors submit bids | 3h |
| BidComparison | Side-by-side comparison | 4h |
| Accept/reject flow | Award bid workflow | 3h |

### Phase 5: Integration (2 days)

| Task | Description | Est. |
|------|-------------|------|
| Timeline integration | Assign contractors to phases | 4h |
| Project integration | Link to scope items | 3h |
| Expiration alerts | Upcoming expirations | 3h |
| Performance analytics | Metrics dashboard | 4h |

**Total Estimated Time: 12-14 days**

---

## 🧪 Testing Strategy

### Unit Tests

```typescript
// src/lib/contractors/__tests__/bid-comparison.test.ts

import { describe, it, expect } from 'vitest';
import { compareBids, scoreBid } from '../bid-comparison';

describe('compareBids', () => {
  const bids = [
    { id: '1', totalAmount: 20000, estimatedDays: 14, warrantyPeriod: 12 },
    { id: '2', totalAmount: 18000, estimatedDays: 18, warrantyPeriod: 6 },
    { id: '3', totalAmount: 22000, estimatedDays: 10, warrantyPeriod: 24 },
  ];
  
  it('should rank bids by value score', () => {
    const ranked = compareBids(bids, { prioritize: 'value' });
    expect(ranked[0].id).toBe('1'); // Best balance
  });
  
  it('should rank bids by price when prioritizing cost', () => {
    const ranked = compareBids(bids, { prioritize: 'cost' });
    expect(ranked[0].id).toBe('2'); // Lowest price
  });
  
  it('should rank bids by speed when prioritizing time', () => {
    const ranked = compareBids(bids, { prioritize: 'speed' });
    expect(ranked[0].id).toBe('3'); // Fastest
  });
});
```

---

## 📊 Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Contractor records per user | > 10 avg | Count per user |
| Bid request usage | > 30% of projects | Track bid requests |
| Review completion | > 50% of completed projects | Track reviews |
| Time savings | 2+ hours per project | User survey |

---

## 🔗 Related Documentation

- [AI Recommendations Spec](./AI_RECOMMENDATIONS_SPEC.md)
- [ROI Calculator Spec](./ROI_CALCULATOR_SPEC.md)
- [PRD - Vendor Management Module](../PRD.md#9-vendor-management-module)
