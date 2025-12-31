"use client";

import { cn } from "@/lib/utils";

interface AuthFormPanelProps {
  children: React.ReactNode;
  className?: string;
}

export function AuthFormPanel({ children, className }: AuthFormPanelProps) {
  return (
    <div
      className={cn(
        "w-full",
        "bg-card rounded-xl border border-border",
        "shadow-lg",
        "p-6 sm:p-8",
        "auth-form-animate",
        className
      )}
    >
      {children}
    </div>
  );
}

interface AuthFormHeaderProps {
  title: string;
  description?: string;
}

export function AuthFormHeader({ title, description }: AuthFormHeaderProps) {
  return (
    <div className="space-y-2 mb-6">
      <h2 className="text-2xl font-bold tracking-tight text-foreground">
        {title}
      </h2>
      {description && (
        <p className="text-sm text-muted-foreground">
          {description}
        </p>
      )}
    </div>
  );
}

interface AuthFormFooterProps {
  children: React.ReactNode;
  className?: string;
}

export function AuthFormFooter({ children, className }: AuthFormFooterProps) {
  return (
    <div className={cn("mt-6 text-center text-sm text-muted-foreground", className)}>
      {children}
    </div>
  );
}

interface AuthDividerProps {
  text?: string;
}

export function AuthDivider({ text = "Or continue with" }: AuthDividerProps) {
  return (
    <div className="relative my-6">
      <div className="absolute inset-0 flex items-center">
        <span className="w-full border-t border-border" />
      </div>
      <div className="relative flex justify-center text-xs uppercase">
        <span className="bg-card px-3 text-muted-foreground">
          {text}
        </span>
      </div>
    </div>
  );
}
