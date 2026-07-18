"use client";

import * as React from "react";
import { CalendarDays } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * Segmented date-range control for the dashboard header. Holds the selected
 * range in local state and is ready to wire to the reports API (e.g.
 * `GET /api/reports/dashboard/?range=30d`) — lift `value`/`onChange` up once the
 * dashboard fetches live data.
 */
const RANGES = [
  { value: "today", label: "Today" },
  { value: "7d", label: "7D" },
  { value: "30d", label: "30D" },
  { value: "90d", label: "90D" },
];

export function DateRangeFilter({ defaultValue = "30d", onChange }) {
  const [value, setValue] = React.useState(defaultValue);

  function select(next) {
    setValue(next);
    onChange?.(next);
  }

  return (
    <div className="inline-flex items-center gap-1 rounded-lg border border-border bg-muted/40 p-0.5">
      <CalendarDays className="mx-1 size-4 text-muted-foreground" />
      {RANGES.map((r) => {
        const active = value === r.value;
        return (
          <button
            key={r.value}
            type="button"
            aria-pressed={active}
            onClick={() => select(r.value)}
            className={cn(
              "rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
              active
                ? "bg-background text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {r.label}
          </button>
        );
      })}
    </div>
  );
}
