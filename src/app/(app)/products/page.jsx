"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Plus,
  Download,
  Search,
  Boxes,
  CheckCircle2,
  Truck,
  AlertTriangle,
  PackageOpen,
} from "lucide-react";

import { PageHeader } from "@/components/common/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  inr,
  products,
  productCategories,
  productAvailable,
} from "@/lib/rentals-data";

const STATS = [
  {
    key: "total",
    label: "Total Products",
    icon: Boxes,
    tint: "var(--dash-indigo)",
    value: () => products.length,
  },
  {
    key: "published",
    label: "Published",
    icon: CheckCircle2,
    tint: "var(--dash-emerald)",
    value: () => products.filter((p) => p.status === "published").length,
  },
  {
    key: "onrent",
    label: "Units On Rent",
    icon: Truck,
    tint: "var(--dash-sky)",
    value: () => products.reduce((sum, p) => sum + p.onRent, 0),
  },
  {
    key: "low",
    label: "Low Stock",
    icon: AlertTriangle,
    tint: "var(--dash-amber)",
    value: () => products.filter((p) => productAvailable(p) <= 2).length,
  },
];

export default function ProductsPage() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter((p) => {
      const matchesCategory = category === "All" || p.category === category;
      const matchesQuery =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.id.toLowerCase().includes(q);
      return matchesCategory && matchesQuery;
    });
  }, [query, category]);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Products"
        description="Catalog, availability and rental pricing"
        actions={
          <>
            <Button variant="outline" size="sm">
              <Download className="size-4" />
              Export
            </Button>
            <Button size="sm">
              <Plus className="size-4" />
              New Product
            </Button>
          </>
        }
      />

      {/* Summary stat tiles */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {STATS.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <Card
              key={stat.key}
              className="animate-dash-rise"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <CardContent className="flex items-center gap-3">
                <div
                  className="flex size-10 shrink-0 items-center justify-center rounded-lg"
                  style={{
                    backgroundColor: `color-mix(in oklab, ${stat.tint} 14%, transparent)`,
                    color: stat.tint,
                  }}
                >
                  <Icon className="size-5" />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-xs text-muted-foreground">
                    {stat.label}
                  </p>
                  <p className="text-2xl font-semibold tabular-nums text-foreground">
                    {stat.value()}
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products…"
              className="pl-9"
            />
          </div>
          <p className="text-sm text-muted-foreground tabular-nums">
            {filtered.length} of {products.length} products
          </p>
        </div>

        {/* Category filter chips */}
        <div className="flex flex-wrap gap-2">
          {["All", ...productCategories].map((cat) => {
            const active = category === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={cn(
                  "rounded-full border px-3 py-1 text-sm transition-colors",
                  active
                    ? "border-border bg-background text-foreground shadow-xs"
                    : "border-transparent bg-muted text-muted-foreground hover:bg-muted/70 hover:text-foreground",
                )}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Product grid */}
      {filtered.length === 0 ? (
        <Card className="animate-dash-rise">
          <CardContent className="flex flex-col items-center justify-center gap-2 py-16 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <PackageOpen className="size-6" />
            </div>
            <p className="text-sm font-medium text-foreground">
              No products found
            </p>
            <p className="text-sm text-muted-foreground">
              Try a different search or category filter.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((p, i) => {
            const available = productAvailable(p);
            const low = available <= 2;
            const pct =
              p.totalUnits > 0
                ? Math.min(100, Math.round((p.onRent / p.totalUnits) * 100))
                : 0;
            const isPublished = p.status === "published";
            return (
              <Card
                key={p.id}
                className="animate-dash-rise transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
                style={{ animationDelay: `${i * 40}ms` }}
              >
                <CardContent className="flex flex-col gap-4">
                  {/* Header row */}
                  <div className="flex items-start gap-3">
                    <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-muted text-2xl">
                      {p.icon}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-foreground">
                        {p.name}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {p.brand} · {p.category}
                      </p>
                    </div>
                    {isPublished ? (
                      <Badge
                        variant="secondary"
                        className="shrink-0 border-transparent bg-[color-mix(in_oklab,var(--dash-emerald)_16%,transparent)] text-[var(--dash-emerald)]"
                      >
                        Published
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="shrink-0 text-muted-foreground"
                      >
                        Draft
                      </Badge>
                    )}
                  </div>

                  {/* Availability block */}
                  <div className="space-y-1.5">
                    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${pct}%`,
                          backgroundColor: "var(--dash-indigo)",
                        }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span
                        className={cn(
                          "tabular-nums",
                          low
                            ? "text-[var(--dash-rose)]"
                            : "text-muted-foreground",
                        )}
                      >
                        {available} of {p.totalUnits} available
                      </span>
                      {low && (
                        <span className="font-medium text-[var(--dash-rose)]">
                          Low stock
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between border-t border-border pt-3">
                    <p className="text-sm font-medium tabular-nums text-foreground">
                      {inr.format(p.ratePerDay)}
                      <span className="font-normal text-muted-foreground">
                        /day
                      </span>
                    </p>
                    <p className="text-xs text-muted-foreground tabular-nums">
                      Deposit {inr.format(p.deposit)}
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
