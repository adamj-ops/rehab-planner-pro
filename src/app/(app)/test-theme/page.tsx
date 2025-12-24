'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { IconPalette, IconCheck } from '@/lib/icons';

export default function TestThemePage() {
  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Theme Test Page</h1>
        <p className="text-muted-foreground">
          Verify Mira + Zinc + Blue + Roboto theme
        </p>
      </div>

      {/* Font Test */}
      <Card>
        <CardHeader>
          <CardTitle>Font Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Sans-serif (should be Roboto):</p>
            <p className="text-lg">The quick brown fox jumps over the lazy dog</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Monospace (should be Roboto Mono):</p>
            <code className="font-mono bg-muted px-2 py-1">SW 7005 #FFFFFF LRV: 82.5</code>
          </div>
        </CardContent>
      </Card>

      {/* Color Test */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconPalette className="w-5 h-5" />
            Color Test
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2 flex-wrap">
            <Button>Primary (Blue)</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="destructive">Destructive</Button>
            <Button variant="ghost">Ghost</Button>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Badge>Default</Badge>
            <Badge variant="secondary">Secondary</Badge>
            <Badge variant="outline">Outline</Badge>
            <Badge variant="destructive">Destructive</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Zinc Palette Test */}
      <Card>
        <CardHeader>
          <CardTitle>Zinc Palette Test</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-5 gap-2">
            <div className="h-20 bg-zinc-50 border flex items-center justify-center text-xs">50</div>
            <div className="h-20 bg-zinc-100 border flex items-center justify-center text-xs">100</div>
            <div className="h-20 bg-zinc-200 border flex items-center justify-center text-xs">200</div>
            <div className="h-20 bg-zinc-300 border flex items-center justify-center text-xs">300</div>
            <div className="h-20 bg-zinc-400 border flex items-center justify-center text-xs text-white">400</div>
            <div className="h-20 bg-zinc-500 border flex items-center justify-center text-xs text-white">500</div>
            <div className="h-20 bg-zinc-600 border flex items-center justify-center text-xs text-white">600</div>
            <div className="h-20 bg-zinc-700 border flex items-center justify-center text-xs text-white">700</div>
            <div className="h-20 bg-zinc-800 border flex items-center justify-center text-xs text-white">800</div>
            <div className="h-20 bg-zinc-900 border flex items-center justify-center text-xs text-white">900</div>
          </div>
        </CardContent>
      </Card>

      {/* Blue Primary Test */}
      <Card>
        <CardHeader>
          <CardTitle>Blue Primary Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="h-12 bg-primary text-primary-foreground flex items-center justify-center">
            <IconCheck className="w-5 h-5 mr-2" />
            Primary Background (should be BLUE)
          </div>
          <div className="h-12 border-2 border-primary text-primary flex items-center justify-center">
            Primary Border and Text
          </div>
          <div className="h-12 ring-2 ring-primary flex items-center justify-center">
            Primary Ring (focus indicator)
          </div>
        </CardContent>
      </Card>

      {/* Border Radius Test */}
      <Card>
        <CardHeader>
          <CardTitle>Border Radius Test (should be sharp)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="h-12 bg-secondary text-secondary-foreground flex items-center justify-center">
            All corners should be sharp (no rounded edges)
          </div>
          <p className="text-xs text-muted-foreground">
            If you see rounded corners, radius is not set to 0
          </p>
        </CardContent>
      </Card>

      {/* Icons Test */}
      <Card>
        <CardHeader>
          <CardTitle>Tabler Icons Test</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <IconPalette className="w-6 h-6 text-primary" />
              <span>IconPalette</span>
            </div>
            <div className="flex items-center gap-2">
              <IconCheck className="w-6 h-6 text-green-500" />
              <span>IconCheck</span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Icons should be from @tabler/icons-react (not lucide)
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

