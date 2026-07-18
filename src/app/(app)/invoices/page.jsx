"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Download,
  Search,
  ReceiptText,
  CheckCircle2,
  Clock,
  AlertTriangle,
} from "lucide-react";

import { PageHeader } from "@/components/common/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { inr, invoices, fmtDate } from "@/lib/rentals-data";

/** Badge variant + label per invoice status. */
const statusVariant = {
  paid: "default",
  unpaid: "outline",
  partial: "secondary",
  overdue: "destructive",
};
const statusLabel = {
  paid: "Paid",
  unpaid: "Unpaid",
  partial: "Partial",
  overdue: "Overdue",
};

/** Soft tinted square background for a stat tile icon. */
function tintStyle(token) {
  const accent = `var(--dash-${token})`;
  return { color: accent, background: `color-mix(in oklch, ${accent}, transparent 88%)` };
}

const CHIPS = [
  { key: "all", label: "All" },
  { key: "paid", label: "Paid" },
  { key: "unpaid", label: "Unpaid" },
  { key: "partial", label: "Partial" },
  { key: "overdue", label: "Overdue" },
];

export default function InvoicesPage() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");

  // Summary stats.
  const totalInvoiced = invoices.reduce((sum, v) => sum + v.total, 0);
  const paidTotal = invoices
    .filter((v) => v.status === "paid")
    .reduce((sum, v) => sum + v.total, 0);
  const outstanding = invoices
    .filter((v) => v.status !== "paid")
    .reduce((sum, v) => sum + v.total, 0);
  const overdueCount = invoices.filter((v) => v.status === "overdue").length;

  const stats = [
    { label: "Total Invoiced", value: inr.format(totalInvoiced), icon: ReceiptText, token: "indigo" },
    { label: "Paid", value: inr.format(paidTotal), icon: CheckCircle2, token: "emerald" },
    { label: "Outstanding", value: inr.format(outstanding), icon: Clock, token: "amber" },
    { label: "Overdue", value: overdueCount.toLocaleString("en-IN"), icon: AlertTriangle, token: "rose" },
  ];

  const q = query.trim().toLowerCase();
  const filtered = invoices.filter((v) => {
    const matchesStatus = status === "all" || v.status === status;
    if (!matchesStatus) return false;
    if (!q) return true;
    return (
      v.id.toLowerCase().includes(q) ||
      v.orderId.toLowerCase().includes(q) ||
      v.customer.toLowerCase().includes(q)
    );
  });

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Invoices"
        description="Billing across all rental orders"
        actions={
          <Button variant="outline" size="sm">
            <Download className="size-4" />
            Export
          </Button>
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
              <div className="flex items-center justify-between gap-3 p-5">
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
              </div>
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
            placeholder="Search invoice, order, customer…"
            className="h-9 pl-8"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {CHIPS.map((c) => {
            const selected = status === c.key;
            return (
              <button
                key={c.key}
                type="button"
                onClick={() => setStatus(c.key)}
                className={cn(
                  "inline-flex h-7 items-center rounded-full border px-3 text-[0.8rem] font-medium transition-colors",
                  selected
                    ? "border-border bg-background text-foreground shadow-xs"
                    : "border-transparent text-muted-foreground hover:bg-muted/60 hover:text-foreground",
                )}
              >
                {c.label}
              </button>
            );
          })}
        </div>

        <p className="text-sm text-muted-foreground">
          <span className="tabular-nums">{filtered.length}</span>{" "}
          {filtered.length === 1 ? "invoice" : "invoices"}
        </p>
      </div>

      {/* Invoices table */}
      <Card className="animate-dash-rise gap-0 overflow-hidden py-0" style={{ animationDelay: "120ms" }}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs font-medium text-muted-foreground">
                <th className="px-4 py-3 font-medium">Invoice</th>
                <th className="px-4 py-3 font-medium">Order</th>
                <th className="px-4 py-3 font-medium">Customer</th>
                <th className="px-4 py-3 font-medium">Issued</th>
                <th className="px-4 py-3 font-medium">Due</th>
                <th className="px-4 py-3 text-right font-medium">Total</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-sm text-muted-foreground">
                    No invoices match your filters.
                  </td>
                </tr>
              ) : (
                filtered.map((v) => (
                  <tr
                    key={v.id}
                    className="border-b border-border/60 transition-colors hover:bg-muted/40"
                  >
                    <td className="px-4 py-3">
                      <Link
                        href={`/invoices/${v.id}`}
                        className="font-medium text-foreground hover:underline"
                      >
                        {v.id}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/rentals/${v.orderId}`}
                        className="text-muted-foreground hover:underline"
                      >
                        {v.orderId}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-foreground">{v.customer}</div>
                      <div className="text-xs text-muted-foreground">{v.email}</div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">
                      {fmtDate(v.issueDate)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">
                      {fmtDate(v.dueDate)}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-foreground">
                      {inr.format(v.total)}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={statusVariant[v.status]}>{statusLabel[v.status]}</Badge>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
