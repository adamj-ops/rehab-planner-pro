"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { IconMapPin, IconHome, IconCalendar, IconRuler, IconCurrencyDollar } from "@tabler/icons-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { WizardFooter } from "@/components/wizard/wizard-footer";
import { useWizard } from "@/components/wizard/wizard-context";
import { AddressAutocomplete } from "@/components/wizard/property-details";
import {
  propertyDetailsSchema,
  PropertyDetailsFormData,
  US_STATES,
  PROPERTY_TYPES,
} from "@/lib/validations/project-wizard";

// State name mapping for display
const STATE_NAMES: Record<string, string> = {
  AL: "Alabama", AK: "Alaska", AZ: "Arizona", AR: "Arkansas", CA: "California",
  CO: "Colorado", CT: "Connecticut", DE: "Delaware", FL: "Florida", GA: "Georgia",
  HI: "Hawaii", ID: "Idaho", IL: "Illinois", IN: "Indiana", IA: "Iowa",
  KS: "Kansas", KY: "Kentucky", LA: "Louisiana", ME: "Maine", MD: "Maryland",
  MA: "Massachusetts", MI: "Michigan", MN: "Minnesota", MS: "Mississippi", MO: "Missouri",
  MT: "Montana", NE: "Nebraska", NV: "Nevada", NH: "New Hampshire", NJ: "New Jersey",
  NM: "New Mexico", NY: "New York", NC: "North Carolina", ND: "North Dakota", OH: "Ohio",
  OK: "Oklahoma", OR: "Oregon", PA: "Pennsylvania", RI: "Rhode Island", SC: "South Carolina",
  SD: "South Dakota", TN: "Tennessee", TX: "Texas", UT: "Utah", VT: "Vermont",
  VA: "Virginia", WA: "Washington", WV: "West Virginia", WI: "Wisconsin", WY: "Wyoming",
};

const PROPERTY_TYPE_LABELS: Record<string, string> = {
  single_family: "Single Family",
  multi_family: "Multi-Family",
  condo: "Condo/Townhouse",
  townhome: "Townhome",
};

export function PropertyDetailsForm() {
  const { getStepData, setStepData, markStepComplete, goToNextStep, saveDraft, isSaving } = useWizard();

  // Initialize form with stored data
  const form = useForm<PropertyDetailsFormData>({
    resolver: zodResolver(propertyDetailsSchema),
    defaultValues: {
      project_name: "",
      address_street: "",
      address_city: "",
      address_state: undefined,
      address_zip: "",
      address_place_id: undefined,
      address_formatted: undefined,
      address_lat: undefined,
      address_lng: undefined,
      property_type: undefined,
      square_footage: undefined,
      lot_size_sqft: undefined,
      year_built: undefined,
      bedrooms: undefined,
      bathrooms: undefined,
      purchase_price: undefined,
      ...getStepData<PropertyDetailsFormData>(1),
    },
    mode: "onBlur",
  });

  // Auto-save on blur
  useEffect(() => {
    const subscription = form.watch((data) => {
      // Save to wizard context on each change (debounced via onBlur mode)
      setStepData(1, data as Partial<PropertyDetailsFormData>);
    });
    return () => subscription.unsubscribe();
  }, [form, setStepData]);

  const onSubmit = async (data: PropertyDetailsFormData) => {
    setStepData(1, data);
    markStepComplete(1);
    await goToNextStep();
  };

  const handleSave = async () => {
    const data = form.getValues();
    setStepData(1, data);
    await saveDraft();
  };

  const canProceed = form.formState.isValid;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Property Details</h1>
          <p className="text-muted-foreground">
            Enter the basic information about the property you&apos;re analyzing.
          </p>
        </div>

        {/* Project Name */}
        <Card>
          <CardHeader>
            <CardTitle>Project Name</CardTitle>
            <CardDescription>
              Give your project a memorable name for easy reference
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="project_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project Name</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="e.g., Oak Street Flip, Downtown Rental" 
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    A short, descriptive name for this renovation project
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <div className="grid gap-6 md:grid-cols-2">
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
              <FormField
                control={form.control}
                name="address_street"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Street Address</FormLabel>
                    <FormControl>
                      <AddressAutocomplete
                        value={field.value}
                        onChange={field.onChange}
                        error={form.formState.errors.address_street?.message as string | undefined}
                        onAddressSelect={(addr) => {
                          form.setValue("address_street", addr.street, { shouldValidate: true, shouldDirty: true });
                          form.setValue("address_city", addr.city, { shouldValidate: true, shouldDirty: true });
                          form.setValue("address_state", addr.state as any, { shouldValidate: true, shouldDirty: true });
                          form.setValue("address_zip", addr.zip, { shouldValidate: true, shouldDirty: true });

                          if (addr.placeId) form.setValue("address_place_id", addr.placeId, { shouldDirty: true });
                          if (addr.formatted) form.setValue("address_formatted", addr.formatted, { shouldDirty: true });
                          if (typeof addr.lat === "number") form.setValue("address_lat", addr.lat, { shouldDirty: true });
                          if (typeof addr.lng === "number") form.setValue("address_lng", addr.lng, { shouldDirty: true });
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="address_city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <Input placeholder="Austin" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="address_state"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>State</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select state" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {US_STATES.map((state) => (
                            <SelectItem key={state} value={state}>
                              {STATE_NAMES[state]} ({state})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="address_zip"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ZIP Code</FormLabel>
                    <FormControl>
                      <Input placeholder="78701" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Property Info Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <IconHome className="h-5 w-5" />
                Property Information
              </CardTitle>
              <CardDescription>
                Basic details about the property
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="property_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Property Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {PROPERTY_TYPES.map((type) => (
                          <SelectItem key={type} value={type}>
                            {PROPERTY_TYPE_LABELS[type]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="bedrooms"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bedrooms</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="3" 
                          {...field}
                          onChange={(e) => field.onChange(e.target.value === "" ? undefined : Number(e.target.value))}
                          value={field.value ?? ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="bathrooms"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bathrooms</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.5" 
                          placeholder="2" 
                          {...field}
                          onChange={(e) => field.onChange(e.target.value === "" ? undefined : Number(e.target.value))}
                          value={field.value ?? ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="square_footage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1">
                        <IconRuler className="h-3 w-3" />
                        Square Feet
                      </FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="1,850" 
                          {...field}
                          onChange={(e) => field.onChange(e.target.value === "" ? undefined : Number(e.target.value))}
                          value={field.value ?? ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="year_built"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1">
                        <IconCalendar className="h-3 w-3" />
                        Year Built
                      </FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="1985" 
                          {...field}
                          onChange={(e) => field.onChange(e.target.value === "" ? undefined : Number(e.target.value))}
                          value={field.value ?? ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Purchase Price Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IconCurrencyDollar className="h-5 w-5" />
              Purchase Information
            </CardTitle>
            <CardDescription>
              Optional: Enter the purchase price if known
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="purchase_price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Purchase Price</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                        <Input 
                          type="number" 
                          placeholder="250,000" 
                          className="pl-7"
                          {...field}
                          onChange={(e) => field.onChange(e.target.value === "" ? undefined : Number(e.target.value))}
                          value={field.value ?? ""}
                        />
                      </div>
                    </FormControl>
                    <FormDescription>
                      Leave blank if not yet under contract
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="lot_size_sqft"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Lot Size (sq ft)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="5,000" 
                        {...field}
                        onChange={(e) => field.onChange(e.target.value === "" ? undefined : Number(e.target.value))}
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <FormDescription>
                      Optional lot size for land valuation
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        <WizardFooter 
          onSave={handleSave}
          isSaving={isSaving}
          canProceed={canProceed}
          form={form}
        />
      </form>
    </Form>
  );
}
