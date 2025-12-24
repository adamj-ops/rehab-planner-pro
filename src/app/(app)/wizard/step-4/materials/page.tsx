"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { WizardFooter } from "@/components/wizard/wizard-footer";
import { Hammer, Loader2 } from "lucide-react";
import { MaterialLibrary } from "@/types/database";
import { toast } from "sonner";

// MaterialCard component for displaying individual materials
function MaterialCard({ material, onSelect, isSelected }: { 
  material: MaterialLibrary; 
  onSelect: (material: MaterialLibrary) => void;
  isSelected: boolean;
}) {
  return (
    <div
      onClick={() => onSelect(material)}
      className={`group cursor-pointer rounded-lg border transition-all hover:shadow-lg ${
        isSelected ? "ring-2 ring-primary shadow-lg" : "hover:border-primary/50"
      }`}
    >
      {/* Material image placeholder */}
      <div className="h-24 rounded-t-lg bg-muted flex items-center justify-center">
        <Hammer className="h-8 w-8 text-muted-foreground" />
      </div>
      
      {/* Material info */}
      <div className="p-3 space-y-1">
        <p className="font-medium text-sm truncate">{material.product_name}</p>
        <p className="text-xs text-muted-foreground truncate">{material.brand}</p>
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground capitalize">
            {material.material_category}
          </p>
          {material.avg_cost_per_unit && (
            <p className="text-xs font-medium">
              ${material.avg_cost_per_unit}/{material.unit_type}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Step4Materials() {
  const [materials, setMaterials] = useState<MaterialLibrary[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([]);

  useEffect(() => {
    const fetchMaterials = async () => {
      try {
        const response = await fetch("/api/materials");
        const data = await response.json();
        if (data.success) {
          setMaterials(data.data);
        }
      } catch (error) {
        console.error("Failed to fetch materials:", error);
        toast.error("Failed to load materials");
      } finally {
        setLoading(false);
      }
    };

    fetchMaterials();
  }, []);

  const handleSelectMaterial = (material: MaterialLibrary) => {
    setSelectedMaterials((prev) => {
      if (prev.includes(material.id)) {
        return prev.filter((id) => id !== material.id);
      }
      return [...prev, material.id];
    });
  };

  // Group materials by category
  const materialsByCategory = materials.reduce((acc, material) => {
    const category = material.material_type || "Other";
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(material);
    return acc;
  }, {} as Record<string, MaterialLibrary[]>);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Hammer className="h-5 w-5" />
            Material Library
          </CardTitle>
          <CardDescription>
            Browse and select materials for your project.
            {selectedMaterials.length > 0 && (
              <span className="ml-2 text-primary">
                ({selectedMaterials.length} selected)
              </span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : materials.length === 0 ? (
            <div className="flex items-center justify-center h-64 text-muted-foreground">
              No materials found. Check your database connection.
            </div>
          ) : (
            <div className="space-y-8">
              {Object.entries(materialsByCategory).map(([category, categoryMaterials]) => (
                <div key={category}>
                  <h3 className="text-lg font-semibold mb-4 capitalize">{category}</h3>
                  <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                    {categoryMaterials.map((material) => (
                      <MaterialCard
                        key={material.id}
                        material={material}
                        onSelect={handleSelectMaterial}
                        isSelected={selectedMaterials.includes(material.id)}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <WizardFooter />
    </div>
  );
}

