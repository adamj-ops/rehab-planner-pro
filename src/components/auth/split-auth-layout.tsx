"use client";

import Link from "next/link";
import { Home, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

interface SplitAuthLayoutProps {
  children: React.ReactNode;
  marketingContent?: React.ReactNode;
  variant?: "login" | "signup" | "reset";
}

export function SplitAuthLayout({
  children,
  marketingContent,
  variant = "login",
}: SplitAuthLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-lg font-semibold hover:opacity-80 transition-opacity"
          >
            <Home className="h-5 w-5 text-primary" />
            <span>Rehab Planner Pro</span>
          </Link>
          <Link
            href="/"
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Link>
        </div>
      </header>

      {/* Main Content - Split Screen */}
      <main className="flex-1 flex flex-col lg:flex-row">
        {/* Left Panel - Marketing (Dark) */}
        <div
          className={cn(
            "hidden lg:flex lg:w-[40%] xl:w-[45%]",
            "bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900",
            "text-white p-8 xl:p-12",
            "flex-col justify-center items-center"
          )}
        >
          {marketingContent}
        </div>

        {/* Right Panel - Form (Light) */}
        <div
          className={cn(
            "flex-1 flex items-center justify-center",
            "bg-background p-4 sm:p-6 lg:p-8 xl:p-12"
          )}
        >
          <div className="w-full max-w-md">{children}</div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-card/50">
        <div className="container mx-auto px-4 py-4">
          <p className="text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} Rehab Planner Pro. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
