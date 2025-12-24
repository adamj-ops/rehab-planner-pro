"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Link2,
  Copy,
  Check,
  Download,
  Mail,
  Globe,
  Lock,
  Calendar,
  Eye,
  Share2,
  Facebook,
  Twitter,
  Linkedin,
  ExternalLink,
  Loader2,
} from "lucide-react"
import { toast } from "sonner"
import type { Moodboard, MoodboardShare } from "@/types/design"

interface MoodboardShareDialogProps {
  moodboard: Moodboard
  shares?: MoodboardShare[]
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreateShareLink?: (expiresInDays?: number) => Promise<MoodboardShare>
  onExport?: (format: "png" | "jpg" | "pdf", resolution: "low" | "medium" | "high" | "print") => Promise<void>
  onEmailShare?: (email: string, name?: string) => Promise<void>
  baseUrl?: string
}

export function MoodboardShareDialog({
  moodboard,
  shares = [],
  open,
  onOpenChange,
  onCreateShareLink,
  onExport,
  onEmailShare,
  baseUrl = "",
}: MoodboardShareDialogProps) {
  const [activeTab, setActiveTab] = React.useState("link")
  const [copied, setCopied] = React.useState(false)
  const [creating, setCreating] = React.useState(false)
  const [exporting, setExporting] = React.useState(false)
  const [sendingEmail, setSendingEmail] = React.useState(false)
  
  // Link settings
  const [linkExpiry, setLinkExpiry] = React.useState<string>("never")
  const [passwordProtect, setPasswordProtect] = React.useState(false)
  
  // Export settings
  const [exportFormat, setExportFormat] = React.useState<"png" | "jpg" | "pdf">("png")
  const [exportResolution, setExportResolution] = React.useState<"low" | "medium" | "high" | "print">("high")
  
  // Email settings
  const [recipientEmail, setRecipientEmail] = React.useState("")
  const [recipientName, setRecipientName] = React.useState("")

  // Current share URL
  const currentShare = shares.find((s) => s.shareType === "link")
  const shareUrl = currentShare
    ? `${baseUrl}/moodboard/${currentShare.shortCode}`
    : moodboard.publicSlug
    ? `${baseUrl}/moodboard/${moodboard.publicSlug}`
    : null

  const handleCopyLink = async () => {
    if (!shareUrl) return
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      toast.success("Link copied to clipboard")
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error("Failed to copy link")
    }
  }

  const handleCreateLink = async () => {
    if (!onCreateShareLink) return
    setCreating(true)
    try {
      const expiryDays = linkExpiry === "never" ? undefined : parseInt(linkExpiry)
      await onCreateShareLink(expiryDays)
      toast.success("Share link created")
    } catch (error) {
      toast.error("Failed to create share link")
    } finally {
      setCreating(false)
    }
  }

  const handleExport = async () => {
    if (!onExport) return
    setExporting(true)
    try {
      await onExport(exportFormat, exportResolution)
      toast.success(`Moodboard exported as ${exportFormat.toUpperCase()}`)
    } catch (error) {
      toast.error("Failed to export moodboard")
    } finally {
      setExporting(false)
    }
  }

  const handleEmailShare = async () => {
    if (!onEmailShare || !recipientEmail) return
    setSendingEmail(true)
    try {
      await onEmailShare(recipientEmail, recipientName)
      toast.success(`Moodboard shared with ${recipientEmail}`)
      setRecipientEmail("")
      setRecipientName("")
    } catch (error) {
      toast.error("Failed to send email")
    } finally {
      setSendingEmail(false)
    }
  }

  const handleSocialShare = (platform: "facebook" | "twitter" | "linkedin" | "pinterest") => {
    if (!shareUrl) return

    const title = encodeURIComponent(moodboard.name)
    const url = encodeURIComponent(shareUrl)

    const urls: Record<string, string> = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      twitter: `https://twitter.com/intent/tweet?url=${url}&text=${title}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
      pinterest: `https://pinterest.com/pin/create/button/?url=${url}&description=${title}`,
    }

    window.open(urls[platform], "_blank", "width=600,height=400")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            Share Moodboard
          </DialogTitle>
          <DialogDescription>
            Share "{moodboard.name}" with clients, contractors, or on social media
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="link" className="gap-2">
              <Link2 className="h-4 w-4" />
              Link
            </TabsTrigger>
            <TabsTrigger value="export" className="gap-2">
              <Download className="h-4 w-4" />
              Export
            </TabsTrigger>
            <TabsTrigger value="email" className="gap-2">
              <Mail className="h-4 w-4" />
              Email
            </TabsTrigger>
          </TabsList>

          {/* Link sharing tab */}
          <TabsContent value="link" className="space-y-4">
            {shareUrl ? (
              <>
                <div className="space-y-2">
                  <Label>Share Link</Label>
                  <div className="flex gap-2">
                    <Input
                      value={shareUrl}
                      readOnly
                      className="flex-1 font-mono text-sm"
                    />
                    <Button variant="outline" onClick={handleCopyLink}>
                      {copied ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                    <Button variant="outline" asChild>
                      <a href={shareUrl} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                  </div>
                </div>

                {/* Share stats */}
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Eye className="h-4 w-4" />
                    {moodboard.viewCount} views
                  </span>
                  <span className="flex items-center gap-1">
                    <Share2 className="h-4 w-4" />
                    {moodboard.shareCount} shares
                  </span>
                </div>

                <Separator />

                {/* Social sharing */}
                <div className="space-y-2">
                  <Label>Share on Social</Label>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleSocialShare("facebook")}
                    >
                      <Facebook className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleSocialShare("twitter")}
                    >
                      <Twitter className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleSocialShare("linkedin")}
                    >
                      <Linkedin className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-center p-8 rounded-lg bg-muted/50">
                  <div className="text-center">
                    <Globe className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-medium mb-2">Create a share link</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Generate a public link to share this moodboard
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label>Link Expiration</Label>
                    <Select value={linkExpiry} onValueChange={setLinkExpiry}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="never">Never expires</SelectItem>
                        <SelectItem value="7">7 days</SelectItem>
                        <SelectItem value="30">30 days</SelectItem>
                        <SelectItem value="90">90 days</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button
                    className="w-full gap-2"
                    onClick={handleCreateLink}
                    disabled={creating}
                  >
                    {creating ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Link2 className="h-4 w-4" />
                    )}
                    Create Share Link
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>

          {/* Export tab */}
          <TabsContent value="export" className="space-y-4">
            <div className="space-y-3">
              <div className="space-y-2">
                <Label>Format</Label>
                <Select value={exportFormat} onValueChange={(v) => setExportFormat(v as typeof exportFormat)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="png">PNG (Best for web)</SelectItem>
                    <SelectItem value="jpg">JPG (Smaller file size)</SelectItem>
                    <SelectItem value="pdf">PDF (For printing)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Resolution</Label>
                <Select value={exportResolution} onValueChange={(v) => setExportResolution(v as typeof exportResolution)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low (72 DPI)</SelectItem>
                    <SelectItem value="medium">Medium (150 DPI)</SelectItem>
                    <SelectItem value="high">High (300 DPI)</SelectItem>
                    <SelectItem value="print">Print (600 DPI)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="p-3 rounded-lg bg-muted/50 text-sm text-muted-foreground">
                <p>
                  Canvas size: {moodboard.canvasWidth} × {moodboard.canvasHeight}px
                </p>
              </div>

              <Button
                className="w-full gap-2"
                onClick={handleExport}
                disabled={exporting || !onExport}
              >
                {exporting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
                Download {exportFormat.toUpperCase()}
              </Button>
            </div>
          </TabsContent>

          {/* Email tab */}
          <TabsContent value="email" className="space-y-4">
            <div className="space-y-3">
              <div className="space-y-2">
                <Label>Recipient Email *</Label>
                <Input
                  type="email"
                  placeholder="client@example.com"
                  value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Recipient Name</Label>
                <Input
                  placeholder="John Smith"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                />
              </div>

              <Button
                className="w-full gap-2"
                onClick={handleEmailShare}
                disabled={sendingEmail || !recipientEmail || !onEmailShare}
              >
                {sendingEmail ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Mail className="h-4 w-4" />
                )}
                Send Email
              </Button>

              <p className="text-xs text-muted-foreground text-center">
                The recipient will receive an email with a link to view this moodboard
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}

