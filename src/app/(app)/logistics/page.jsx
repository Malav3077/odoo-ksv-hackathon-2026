"use client";

import * as React from "react";
import Link from "next/link";
import {
  Truck,
  PackageCheck,
  Clock,
  Calendar,
  Check,
  ClipboardCheck,
  MapPin,
  Phone,
  ArrowRight,
} from "lucide-react";

import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/common/page-header";
import { cn } from "@/lib/utils";
import {
  rentalOrders,
  stateTone,
  stateLabel,
  fmtDate,
  daysBetween,
  TODAY,
} from "@/lib/rentals-data";

/** Orders awaiting handover, soonest pickup first. */
function buildPickups() {
  return rentalOrders
    .filter((o) => o.state === "reserved")
    .slice()
    .sort((a, b) => a.pickup.localeCompare(b.pickup));
}

/** Orders that are out and awaiting return, soonest expected return first. */
function buildReturns() {
  return rentalOrders
    .filter((o) => ["picked_up", "in_rent", "overdue"].includes(o.state))
    .slice()
    .sort((a, b) => a.expectedReturn.localeCompare(b.expectedReturn));
}

/** Small tinted stat tile above the tab switcher. */
function StatTile({ icon: Icon, label, value, tint }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3">
      <span
        className="flex size-9 shrink-0 items-center justify-center rounded-lg"
        style={{ backgroundColor: `color-mix(in oklab, ${tint} 14%, transparent)`, color: tint }}
      >
        <Icon className="size-4.5" />
      </span>
      <div className="min-w-0">
        <div className="text-lg font-semibold tabular-nums text-foreground leading-none">
          {value}
        </div>
        <div className="mt-1 truncate text-xs text-muted-foreground">{label}</div>
      </div>
    </div>
  );
}

/** Return-timing chip: overdue / due today / in Xd. */
function ReturnTiming({ order }) {
  const d = daysBetween(TODAY, order.expectedReturn);
  if (d < 0) {
    return (
      <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-xs font-medium text-destructive">
        {Math.abs(d)}d overdue
      </span>
    );
  }
  if (d === 0) {
    return (
      <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-600 dark:text-amber-400">
        Due today
      </span>
    );
  }
  return (
    <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
      in {d}d
    </span>
  );
}

/** One task row — a pickup or a return. */
function TaskCard({ order, kind, index }) {
  const isReturn = kind === "returns";
  const overdue = order.state === "overdue";
  const first = order.lineItems[0];
  const more = order.lineItems.length - 1;

  const tint = overdue
    ? "var(--dash-rose)"
    : isReturn
      ? "var(--dash-emerald)"
      : "var(--dash-sky)";
  const Icon = isReturn ? PackageCheck : Truck;
  const dateLabel = isReturn
    ? `Return: ${fmtDate(order.expectedReturn)}`
    : `Pickup: ${fmtDate(order.pickup)}`;

  const noop = () => {};

  return (
    <Card
      className="animate-dash-rise transition-colors hover:border-foreground/20"
      style={{ animationDelay: `${80 + index * 40}ms` }}
    >
      <CardContent className="flex flex-col gap-4 py-4 sm:flex-row sm:items-center">
        {/* Left: tinted icon square */}
        <span
          className="flex size-11 shrink-0 items-center justify-center rounded-xl"
          style={{ backgroundColor: `color-mix(in oklab, ${tint} 14%, transparent)`, color: tint }}
        >
          <Icon className="size-5.5" />
        </span>

        {/* Middle: order details */}
        <div className="min-w-0 flex-1 space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={`/rentals/${order.id}`}
              className="font-medium text-foreground hover:underline"
            >
              {order.id}
            </Link>
            <Badge variant={stateTone[order.state]}>{stateLabel[order.state]}</Badge>
            <span className="text-sm text-muted-foreground">{order.customer}</span>
          </div>

          <div className="truncate text-sm text-foreground">
            {first.product}
            {more > 0 && (
              <span className="text-muted-foreground"> (+{more} more)</span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              {isReturn ? (
                <Clock className="size-3.5" />
              ) : (
                <Calendar className="size-3.5" />
              )}
              <span className="text-foreground">{dateLabel}</span>
              {isReturn && <ReturnTiming order={order} />}
            </span>
            <span className="flex items-center gap-1.5">
              <Phone className="size-3.5" />
              {order.phone}
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin className="size-3.5" />
              {order.deliveryMethod}
            </span>
          </div>
        </div>

        {/* Right: actions */}
        <div className="flex shrink-0 flex-wrap items-center gap-2 sm:justify-end">
          {isReturn ? (
            <Button size="sm" onClick={noop}>
              <PackageCheck className="size-4" />
              Process Return
            </Button>
          ) : (
            <Button size="sm" onClick={noop}>
              <Check className="size-4" />
              Confirm Pickup
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={noop}>
            <ClipboardCheck className="size-4" />
            Inspect
          </Button>
          <Button
            variant="ghost"
            size="sm"
            nativeButton={false}
            render={<Link href={`/rentals/${order.id}`} />}
          >
            View
            <ArrowRight className="size-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function LogisticsPage() {
  const [tab, setTab] = React.useState("pickups");

  const pickups = buildPickups();
  const returns = buildReturns();

  const dueToday =
    pickups.filter((o) => o.pickup === TODAY).length +
    returns.filter((o) => o.expectedReturn === TODAY).length;

  const active = tab === "pickups" ? pickups : returns;

  const tabs = [
    { key: "pickups", label: `Pickups (${pickups.length})` },
    { key: "returns", label: `Returns (${returns.length})` },
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Pickups & Returns"
        description="Today's handovers and inspections"
      />

      {/* Stat tiles */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <StatTile
          icon={Truck}
          label="Due Today"
          value={dueToday}
          tint="var(--dash-amber)"
        />
        <StatTile
          icon={PackageCheck}
          label="Awaiting Pickup"
          value={pickups.length}
          tint="var(--dash-sky)"
        />
        <StatTile
          icon={Clock}
          label="Awaiting Return"
          value={returns.length}
          tint="var(--dash-emerald)"
        />
      </div>

      {/* Tab switcher */}
      <div className="inline-flex w-full max-w-xs rounded-lg bg-muted/40 p-0.5">
        {tabs.map((t) => {
          const selected = tab === t.key;
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={cn(
                "flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                selected
                  ? "bg-background text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Active list */}
      {active.length === 0 ? (
        <Card className="animate-dash-rise" style={{ animationDelay: "80ms" }}>
          <CardContent className="flex flex-col items-center gap-2 py-12 text-center">
            <span className="flex size-11 items-center justify-center rounded-xl bg-muted text-muted-foreground">
              {tab === "pickups" ? (
                <Truck className="size-5.5" />
              ) : (
                <PackageCheck className="size-5.5" />
              )}
            </span>
            <p className="text-sm text-muted-foreground">
              {tab === "pickups"
                ? "No pickups scheduled."
                : "No returns pending."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {active.map((order, i) => (
            <TaskCard key={order.id} order={order} kind={tab} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
