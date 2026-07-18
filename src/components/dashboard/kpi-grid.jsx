import {
  Activity,
  CalendarClock,
  TrendingUp,
  TrendingDown,
  Truck,
  PackageCheck,
  AlertTriangle,
  IndianRupee,
  Wallet,
  AlarmClock,
} from "lucide-react";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { inr, kpis } from "@/lib/dashboard-data";
import { Sparkline } from "@/components/dashboard/sparkline";

/** Icon per KPI key. */
const ICONS = {
  active: Activity,
  due_today: CalendarClock,
  upcoming_pickups: Truck,
  upcoming_returns: PackageCheck,
  overdue: AlertTriangle,
  revenue: IndianRupee,
  deposits_held: Wallet,
  late_fees: AlarmClock,
};

const CURRENCY_KEYS = new Set(["revenue", "deposits_held", "late_fees"]);

function formatValue(kpi) {
  return kpi.unit === "currency" ? inr.format(kpi.value) : kpi.value.toLocaleString("en-IN");
}

function formatDelta(kpi) {
  const sign = kpi.delta > 0 ? "+" : "";
  return CURRENCY_KEYS.has(kpi.key) ? `${sign}${kpi.delta}%` : `${sign}${kpi.delta}`;
}

export function KpiGrid() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {kpis.map((kpi, i) => {
        const Icon = ICONS[kpi.key] ?? Activity;
        const TrendIcon = kpi.trend === "down" ? TrendingDown : TrendingUp;
        // "up" is good for most; for overdue an increase is bad.
        const positive = kpi.key === "overdue" ? kpi.trend === "down" : kpi.trend === "up";
        const accent = `var(--dash-${kpi.color})`;

        return (
          <Card
            key={kpi.key}
            className="group animate-dash-rise relative gap-0 overflow-hidden py-0 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-black/5"
            style={{ animationDelay: `${i * 60}ms` }}
          >
            {/* top accent bar */}
            <span
              className="absolute inset-x-0 top-0 h-1 origin-left scale-x-0 transition-transform duration-300 group-hover:scale-x-100"
              style={{ backgroundColor: accent }}
            />
            {/* soft corner glow on hover */}
            <span
              className="pointer-events-none absolute -right-8 -top-8 size-24 rounded-full opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-20"
              style={{ backgroundColor: accent }}
            />

            <div className="flex flex-col gap-3 p-5">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">{kpi.label}</span>
                <span
                  className="flex size-9 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110"
                  style={{
                    color: accent,
                    background: `color-mix(in oklch, ${accent}, transparent 88%)`,
                  }}
                >
                  <Icon className="size-4.5" />
                </span>
              </div>

              <div className="flex items-end justify-between gap-2">
                <span className="text-2xl font-semibold tracking-tight text-foreground tabular-nums">
                  {formatValue(kpi)}
                </span>
                <Sparkline data={kpi.spark} color={accent} uid={kpi.key} />
              </div>

              <div className="flex items-center gap-1.5 text-xs">
                <span
                  className={cn(
                    "inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 font-medium",
                    positive
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                      : "bg-destructive/10 text-destructive",
                  )}
                >
                  <TrendIcon className="size-3.5" />
                  {formatDelta(kpi)}
                </span>
                <span className="text-muted-foreground">{kpi.hint}</span>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
