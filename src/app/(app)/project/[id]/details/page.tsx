"use client";

import { useState, useEffect } from "react";
import { ProjectPageHeader, useProject } from "@/components/project";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  IconHome,
  IconMapPin,
  IconRuler,
  IconCalendar,
  IconCurrencyDollar,
  IconDeviceFloppy,
  IconLoader2,
} from "@tabler/icons-react";
import { toast } from "sonner";

const US_STATES = [
  "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA",
  "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD",
  "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ",
  "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC",
  "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY"
];

export default function DetailsPage() {
  const { project, isLoading, updateProject } = useProject();
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    project_name: "",
    address_street: "",
    address_city: "",
    address_state: "",
    address_zip: "",
    property_type: "",
    square_feet: "",
    year_built: "",
    bedrooms: "",
    bathrooms: "",
    purchase_price: "",
    arv: "",
    max_budget: "",
  });

  // Load project data into form
  useEffect(() => {
    if (project) {
      setFormData({
        project_name: project.project_name || "",
        address_street: project.address_street || "",
        address_city: project.address_city || "",
        address_state: project.address_state || "",
        address_zip: project.address_zip || "",
        property_type: project.property_type || "",
        square_feet: project.square_feet?.toString() || "",
        year_built: project.year_built?.toString() || "",
        bedrooms: project.bedrooms?.toString() || "",
        bathrooms: project.bathrooms?.toString() || "",
        purchase_price: project.purchase_price?.toString() || "",
        arv: project.arv?.toString() || "",
        max_budget: project.max_budget?.toString() || "",
      });
    }
  }, [project]);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateProject({
        project_name: formData.project_name || formData.address_street,
        address_street: formData.address_street,
        address_city: formData.address_city,
        address_state: formData.address_state,
        address_zip: formData.address_zip,
        property_type: formData.property_type || null,
        square_feet: formData.square_feet ? parseInt(formData.square_feet) : null,
        year_built: formData.year_built ? parseInt(formData.year_built) : null,
        bedrooms: formData.bedrooms ? parseInt(formData.bedrooms) : null,
        bathrooms: formData.bathrooms ? parseFloat(formData.bathrooms) : null,
        purchase_price: formData.purchase_price ? parseInt(formData.purchase_price) : null,
        arv: formData.arv ? parseInt(formData.arv) : null,
        max_budget: formData.max_budget ? parseInt(formData.max_budget) : null,
      });
      toast.success("Project details saved!");
    } catch {
      toast.error("Failed to save project details");
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) {
    return (
      <>
        <ProjectPageHeader section="Details" />
        <main className="flex-1 p-6 flex items-center justify-center">
          <IconLoader2 className="h-8 w-8 animate-spin text-primary" />
        </main>
      </>
    );
  }

  return (
    <>
      <ProjectPageHeader section="Details" />
      <main className="flex-1 p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <IconHome className="h-8 w-8 text-muted-foreground" />
              <div>
                <h1 className="text-2xl font-bold">Property Details</h1>
                <p className="text-muted-foreground">
                  Enter property address and basic information
                </p>
              </div>
            </div>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? (
                <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <IconDeviceFloppy className="mr-2 h-4 w-4" />
              )}
              Save Changes
            </Button>
          </div>

          {/* Project Name */}
          <Card>
            <CardHeader>
              <CardTitle>Project Name</CardTitle>
              <CardDescription>
                Give your project a memorable name
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="project_name">Project Name</Label>
                <Input
                  id="project_name"
                  placeholder="Oak Street Flip"
                  value={formData.project_name}
                  onChange={(e) => handleChange("project_name", e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Leave blank to use the address as the project name
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Address Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <IconMapPin className="h-5 w-5" />
                Property Address
              </CardTitle>
              <CardDescription>
                Enter the full property address
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="address_street">Street Address</Label>
                <Input
                  id="address_street"
                  placeholder="123 Main Street"
                  value={formData.address_street}
                  onChange={(e) => handleChange("address_street", e.target.value)}
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="address_city">City</Label>
                  <Input
                    id="address_city"
                    placeholder="Austin"
                    value={formData.address_city}
                    onChange={(e) => handleChange("address_city", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address_state">State</Label>
                  <Select
                    value={formData.address_state}
                    onValueChange={(value) => handleChange("address_state", value)}
                  >
                    <SelectTrigger id="address_state">
                      <SelectValue placeholder="Select state" />
                    </SelectTrigger>
                    <SelectContent>
                      {US_STATES.map((state) => (
                        <SelectItem key={state} value={state}>
                          {state}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address_zip">ZIP Code</Label>
                  <Input
                    id="address_zip"
                    placeholder="78701"
                    value={formData.address_zip}
                    onChange={(e) => handleChange("address_zip", e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Property Info Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <IconRuler className="h-5 w-5" />
                Property Information
              </CardTitle>
              <CardDescription>
                Basic details about the property
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="property_type">Property Type</Label>
                <Select
                  value={formData.property_type}
                  onValueChange={(value) => handleChange("property_type", value)}
                >
                  <SelectTrigger id="property_type">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="single_family">Single Family</SelectItem>
                    <SelectItem value="multi_family">Multi-Family</SelectItem>
                    <SelectItem value="condo">Condo/Townhouse</SelectItem>
                    <SelectItem value="manufactured">Manufactured</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="bedrooms">Bedrooms</Label>
                  <Input
                    id="bedrooms"
                    type="number"
                    placeholder="3"
                    value={formData.bedrooms}
                    onChange={(e) => handleChange("bedrooms", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bathrooms">Bathrooms</Label>
                  <Input
                    id="bathrooms"
                    type="number"
                    step="0.5"
                    placeholder="2"
                    value={formData.bathrooms}
                    onChange={(e) => handleChange("bathrooms", e.target.value)}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="square_feet" className="flex items-center gap-1">
                    Square Feet
                  </Label>
                  <Input
                    id="square_feet"
                    type="number"
                    placeholder="1850"
                    value={formData.square_feet}
                    onChange={(e) => handleChange("square_feet", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="year_built" className="flex items-center gap-1">
                    <IconCalendar className="h-3 w-3" />
                    Year Built
                  </Label>
                  <Input
                    id="year_built"
                    type="number"
                    placeholder="1985"
                    value={formData.year_built}
                    onChange={(e) => handleChange("year_built", e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Financial Info Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <IconCurrencyDollar className="h-5 w-5" />
                Financial Information
              </CardTitle>
              <CardDescription>
                Purchase price, ARV, and budget
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="purchase_price">Purchase Price</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      $
                    </span>
                    <Input
                      id="purchase_price"
                      type="number"
                      placeholder="150000"
                      className="pl-7"
                      value={formData.purchase_price}
                      onChange={(e) => handleChange("purchase_price", e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="arv">After Repair Value (ARV)</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      $
                    </span>
                    <Input
                      id="arv"
                      type="number"
                      placeholder="250000"
                      className="pl-7"
                      value={formData.arv}
                      onChange={(e) => handleChange("arv", e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="max_budget">Rehab Budget</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      $
                    </span>
                    <Input
                      id="max_budget"
                      type="number"
                      placeholder="50000"
                      className="pl-7"
                      value={formData.max_budget}
                      onChange={(e) => handleChange("max_budget", e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Quick ROI Calculation */}
              {formData.purchase_price && formData.arv && formData.max_budget && (
                <Card className="bg-muted/50">
                  <CardContent className="pt-4">
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <p className="text-sm text-muted-foreground">Total Investment</p>
                        <p className="text-lg font-bold">
                          ${(parseInt(formData.purchase_price) + parseInt(formData.max_budget)).toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Potential Profit</p>
                        <p className="text-lg font-bold text-green-600">
                          ${(parseInt(formData.arv) - parseInt(formData.purchase_price) - parseInt(formData.max_budget)).toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Estimated ROI</p>
                        <p className="text-lg font-bold text-green-600">
                          {Math.round(
                            ((parseInt(formData.arv) - parseInt(formData.purchase_price) - parseInt(formData.max_budget)) /
                              (parseInt(formData.purchase_price) + parseInt(formData.max_budget))) *
                              100
                          )}%
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>

          {/* Save Button (Bottom) */}
          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={saving} size="lg">
              {saving ? (
                <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <IconDeviceFloppy className="mr-2 h-4 w-4" />
              )}
              Save Changes
            </Button>
          </div>
        </div>
      </main>
    </>
  );
}
