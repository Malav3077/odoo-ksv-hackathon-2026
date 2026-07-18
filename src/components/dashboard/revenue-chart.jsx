"use client";

import * as React from "react";
import { TrendingUp } from "lucide-react";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
  CardContent,
} from "@/components/ui/card";
import { inr, revenueSeries } from "@/lib/dashboard-data";

const W = 600;
const H = 240;
const PAD = { top: 24, right: 16, bottom: 28, left: 16 };

export function RevenueChart() {
  const [hover, setHover] = React.useState(null);

  const max = Math.max(...revenueSeries.map((d) => d.revenue));
  const min = Math.min(...revenueSeries.map((d) => d.revenue)) * 0.9;
  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;

  const pts = revenueSeries.map((d, i) => {
    const x = PAD.left + (innerW * i) / (revenueSeries.length - 1);
    const y = PAD.top + innerH - (innerH * (d.revenue - min)) / (max - min);
    return { ...d, x, y };
  });

  const line = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
  const area = `${line} L${pts[pts.length - 1].x},${PAD.top + innerH} L${pts[0].x},${PAD.top + innerH} Z`;

  const total = revenueSeries.reduce((s, d) => s + d.revenue, 0);
  const growth = (((pts[pts.length - 1].revenue - pts[0].revenue) / pts[0].revenue) * 100).toFixed(1);

  return (
    <Card className="animate-dash-rise" style={{ animationDelay: "80ms" }}>
      <CardHeader>
        <CardTitle>Rental Revenue</CardTitle>
        <CardDescription>Last 6 months · total {inr.format(total)}</CardDescription>
        <CardAction>
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
            <TrendingUp className="size-3.5" />
            +{growth}%
          </span>
        </CardAction>
      </CardHeader>
      <CardContent>
        <div className="relative">
          <svg
            viewBox={`0 0 ${W} ${H}`}
            className="w-full"
            preserveAspectRatio="none"
            style={{ height: "auto", aspectRatio: `${W} / ${H}` }}
            onMouseLeave={() => setHover(null)}
          >
            <defs>
              <linearGradient id="revFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--dash-indigo)" stopOpacity="0.35" />
                <stop offset="100%" stopColor="var(--dash-indigo)" stopOpacity="0" />
              </linearGradient>
            </defs>

            {/* horizontal gridlines */}
            {[0, 0.25, 0.5, 0.75, 1].map((t) => {
              const y = PAD.top + innerH * t;
              return (
                <line
                  key={t}
                  x1={PAD.left}
                  x2={W - PAD.right}
                  y1={y}
                  y2={y}
                  stroke="var(--dash-grid)"
                  strokeWidth="1"
                />
              );
            })}

            {/* area + line (animated draw) */}
            <path d={area} fill="url(#revFill)" />
            <path
              d={line}
              fill="none"
              stroke="var(--dash-indigo)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              pathLength="1"
              style={{
                strokeDasharray: 1,
                strokeDashoffset: 1,
                animation: "dash-draw 1.1s ease-out forwards",
                "--dash-len": 1,
              }}
            />

            {/* hover guide */}
            {hover !== null && (
              <line
                x1={pts[hover].x}
                x2={pts[hover].x}
                y1={PAD.top}
                y2={PAD.top + innerH}
                stroke="var(--dash-indigo)"
                strokeWidth="1"
                strokeDasharray="4 4"
                opacity="0.5"
              />
            )}

            {/* points */}
            {pts.map((p, i) => (
              <circle
                key={p.month}
                cx={p.x}
                cy={p.y}
                r={hover === i ? 6 : 3.5}
                fill="var(--background)"
                stroke="var(--dash-indigo)"
                strokeWidth="2.5"
                className="transition-all"
              />
            ))}

            {/* month labels */}
            {pts.map((p) => (
              <text
                key={p.month}
                x={p.x}
                y={H - 8}
                textAnchor="middle"
                className="fill-muted-foreground"
                style={{ fontSize: 11 }}
              >
                {p.month}
              </text>
            ))}

            {/* hover hit-areas */}
            {pts.map((p, i) => (
              <rect
                key={p.month}
                x={p.x - innerW / (pts.length - 1) / 2}
                y={0}
                width={innerW / (pts.length - 1)}
                height={H}
                fill="transparent"
                onMouseEnter={() => setHover(i)}
              />
            ))}
          </svg>

          {/* tooltip */}
          {hover !== null && (
            <div
              className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full rounded-lg border border-border bg-popover px-2.5 py-1.5 text-xs shadow-lg"
              style={{
                left: `${(pts[hover].x / W) * 100}%`,
                top: `${(pts[hover].y / H) * 100}%`,
                marginTop: "-8px",
              }}
            >
              <div className="font-medium text-foreground">{pts[hover].month}</div>
              <div className="text-muted-foreground">{inr.format(pts[hover].revenue)}</div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
