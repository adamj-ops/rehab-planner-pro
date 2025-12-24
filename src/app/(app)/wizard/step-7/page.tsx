"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { WizardFooter } from "@/components/wizard/wizard-footer";
import { FileText, Download, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Step7Review() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Review & Export</h1>
        <p className="text-muted-foreground">
          Review your complete estimate and export reports.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Project Summary
            </CardTitle>
            <CardDescription>
              Review all project details
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-48 text-muted-foreground">
              Project summary will appear here
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Export Options</CardTitle>
            <CardDescription>
              Generate and share reports
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button className="w-full justify-start" variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export as PDF
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export to Excel
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <Share2 className="mr-2 h-4 w-4" />
              Share with Team
            </Button>
          </CardContent>
        </Card>
      </div>

      <WizardFooter />
    </div>
  );
}

