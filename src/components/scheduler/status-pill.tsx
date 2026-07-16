"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { TASK_STATUS_META, TASK_STATUS_ORDER, type TaskStatus } from "@/lib/scheduler/types";
import { Dot } from "@/components/scheduler/primitives";
import { cn } from "@/lib/utils";

/** Inline status selector used in the table + task detail. */
export function StatusPill({
  status,
  onChange,
  compact,
}: {
  status: TaskStatus;
  onChange?: (s: TaskStatus) => void;
  compact?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const meta = TASK_STATUS_META[status];

  if (!onChange) {
    return (
      <span
        className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium"
        style={{
          color: meta.color,
          background: `color-mix(in srgb, ${meta.color} 14%, transparent)`,
        }}
      >
        <Dot color={meta.dot} />
        {meta.label}
      </span>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium transition hover:brightness-95",
          compact && "px-2"
        )}
        style={{
          color: meta.color,
          background: `color-mix(in srgb, ${meta.color} 14%, transparent)`,
        }}
      >
        <Dot color={meta.dot} />
        {meta.label}
        <ChevronDown size={12} className="opacity-60" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute z-20 mt-1 w-40 overflow-hidden rounded-lg border border-border bg-popover py-1 shadow-lg">
            {TASK_STATUS_ORDER.map((s) => {
              const m = TASK_STATUS_META[s];
              return (
                <button
                  key={s}
                  onClick={() => {
                    onChange(s);
                    setOpen(false);
                  }}
                  className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-xs hover:bg-muted/60"
                >
                  <Dot color={m.dot} />
                  {m.label}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
