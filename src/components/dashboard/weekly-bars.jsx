"use client";

import * as React from "react";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { weeklyRentals } from "@/lib/dashboard-data";

export function WeeklyBars() {
  const [hover, setHover] = React.useState(null);

  const max = Math.max(...weeklyRentals.map((d) => d.count));
  const total = weeklyRentals.reduce((s, d) => s + d.count, 0);
  const peak = weeklyRentals.reduce((a, b) => (b.count > a.count ? b : a));

  return (
    <Card className="animate-dash-rise" style={{ animationDelay: "240ms" }}>
      <CardHeader>
        <CardTitle>Rentals This Week</CardTitle>
        <CardDescription>
          {total} started · peak {peak.day}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex h-44 items-end justify-between gap-2 sm:gap-3">
          {weeklyRentals.map((d, i) => {
            const active = hover === i;
            const isPeak = d.day === peak.day;
            return (
              <div
                key={d.day}
                className="group flex h-full flex-1 flex-col items-center justify-end gap-2"
                onMouseEnter={() => setHover(i)}
                onMouseLeave={() => setHover(null)}
              >
                <span
                  className={cn(
                    "text-xs font-medium tabular-nums transition-opacity",
                    active ? "text-foreground opacity-100" : "text-muted-foreground opacity-0 group-hover:opacity-100",
                  )}
                >
                  {d.count}
                </span>
                <div
                  className="w-full origin-bottom rounded-t-md transition-all duration-200"
                  style={{
                    height: `${(d.count / max) * 100}%`,
                    background: isPeak
                      ? "linear-gradient(to top, var(--dash-indigo), var(--dash-violet))"
                      : "linear-gradient(to top, var(--dash-sky), color-mix(in oklch, var(--dash-sky), transparent 35%))",
                    opacity: hover === null || active ? 1 : 0.5,
                    animation: `dash-bar-grow 0.7s cubic-bezier(0.22,1,0.36,1) both`,
                    animationDelay: `${i * 70 + 150}ms`,
                    boxShadow: active ? "0 6px 16px -6px var(--dash-indigo)" : "none",
                  }}
                />
                <span className={cn("text-xs transition-colors", active ? "text-foreground" : "text-muted-foreground")}>
                  {d.day}
                </span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
