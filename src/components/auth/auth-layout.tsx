import Link from "next/link";
import { Home, ArrowLeft } from "lucide-react";

interface AuthLayoutProps {
  children: React.ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Simple header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-xl font-semibold hover:opacity-80 transition-opacity"
          >
            <Home className="h-5 w-5 text-primary" />
            <span>Rehab Estimator Pro</span>
          </Link>
          <Link
            href="/"
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Link>
        </div>
      </header>

      {/* Centered form */}
      <main className="flex-1 flex items-center justify-center p-4">
        {children}
      </main>

      {/* Simple footer */}
      <footer className="border-t bg-card">
        <div className="container mx-auto px-4 py-4">
          <p className="text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} Rehab Estimator Pro. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

