import Link from "next/link";
import { AlertTriangle, Clock, ArrowRight } from "lucide-react";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { inr, recentOrders } from "@/lib/dashboard-data";

/**
 * "Today" is fixed rather than `new Date()` so the server and client render the
 * same markup (no hydration mismatch) and the panel stays deterministic — the
 * mock data is dated around this day. Swap for the real "now" once the panel
 * reads live data from GET /api/rentals/orders/.
 */
const TODAY = "2026-07-18";

/** Whole-day difference b − a from two ISO date strings. Deterministic; no `Date.now()`. */
function daysBetween(aIso, bIso) {
  const [ay, am, ad] = aIso.split("-").map(Number);
  const [by, bm, bd] = bIso.split("-").map(Number);
  return Math.round((Date.UTC(by, bm - 1, bd) - Date.UTC(ay, am - 1, ad)) / 86_400_000);
}

/** Orders that need action today: overdue, or returning within the next 3 days. */
function buildAttentionList() {
  const items = recentOrders
    .filter((o) => o.state !== "returned" && o.state !== "quotation")
    .map((o) => ({ ...o, daysLeft: daysBetween(TODAY, o.expectedReturn) }))
    .filter((o) => o.state === "overdue" || (o.daysLeft >= 0 && o.daysLeft <= 3))
    // Most urgent first: overdue (negative days) before soonest returns.
    .sort((a, b) => a.daysLeft - b.daysLeft);
  return items;
}

/** Urgency chip label + tone for a given item. */
function urgency(item) {
  if (item.state === "overdue" || item.daysLeft < 0) {
    const late = Math.abs(item.daysLeft);
    return { label: `${late}d overdue`, tone: "danger" };
  }
  if (item.daysLeft === 0) return { label: "Due today", tone: "warn" };
  if (item.daysLeft === 1) return { label: "Due tomorrow", tone: "warn" };
  return { label: `Due in ${item.daysLeft}d`, tone: "muted" };
}

export function AttentionPanel() {
  const items = buildAttentionList();
  const overdueCount = items.filter((i) => i.state === "overdue" || i.daysLeft < 0).length;
  const soonCount = items.length - overdueCount;

  return (
    <Card
      className="animate-dash-rise relative overflow-hidden"
      style={{ animationDelay: "40ms" }}
    >
      {/* left accent rail signalling this is an action zone */}
      <span
        className="absolute inset-y-0 left-0 w-1"
        style={{ backgroundColor: "var(--dash-rose)" }}
      />
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="size-4.5" style={{ color: "var(--dash-rose)" }} />
          Needs Attention
        </CardTitle>
        <CardDescription>
          {overdueCount} overdue · {soonCount} returning soon
        </CardDescription>
        <CardAction>
          <Button variant="outline" size="sm" nativeButton={false} render={<Link href="/rentals" />}>
            View all
            <ArrowRight className="size-4" />
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className="px-0">
        {items.length === 0 ? (
          <p className="px-6 py-8 text-center text-sm text-muted-foreground">
            All clear — nothing overdue or due soon.
          </p>
        ) : (
          <ul className="flex flex-col">
            {items.map((item) => {
              const u = urgency(item);
              return (
                <li key={item.id}>
                  <Link
                    href={`/rentals/${item.id}`}
                    className="flex items-center gap-3 border-b border-border/60 px-6 py-3 transition-colors last:border-0 hover:bg-muted/40"
                  >
                    <span
                      className={cn(
                        "flex size-9 shrink-0 items-center justify-center rounded-lg",
                        u.tone === "danger"
                          ? "bg-destructive/10 text-destructive"
                          : u.tone === "warn"
                            ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                            : "bg-muted text-muted-foreground",
                      )}
                    >
                      {u.tone === "danger" ? (
                        <AlertTriangle className="size-4.5" />
                      ) : (
                        <Clock className="size-4.5" />
                      )}
                    </span>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-foreground">{item.id}</span>
                        <span className="truncate text-xs text-muted-foreground">
                          {item.customer}
                        </span>
                      </div>
                      <span className="truncate text-xs text-muted-foreground">{item.product}</span>
                    </div>

                    <div className="flex shrink-0 flex-col items-end gap-1">
                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5 text-xs font-medium",
                          u.tone === "danger"
                            ? "bg-destructive/10 text-destructive"
                            : u.tone === "warn"
                              ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                              : "bg-muted text-muted-foreground",
                        )}
                      >
                        {u.label}
                      </span>
                      <span className="text-xs font-medium tabular-nums text-foreground">
                        {inr.format(item.amount)}
                      </span>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
