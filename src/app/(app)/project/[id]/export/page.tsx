"use client";

import { ProjectPageHeader } from "@/components/project";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { IconDownload, IconFileTypePdf, IconFileSpreadsheet, IconShare } from "@tabler/icons-react";

export default function ExportPage() {
  return (
    <>
      <ProjectPageHeader section="Export" />
      <main className="flex-1 p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center gap-3">
            <IconDownload className="h-8 w-8 text-muted-foreground" />
            <div>
              <h1 className="text-2xl font-bold">Export & Share</h1>
              <p className="text-muted-foreground">
                Generate reports and share your plan
              </p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <IconFileTypePdf className="h-5 w-5" />
                  PDF Report
                </CardTitle>
                <CardDescription>
                  Professional summary document with costs, timeline, and design selections.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button disabled className="w-full">
                  <IconDownload className="mr-2 h-4 w-4" />
                  Generate PDF
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <IconFileSpreadsheet className="h-5 w-5" />
                  Excel Export
                </CardTitle>
                <CardDescription>
                  Detailed line items with costs, quantities, and formulas.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button disabled className="w-full">
                  <IconDownload className="mr-2 h-4 w-4" />
                  Export to Excel
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <IconShare className="h-5 w-5" />
                  Share Link
                </CardTitle>
                <CardDescription>
                  Generate a shareable link for contractors or investors.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button disabled className="w-full">
                  <IconShare className="mr-2 h-4 w-4" />
                  Create Share Link
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </>
  );
}
