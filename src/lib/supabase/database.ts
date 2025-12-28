import { supabase } from './client'
import { RehabProject, PropertyAssessment, ScopeItem, MarketComparable, Recommendation } from '@/types/rehab'
import { RehabProject as RehabProjectDB, ProjectStatus } from '@/types/database'

// Filter options for projects list
export interface ProjectFilters {
  status?: ProjectStatus | 'all'
  strategy?: string | 'all'
  dateFrom?: string
  dateTo?: string
  search?: string
  includeDeleted?: boolean
  includeArchived?: boolean
}

// Project operations
export const projectService = {
  // Create a new project
  async create(project: Partial<RehabProject>): Promise<RehabProject | null> {
    try {
      const { data, error } = await supabase
        .from('rehab_projects')
        .insert({
          project_name: project.projectName,
          address_street: project.address?.street,
          address_city: project.address?.city,
          address_state: project.address?.state,
          address_zip: project.address?.zip,
          square_feet: project.squareFeet,
          year_built: project.yearBuilt,
          property_type: project.propertyType,
          bedrooms: project.bedrooms,
          bathrooms: project.bathrooms,
          investment_strategy: project.investmentStrategy,
          target_buyer: project.targetBuyer,
          hold_period_months: project.holdPeriodMonths,
          target_roi: project.targetROI,
          max_budget: project.maxBudget,
          arv: project.arv,
          purchase_price: project.purchasePrice,
          neighborhood_comp_avg: project.neighborhoodCompAvg,
          status: project.status || 'draft'
        })
        .select()
        .single()

      if (error) throw error
      return data as RehabProject
    } catch (error) {
      console.error('Error creating project:', error)
      return null
    }
  },

  // Get a project by ID
  async getById(id: string): Promise<RehabProject | null> {
    try {
      const { data, error } = await supabase
        .from('rehab_projects')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error
      return data as RehabProject
    } catch (error) {
      console.error('Error getting project:', error)
      return null
    }
  },

  // Get all projects for a user (excludes deleted by default)
  async getAll(filters?: ProjectFilters): Promise<RehabProjectDB[]> {
    try {
      let query = supabase
        .from('rehab_projects')
        .select('*')

      // Exclude deleted projects unless explicitly requested
      if (!filters?.includeDeleted) {
        query = query.is('deleted_at', null)
      }

      // Exclude archived projects unless explicitly requested
      if (!filters?.includeArchived) {
        query = query.neq('status', 'archived')
      }

      // Apply status filter
      if (filters?.status && filters.status !== 'all') {
        query = query.eq('status', filters.status)
      }

      // Apply strategy filter
      if (filters?.strategy && filters.strategy !== 'all') {
        query = query.eq('investment_strategy', filters.strategy)
      }

      // Apply date range filter
      if (filters?.dateFrom) {
        query = query.gte('created_at', filters.dateFrom)
      }
      if (filters?.dateTo) {
        query = query.lte('created_at', filters.dateTo)
      }

      // Apply search filter (uses full-text search on project_name and address)
      if (filters?.search && filters.search.trim()) {
        const searchTerm = filters.search.trim()
        query = query.or(
          `project_name.ilike.%${searchTerm}%,address_street.ilike.%${searchTerm}%,address_city.ilike.%${searchTerm}%,address_state.ilike.%${searchTerm}%,address_zip.ilike.%${searchTerm}%`
        )
      }

      query = query.order('updated_at', { ascending: false })

      const { data, error } = await query

      if (error) throw error
      return data as RehabProjectDB[]
    } catch (error) {
      console.error('Error getting projects:', error)
      return []
    }
  },

  // Update a project
  async update(id: string, updates: Partial<RehabProject>): Promise<RehabProject | null> {
    try {
      const { data, error } = await supabase
        .from('rehab_projects')
        .update({
          project_name: updates.projectName,
          address_street: updates.address?.street,
          address_city: updates.address?.city,
          address_state: updates.address?.state,
          address_zip: updates.address?.zip,
          square_feet: updates.squareFeet,
          year_built: updates.yearBuilt,
          property_type: updates.propertyType,
          bedrooms: updates.bedrooms,
          bathrooms: updates.bathrooms,
          investment_strategy: updates.investmentStrategy,
          target_buyer: updates.targetBuyer,
          hold_period_months: updates.holdPeriodMonths,
          target_roi: updates.targetROI,
          max_budget: updates.maxBudget,
          arv: updates.arv,
          purchase_price: updates.purchasePrice,
          neighborhood_comp_avg: updates.neighborhoodCompAvg,
          status: updates.status,
          total_estimated_cost: updates.totalEstimatedCost,
          total_actual_cost: updates.totalActualCost,
          estimated_days: updates.estimatedDays,
          priority_score: updates.priorityScore,
          roi_score: updates.roiScore
        })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data as RehabProject
    } catch (error) {
      console.error('Error updating project:', error)
      return null
    }
  },

  // Soft delete a project (sets deleted_at timestamp)
  async softDelete(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('rehab_projects')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', id)

      if (error) throw error
      return true
    } catch (error) {
      console.error('Error soft deleting project:', error)
      return false
    }
  },

  // Hard delete a project (permanent - use with caution)
  async hardDelete(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('rehab_projects')
        .delete()
        .eq('id', id)

      if (error) throw error
      return true
    } catch (error) {
      console.error('Error hard deleting project:', error)
      return false
    }
  },

  // Archive a project (sets status to 'archived')
  async archive(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('rehab_projects')
        .update({ status: 'archived', updated_at: new Date().toISOString() })
        .eq('id', id)

      if (error) throw error
      return true
    } catch (error) {
      console.error('Error archiving project:', error)
      return false
    }
  },

  // Unarchive a project (sets status back to 'draft')
  async unarchive(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('rehab_projects')
        .update({ status: 'draft', updated_at: new Date().toISOString() })
        .eq('id', id)

      if (error) throw error
      return true
    } catch (error) {
      console.error('Error unarchiving project:', error)
      return false
    }
  },

  // Restore a soft-deleted project
  async restore(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('rehab_projects')
        .update({ deleted_at: null, updated_at: new Date().toISOString() })
        .eq('id', id)

      if (error) throw error
      return true
    } catch (error) {
      console.error('Error restoring project:', error)
      return false
    }
  },

  // Duplicate a project
  async duplicate(id: string): Promise<RehabProjectDB | null> {
    try {
      // First, get the original project
      const { data: original, error: fetchError } = await supabase
        .from('rehab_projects')
        .select('*')
        .eq('id', id)
        .single()

      if (fetchError) throw fetchError
      if (!original) throw new Error('Project not found')

      // Create a copy with modified fields
      const { id: _id, created_at: _created, updated_at: _updated, deleted_at: _deleted, ...projectData } = original

      const duplicatedProject = {
        ...projectData,
        project_name: `${original.project_name} (Copy)`,
        status: 'draft',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      const { data: newProject, error: insertError } = await supabase
        .from('rehab_projects')
        .insert(duplicatedProject)
        .select()
        .single()

      if (insertError) throw insertError
      return newProject as RehabProjectDB
    } catch (error) {
      console.error('Error duplicating project:', error)
      return null
    }
  },

  // Legacy delete method (now calls softDelete for backward compatibility)
  async delete(id: string): Promise<boolean> {
    return this.softDelete(id)
  }
}

// Assessment operations
export const assessmentService = {
  // Create or update an assessment
  async upsert(projectId: string, assessment: PropertyAssessment): Promise<PropertyAssessment | null> {
    try {
      const { data, error } = await supabase
        .from('property_assessments')
        .upsert({
          project_id: projectId,
          room_type: assessment.roomType,
          room_name: assessment.roomName,
          condition: assessment.condition,
          components: assessment.components,
          notes: assessment.notes,
          photos: assessment.photos
        })
        .select()
        .single()

      if (error) throw error
      return data as PropertyAssessment
    } catch (error) {
      console.error('Error upserting assessment:', error)
      return null
    }
  },

  // Get assessments for a project
  async getByProjectId(projectId: string): Promise<PropertyAssessment[]> {
    try {
      const { data, error } = await supabase
        .from('property_assessments')
        .select('*')
        .eq('project_id', projectId)

      if (error) throw error
      return data as PropertyAssessment[]
    } catch (error) {
      console.error('Error getting assessments:', error)
      return []
    }
  }
}

// Scope item operations
export const scopeItemService = {
  // Create a scope item
  async create(projectId: string, item: ScopeItem): Promise<ScopeItem | null> {
    try {
      const { data, error } = await supabase
        .from('rehab_scope_items')
        .insert({
          project_id: projectId,
          category: item.category,
          subcategory: item.subcategory,
          item_name: item.itemName,
          description: item.description,
          location: item.location,
          quantity: item.quantity,
          unit_of_measure: item.unitOfMeasure,
          material_cost: item.materialCost,
          labor_cost: item.laborCost,
          total_cost: item.totalCost,
          priority: item.priority,
          roi_impact: item.roiImpact,
          days_required: item.daysRequired,
          depends_on: item.dependsOn,
          phase: item.phase,
          included: item.included,
          completed: item.completed
        })
        .select()
        .single()

      if (error) throw error
      return data as ScopeItem
    } catch (error) {
      console.error('Error creating scope item:', error)
      return null
    }
  },

  // Get scope items for a project
  async getByProjectId(projectId: string): Promise<ScopeItem[]> {
    try {
      const { data, error } = await supabase
        .from('rehab_scope_items')
        .select('*')
        .eq('project_id', projectId)
        .order('phase', { ascending: true })

      if (error) throw error
      return data as ScopeItem[]
    } catch (error) {
      console.error('Error getting scope items:', error)
      return []
    }
  },

  // Update a scope item
  async update(id: string, updates: Partial<ScopeItem>): Promise<ScopeItem | null> {
    try {
      const { data, error } = await supabase
        .from('rehab_scope_items')
        .update({
          category: updates.category,
          subcategory: updates.subcategory,
          item_name: updates.itemName,
          description: updates.description,
          location: updates.location,
          quantity: updates.quantity,
          unit_of_measure: updates.unitOfMeasure,
          material_cost: updates.materialCost,
          labor_cost: updates.laborCost,
          total_cost: updates.totalCost,
          priority: updates.priority,
          roi_impact: updates.roiImpact,
          days_required: updates.daysRequired,
          depends_on: updates.dependsOn,
          phase: updates.phase,
          included: updates.included,
          completed: updates.completed
        })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data as ScopeItem
    } catch (error) {
      console.error('Error updating scope item:', error)
      return null
    }
  },

  // Delete a scope item
  async delete(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('rehab_scope_items')
        .delete()
        .eq('id', id)

      if (error) throw error
      return true
    } catch (error) {
      console.error('Error deleting scope item:', error)
      return false
    }
  }
}

// Market comparable operations
export const marketComparableService = {
  // Create a market comparable
  async create(projectId: string, comparable: MarketComparable): Promise<MarketComparable | null> {
    try {
      const { data, error } = await supabase
        .from('market_comparables')
        .insert({
          project_id: projectId,
          address: comparable.address,
          sale_price: comparable.salePrice,
          sale_date: comparable.saleDate.toISOString().split('T')[0],
          square_feet: comparable.squareFeet,
          features: comparable.features,
          distance_miles: comparable.distanceMiles,
          similarity_score: comparable.similarityScore
        })
        .select()
        .single()

      if (error) throw error
      return data as MarketComparable
    } catch (error) {
      console.error('Error creating market comparable:', error)
      return null
    }
  },

  // Get market comparables for a project
  async getByProjectId(projectId: string): Promise<MarketComparable[]> {
    try {
      const { data, error } = await supabase
        .from('market_comparables')
        .select('*')
        .eq('project_id', projectId)
        .order('sale_date', { ascending: false })

      if (error) throw error
      return data as MarketComparable[]
    } catch (error) {
      console.error('Error getting market comparables:', error)
      return []
    }
  }
}

// Recommendation operations
export const recommendationService = {
  // Create a recommendation
  async create(projectId: string, recommendation: Recommendation): Promise<Recommendation | null> {
    try {
      const { data, error } = await supabase
        .from('rehab_recommendations')
        .insert({
          project_id: projectId,
          type: recommendation.type,
          title: recommendation.title,
          description: recommendation.description,
          estimated_cost: recommendation.estimatedCost,
          roi_impact: recommendation.roiImpact,
          time_impact_days: recommendation.timeImpactDays,
          market_data: recommendation.marketData,
          confidence_score: recommendation.confidenceScore,
          status: recommendation.status
        })
        .select()
        .single()

      if (error) throw error
      return data as Recommendation
    } catch (error) {
      console.error('Error creating recommendation:', error)
      return null
    }
  },

  // Get recommendations for a project
  async getByProjectId(projectId: string): Promise<Recommendation[]> {
    try {
      const { data, error } = await supabase
        .from('rehab_recommendations')
        .select('*')
        .eq('project_id', projectId)
        .order('confidence_score', { ascending: false })

      if (error) throw error
      return data as Recommendation[]
    } catch (error) {
      console.error('Error getting recommendations:', error)
      return []
    }
  }
}
