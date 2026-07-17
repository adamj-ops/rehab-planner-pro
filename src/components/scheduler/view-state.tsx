import { cn } from "@/lib/utils";

/** Centered status message used for loading / empty / error states in views. */
export function ViewMessage({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "grid h-full place-items-center p-10 text-center text-sm text-muted-foreground",
        className
      )}
    >
      <div>{children}</div>
    </div>
  );
}

/** A short, friendly Supabase error line. */
export function errorMessage(error: unknown, fallback = "Something went wrong.") {
  if (error instanceof Error && error.message) return error.message;
  if (typeof error === "object" && error && "message" in error) {
    const m = (error as { message?: unknown }).message;
    if (typeof m === "string" && m) return m;
  }
  return fallback;
}
