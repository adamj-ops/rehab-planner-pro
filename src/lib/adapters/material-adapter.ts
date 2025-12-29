/**
 * Material Adapter
 * 
 * Transforms between database types (snake_case) and UI types (camelCase).
 * Used to bridge the gap between Supabase responses and the design components.
 */

import type { MaterialLibrary } from '@/types/database'
import type { Material, MaterialType } from '@/types/design'

/**
 * Adapts a MaterialLibrary record from the database to a Material type for UI components.
 * Handles the snake_case to camelCase conversion.
 */
export function adaptMaterialFromDB(dbMaterial: MaterialLibrary): Material {
  return {
    id: dbMaterial.id,
    materialType: (dbMaterial.material_type as MaterialType) || 'flooring',
    materialCategory: dbMaterial.material_category,
    brand: dbMaterial.brand,
    productName: dbMaterial.product_name,
    modelNumber: dbMaterial.model_number,
    sku: dbMaterial.sku,
    description: dbMaterial.description,
    colorDescription: dbMaterial.color_description,
    finish: dbMaterial.finish,
    dimensions: dbMaterial.dimensions,
    thickness: dbMaterial.thickness,
    materialComposition: dbMaterial.material_composition,
    avgCostPerUnit: dbMaterial.avg_cost_per_unit,
    unitType: dbMaterial.unit_type,
    suppliers: dbMaterial.suppliers || [],
    typicalLeadTimeDays: dbMaterial.typical_lead_time_days,
    imageUrl: dbMaterial.image_url,
    swatchImageUrl: dbMaterial.swatch_image_url,
    additionalImages: dbMaterial.additional_images || [],
    recommendedFor: (dbMaterial.recommended_for || []) as Material['recommendedFor'],
    designStyles: (dbMaterial.design_styles || []) as Material['designStyles'],
    popular: dbMaterial.popular || false,
    isActive: dbMaterial.is_active || true,
    createdAt: dbMaterial.created_at ? new Date(dbMaterial.created_at) : new Date(),
    updatedAt: dbMaterial.updated_at ? new Date(dbMaterial.updated_at) : new Date(),
  }
}

/**
 * Adapts an array of MaterialLibrary records to Material types.
 */
export function adaptMaterialsFromDB(dbMaterials: MaterialLibrary[]): Material[] {
  return dbMaterials.map(adaptMaterialFromDB)
}

/**
 * Adapts a Material type back to a MaterialLibrary insert format.
 * Useful when saving to the database.
 */
export function adaptMaterialToDB(material: Partial<Material>): Partial<MaterialLibrary> {
  const result: Partial<MaterialLibrary> = {}
  
  if (material.materialType !== undefined) result.material_type = material.materialType
  if (material.materialCategory !== undefined) result.material_category = material.materialCategory
  if (material.brand !== undefined) result.brand = material.brand
  if (material.productName !== undefined) result.product_name = material.productName
  if (material.modelNumber !== undefined) result.model_number = material.modelNumber
  if (material.sku !== undefined) result.sku = material.sku
  if (material.description !== undefined) result.description = material.description
  if (material.colorDescription !== undefined) result.color_description = material.colorDescription
  if (material.finish !== undefined) result.finish = material.finish
  if (material.dimensions !== undefined) result.dimensions = material.dimensions
  if (material.thickness !== undefined) result.thickness = material.thickness
  if (material.materialComposition !== undefined) result.material_composition = material.materialComposition
  if (material.avgCostPerUnit !== undefined) result.avg_cost_per_unit = material.avgCostPerUnit
  if (material.unitType !== undefined) result.unit_type = material.unitType
  if (material.suppliers !== undefined) result.suppliers = material.suppliers
  if (material.typicalLeadTimeDays !== undefined) result.typical_lead_time_days = material.typicalLeadTimeDays
  if (material.imageUrl !== undefined) result.image_url = material.imageUrl
  if (material.swatchImageUrl !== undefined) result.swatch_image_url = material.swatchImageUrl
  if (material.additionalImages !== undefined) result.additional_images = material.additionalImages
  if (material.recommendedFor !== undefined) result.recommended_for = material.recommendedFor
  if (material.designStyles !== undefined) result.design_styles = material.designStyles
  if (material.popular !== undefined) result.popular = material.popular
  if (material.isActive !== undefined) result.is_active = material.isActive
  
  return result
}
