import { cn } from "@/lib/utils";
import type { Person } from "@/lib/scheduler/types";

/**
 * Small data-colored primitives for the scheduler.
 *
 * These intentionally use inline background colors driven by data (person /
 * trade / status hexes) rather than the shadcn Avatar/Badge APIs, so the
 * semantic color coding survives. Text + neutral surfaces use design tokens.
 */

/** Colored initials avatar built from `person.color`. */
export function Avatar({
  person,
  size = 24,
  className,
}: {
  person?: Person;
  size?: number;
  className?: string;
}) {
  if (!person) {
    return (
      <span
        className={cn(
          "inline-flex items-center justify-center rounded-full border border-dashed border-border text-muted-foreground",
          className
        )}
        style={{ width: size, height: size, fontSize: size * 0.42 }}
        title="Unassigned"
      >
        ?
      </span>
    );
  }
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-full font-semibold text-white ring-1 ring-black/5",
        className
      )}
      style={{
        width: size,
        height: size,
        fontSize: size * 0.4,
        background: person.color,
      }}
      title={`${person.name} · ${person.role}`}
    >
      {person.initials}
    </span>
  );
}

/** Small filled dot in an arbitrary color. */
export function Dot({ color, size = 8 }: { color: string; size?: number }) {
  return (
    <span
      className="inline-block rounded-full"
      style={{ width: size, height: size, background: color }}
    />
  );
}

/** Data-colored chip (trade / status). Soft variant tints the color. */
export function Badge({
  children,
  color,
  variant = "soft",
  className,
}: {
  children: React.ReactNode;
  color?: string;
  variant?: "soft" | "solid" | "outline";
  className?: string;
}) {
  const base =
    "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap";
  if (variant === "solid") {
    return (
      <span className={cn(base, "text-white", className)} style={{ background: color }}>
        {children}
      </span>
    );
  }
  if (variant === "outline") {
    return (
      <span
        className={cn(base, "border bg-transparent", className)}
        style={{ color, borderColor: color }}
      >
        {children}
      </span>
    );
  }
  return (
    <span
      className={cn(base, className)}
      style={{
        color,
        background: color ? `color-mix(in srgb, ${color} 14%, transparent)` : undefined,
      }}
    >
      {children}
    </span>
  );
}
