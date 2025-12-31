"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { WizardFooter } from "@/components/wizard/wizard-footer";
import { IconPackage } from "@/lib/icons";
import { MaterialLibraryBrowser } from "@/components/design/material-library-browser";
import { MaterialDetailDialog } from "@/components/design/material-detail-dialog";
import { useDesignStore } from "@/hooks/use-design-store";
import { adaptMaterialsFromDB } from "@/lib/adapters/material-adapter";
import type { Material } from "@/types/design";
import type { MaterialLibrary } from "@/types/database";
import { toast } from "sonner";

export default function Step4Materials() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [detailMaterial, setDetailMaterial] = useState<Material | null>(null);

  // Get store state and actions
  const selectedMaterialIds = useDesignStore((state) => state.selectedMaterialIds);
  const favoriteMaterialIds = useDesignStore((state) => state.favoriteMaterialIds);
  const toggleMaterialSelection = useDesignStore((state) => state.toggleMaterialSelection);
  const toggleMaterialFavorite = useDesignStore((state) => state.toggleMaterialFavorite);

  useEffect(() => {
    const fetchMaterials = async () => {
      try {
        const response = await fetch("/api/materials");
        const result = await response.json();
        
        if (result.error) {
          throw new Error(result.error);
        }
        
        // Adapt database types to UI types
        const adaptedMaterials = adaptMaterialsFromDB(result.data as MaterialLibrary[]);
        setMaterials(adaptedMaterials);
      } catch (error) {
        console.error("Failed to fetch materials:", error);
        toast.error("Failed to load materials");
      } finally {
        setLoading(false);
      }
    };

    fetchMaterials();
  }, []);

  const handleMaterialSelect = (material: Material) => {
    toggleMaterialSelection(material.id);
  };

  const handleMaterialFavorite = (material: Material) => {
    toggleMaterialFavorite(material.id);
  };

  const handleMaterialInfo = (material: Material) => {
    setDetailMaterial(material);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconPackage className="h-5 w-5" />
            Material Library
          </CardTitle>
          <CardDescription>
            Browse and select materials for your project. Use the filters to narrow down by category, price, or quality.
            {selectedMaterialIds.length > 0 && (
              <span className="ml-2 text-primary font-medium">
                ({selectedMaterialIds.length} selected)
              </span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[600px]">
            <MaterialLibraryBrowser
              materials={materials}
              loading={loading}
              selectedMaterialIds={selectedMaterialIds}
              favoriteMaterialIds={favoriteMaterialIds}
              onMaterialSelect={handleMaterialSelect}
              onMaterialFavorite={handleMaterialFavorite}
              onMaterialInfo={handleMaterialInfo}
            />
          </div>
        </CardContent>
      </Card>

      {/* Material Detail Dialog */}
      <MaterialDetailDialog
        material={detailMaterial}
        open={!!detailMaterial}
        onOpenChange={(open) => !open && setDetailMaterial(null)}
        onSelect={handleMaterialSelect}
        onFavorite={handleMaterialFavorite}
        isFavorite={detailMaterial ? favoriteMaterialIds.includes(detailMaterial.id) : false}
        isSelected={detailMaterial ? selectedMaterialIds.includes(detailMaterial.id) : false}
      />

      <WizardFooter />
    </div>
  );
}
