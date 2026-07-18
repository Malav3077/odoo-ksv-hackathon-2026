"use client";

import * as React from "react";
import Link from "next/link";
import { Search, FileText } from "lucide-react";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { inr } from "@/lib/dashboard-data";

/** Badge label + tone per quotation status. */
const STATUS_META = {
  quotation: { label: "Draft", tone: "outline" },
  quotation_sent: { label: "Sent", tone: "secondary" },
};

const TABS = [
  { key: "all", label: "All" },
  { key: "quotation", label: "Draft" },
  { key: "quotation_sent", label: "Sent" },
];

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** "2026-07-16" -> "16 Jul". */
function shortDate(iso) {
  if (!iso) return "—";
  const [, m, d] = iso.split("-").map(Number);
  return `${d} ${MONTHS[m - 1]}`;
}

export function QuotationsTable({ rows }) {
  const [query, setQuery] = React.useState("");
  const [tab, setTab] = React.useState("all");

  const counts = React.useMemo(
    () => ({
      all: rows.length,
      quotation: rows.filter((r) => r.status === "quotation").length,
      quotation_sent: rows.filter((r) => r.status === "quotation_sent").length,
    }),
    [rows],
  );

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((r) => {
      if (tab !== "all" && r.status !== tab) return false;
      if (!q) return true;
      return (
        r.reference.toLowerCase().includes(q) ||
        r.customer.toLowerCase().includes(q)
      );
    });
  }, [rows, tab, query]);

  return (
    <Card className="animate-dash-rise">
      <CardHeader>
        <CardTitle>All Quotations</CardTitle>
        <CardDescription>
          {counts.all} total · {counts.quotation} draft · {counts.quotation_sent} sent
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col gap-4 px-0">
        {/* toolbar: status tabs + search */}
        <div className="flex flex-col gap-3 px-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="inline-flex rounded-lg border border-border bg-muted/40 p-0.5">
            {TABS.map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => setTab(t.key)}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                  tab === t.key
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {t.label}
                <span className="text-xs tabular-nums text-muted-foreground">{counts[t.key]}</span>
              </button>
            ))}
          </div>

          <div className="relative sm:w-64">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search reference or customer…"
              className="pl-8"
            />
          </div>
        </div>

        {/* table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-y border-border text-left text-xs text-muted-foreground">
                <th className="px-6 py-2.5 font-medium">Reference</th>
                <th className="px-3 py-2.5 font-medium">Customer</th>
                <th className="px-3 py-2.5 font-medium">Status</th>
                <th className="px-3 py-2.5 font-medium">Items</th>
                <th className="px-3 py-2.5 font-medium">Pickup</th>
                <th className="px-3 py-2.5 font-medium">Created</th>
                <th className="px-6 py-2.5 text-right font-medium">Total</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => {
                const meta = STATUS_META[r.status] ?? { label: r.status, tone: "outline" };
                return (
                  <tr
                    key={r.id}
                    className="border-b border-border/60 last:border-0 transition-colors hover:bg-muted/40"
                  >
                    <td className="px-6 py-3">
                      <Link
                        href={`/rentals/${r.id}`}
                        className="font-medium text-foreground hover:underline"
                      >
                        {r.reference}
                      </Link>
                    </td>
                    <td className="px-3 py-3 text-foreground">{r.customer}</td>
                    <td className="px-3 py-3">
                      <Badge variant={meta.tone}>{meta.label}</Badge>
                    </td>
                    <td className="px-3 py-3 tabular-nums text-muted-foreground">{r.itemsCount}</td>
                    <td className="px-3 py-3 text-muted-foreground">{shortDate(r.pickup)}</td>
                    <td className="px-3 py-3 text-muted-foreground">{shortDate(r.createdAt)}</td>
                    <td className="px-6 py-3 text-right font-medium tabular-nums text-foreground">
                      {inr.format(r.total)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filtered.length === 0 && (
            <div className="flex flex-col items-center gap-2 py-14 text-center">
              <span className="flex size-11 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                <FileText className="size-5" />
              </span>
              <p className="text-sm font-medium text-foreground">No quotations found</p>
              <p className="text-xs text-muted-foreground">
                {query || tab !== "all"
                  ? "Try clearing the search or switching tabs."
                  : "Create your first quotation to get started."}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
