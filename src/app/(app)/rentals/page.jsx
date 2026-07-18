"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Plus,
  Download,
  Search,
  Package,
  Activity,
  AlertTriangle,
  IndianRupee,
} from "lucide-react";

import { PageHeader } from "@/components/common/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  inr,
  rentalOrders,
  stateTone,
  stateLabel,
  fmtShort,
} from "@/lib/rentals-data";

/** Soft tinted square background for a stat tile icon. */
function tintStyle(token) {
  const accent = `var(--dash-${token})`;
  return { color: accent, background: `color-mix(in oklch, ${accent}, transparent 88%)` };
}

const ACTIVE_STATES = new Set(["picked_up", "in_rent"]);

export default function RentalsPage() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");

  // Summary stats
  const totalOrders = rentalOrders.length;
  const activeCount = rentalOrders.filter((o) => ACTIVE_STATES.has(o.state)).length;
  const overdueCount = rentalOrders.filter((o) => o.state === "overdue").length;
  const revenue = rentalOrders
    .filter((o) => o.state !== "cancelled")
    .reduce((sum, o) => sum + o.amount, 0);

  const stats = [
    { label: "Total Orders", value: totalOrders.toLocaleString("en-IN"), icon: Package, token: "indigo" },
    { label: "Active", value: activeCount.toLocaleString("en-IN"), icon: Activity, token: "sky" },
    { label: "Overdue", value: overdueCount.toLocaleString("en-IN"), icon: AlertTriangle, token: "rose" },
    { label: "Revenue (This Month)", value: inr.format(revenue), icon: IndianRupee, token: "emerald" },
  ];

  // Distinct states, ordered by first appearance in the dataset.
  const presentStates = [];
  for (const o of rentalOrders) {
    if (!presentStates.includes(o.state)) presentStates.push(o.state);
  }
  const chips = ["all", ...presentStates];

  const q = query.trim().toLowerCase();
  const filtered = rentalOrders.filter((o) => {
    const matchesStatus = status === "all" || o.state === status;
    if (!matchesStatus) return false;
    if (!q) return true;
    const inProduct = o.lineItems.some((li) => li.product.toLowerCase().includes(q));
    return (
      o.id.toLowerCase().includes(q) ||
      o.customer.toLowerCase().includes(q) ||
      inProduct
    );
  });

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Rentals"
        description="All rental orders across the lifecycle"
        actions={
          <>
            <Button variant="outline" size="sm">
              <Download className="size-4" />
              Export
            </Button>
            <Button size="sm" nativeButton={false} render={<Link href="/quotations" />}>
              <Plus className="size-4" />
              New Quotation
            </Button>
          </>
        }
      />

      {/* Summary stat tiles */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s, i) => {
          const Icon = s.icon;
          return (
            <Card
              key={s.label}
              className="animate-dash-rise gap-0 py-0"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <CardContent className="flex items-center justify-between gap-3 p-5">
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground">{s.label}</p>
                  <p className="text-2xl font-semibold tabular-nums text-foreground">{s.value}</p>
                </div>
                <span
                  className="flex size-10 shrink-0 items-center justify-center rounded-xl"
                  style={tintStyle(s.token)}
                >
                  <Icon className="size-5" />
                </span>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Toolbar: search + status chips */}
      <div className="flex flex-col gap-4">
        <div className="relative w-full sm:max-w-sm">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search order, customer, product…"
            className="h-9 pl-8"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {chips.map((c) => {
            const selected = status === c;
            const label = c === "all" ? "All" : stateLabel[c];
            return (
              <button
                key={c}
                type="button"
                onClick={() => setStatus(c)}
                className={cn(
                  "inline-flex h-7 items-center rounded-full border px-3 text-[0.8rem] font-medium transition-colors",
                  selected
                    ? "border-border bg-background text-foreground shadow-xs"
                    : "border-transparent text-muted-foreground hover:bg-muted/60 hover:text-foreground",
                )}
              >
                {label}
              </button>
            );
          })}
        </div>

        <p className="text-sm text-muted-foreground">
          <span className="tabular-nums">{filtered.length}</span>{" "}
          {filtered.length === 1 ? "order" : "orders"}
        </p>
      </div>

      {/* Orders table */}
      <Card className="animate-dash-rise gap-0 overflow-hidden py-0" style={{ animationDelay: "120ms" }}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs font-medium text-muted-foreground">
                <th className="px-4 py-3 font-medium">Order</th>
                <th className="px-4 py-3 font-medium">Customer</th>
                <th className="px-4 py-3 font-medium">Items</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Period</th>
                <th className="px-4 py-3 text-right font-medium">Amount</th>
                <th className="px-4 py-3 text-right font-medium">Deposit</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-sm text-muted-foreground">
                    No orders match your filters.
                  </td>
                </tr>
              ) : (
                filtered.map((o) => {
                  const first = o.lineItems[0];
                  const more = o.lineItems.length - 1;
                  return (
                    <tr
                      key={o.id}
                      className="border-b border-border/60 transition-colors hover:bg-muted/40"
                    >
                      <td className="px-4 py-3">
                        <Link
                          href={`/rentals/${o.id}`}
                          className="font-medium text-foreground hover:underline"
                        >
                          {o.id}
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-foreground">{o.customer}</div>
                        {o.company !== "—" && (
                          <div className="text-xs text-muted-foreground">{o.company}</div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        <span className="text-foreground">{first?.product}</span>
                        {more > 0 && (
                          <span className="text-muted-foreground"> (+{more} more)</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={stateTone[o.state]}>{stateLabel[o.state]}</Badge>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">
                        {fmtShort(o.pickup)} → {fmtShort(o.expectedReturn)}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums text-foreground">
                        {inr.format(o.amount)}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">
                        {inr.format(o.deposit)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
