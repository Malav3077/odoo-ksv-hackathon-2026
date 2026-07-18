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
import { statusDistribution } from "@/lib/dashboard-data";

const R = 70;
const STROKE = 22;
const C = 2 * Math.PI * R;

export function StatusDonut() {
  const [hover, setHover] = React.useState(null);

  const total = statusDistribution.reduce((s, d) => s + d.value, 0);
  let acc = 0;
  const segments = statusDistribution.map((d) => {
    const fraction = d.value / total;
    const seg = { ...d, fraction, offsetTurn: acc };
    acc += fraction;
    return seg;
  });

  return (
    <Card className="animate-dash-rise" style={{ animationDelay: "160ms" }}>
      <CardHeader>
        <CardTitle>Orders by Status</CardTitle>
        <CardDescription>{total} orders this month</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-between">
          <div className="relative shrink-0">
            <svg viewBox="0 0 200 200" className="size-44" onMouseLeave={() => setHover(null)}>
              <g transform="rotate(-90 100 100)">
                {segments.map((s, i) => {
                  const arc = s.fraction * C;
                  const active = hover === i;
                  return (
                    <circle
                      key={s.label}
                      cx="100"
                      cy="100"
                      r={R}
                      fill="none"
                      stroke={`var(--dash-${s.color})`}
                      strokeWidth={active ? STROKE + 5 : STROKE}
                      strokeDasharray={`${arc} ${C - arc}`}
                      transform={`rotate(${s.offsetTurn * 360} 100 100)`}
                      className="cursor-pointer transition-[stroke-width] duration-200"
                      style={{
                        strokeDashoffset: arc,
                        animation: `dash-sweep 0.9s cubic-bezier(0.22,1,0.36,1) forwards`,
                        animationDelay: `${i * 120 + 200}ms`,
                        "--circ": arc,
                        "--target": 0,
                        opacity: hover === null || active ? 1 : 0.45,
                      }}
                      onMouseEnter={() => setHover(i)}
                    />
                  );
                })}
              </g>
            </svg>
            {/* center label */}
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-semibold tracking-tight text-foreground tabular-nums">
                {hover === null ? total : segments[hover].value}
              </span>
              <span className="text-xs text-muted-foreground">
                {hover === null ? "Total" : segments[hover].label}
              </span>
            </div>
          </div>

          {/* legend */}
          <ul className="flex w-full flex-col gap-2 sm:max-w-[180px]">
            {segments.map((s, i) => (
              <li
                key={s.label}
                className={cn(
                  "flex cursor-pointer items-center justify-between rounded-md px-2 py-1.5 text-sm transition-colors",
                  hover === i ? "bg-muted" : "hover:bg-muted/50",
                )}
                onMouseEnter={() => setHover(i)}
                onMouseLeave={() => setHover(null)}
              >
                <span className="flex items-center gap-2 text-muted-foreground">
                  <span
                    className="size-2.5 rounded-full"
                    style={{ backgroundColor: `var(--dash-${s.color})` }}
                  />
                  {s.label}
                </span>
                <span className="font-medium tabular-nums text-foreground">
                  {Math.round(s.fraction * 100)}%
                </span>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
