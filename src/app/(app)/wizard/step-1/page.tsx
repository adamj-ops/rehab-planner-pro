"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { WizardFooter } from "@/components/wizard/wizard-footer";
import { MapPin, Home, Calendar, Ruler } from "lucide-react";

export default function Step1PropertyDetails() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Property Details</h1>
        <p className="text-muted-foreground">
          Enter the basic information about the property you&apos;re analyzing.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Address Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Property Address
            </CardTitle>
            <CardDescription>
              Enter the full property address
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="street">Street Address</Label>
              <Input id="street" placeholder="123 Main Street" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input id="city" placeholder="Austin" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">State</Label>
                <Select>
                  <SelectTrigger id="state">
                    <SelectValue placeholder="Select state" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TX">Texas</SelectItem>
                    <SelectItem value="CA">California</SelectItem>
                    <SelectItem value="FL">Florida</SelectItem>
                    <SelectItem value="NY">New York</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="zip">ZIP Code</Label>
              <Input id="zip" placeholder="78701" />
            </div>
          </CardContent>
        </Card>

        {/* Property Info Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Home className="h-5 w-5" />
              Property Information
            </CardTitle>
            <CardDescription>
              Basic details about the property
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="type">Property Type</Label>
              <Select>
                <SelectTrigger id="type">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="single-family">Single Family</SelectItem>
                  <SelectItem value="multi-family">Multi-Family</SelectItem>
                  <SelectItem value="condo">Condo/Townhouse</SelectItem>
                  <SelectItem value="manufactured">Manufactured</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="beds">Bedrooms</Label>
                <Input id="beds" type="number" placeholder="3" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="baths">Bathrooms</Label>
                <Input id="baths" type="number" step="0.5" placeholder="2" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sqft" className="flex items-center gap-1">
                  <Ruler className="h-3 w-3" />
                  Square Feet
                </Label>
                <Input id="sqft" type="number" placeholder="1,850" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="year" className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Year Built
                </Label>
                <Input id="year" type="number" placeholder="1985" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <WizardFooter />
    </div>
  );
}

