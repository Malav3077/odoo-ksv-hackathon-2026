"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Printer,
  Check,
  MapPin,
  AlertTriangle,
  Mail,
  Phone,
  Building2,
  Truck,
  CalendarClock,
  PackageCheck,
  Send,
} from "lucide-react";

import { PageHeader } from "@/components/common/page-header";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  inr,
  stateTone,
  stateLabel,
  getRentalOrder,
  orderTotal,
  orderTimeline,
  fmtDate,
  daysBetween,
  TODAY,
} from "@/lib/rentals-data";

/** Label/value row for the sidebar cards. */
function InfoRow({ label, value, className }) {
  return (
    <div className={cn("flex items-start justify-between gap-4 text-sm", className)}>
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium text-foreground">{value}</span>
    </div>
  );
}

export default function OrderDetailPage() {
  const { id } = useParams();
  const order = getRentalOrder(id);

  if (!order) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Card className="w-full max-w-sm text-center">
          <CardContent className="flex flex-col items-center gap-4 py-4">
            <span className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <AlertTriangle className="size-6" />
            </span>
            <div className="space-y-1">
              <p className="font-semibold text-foreground">Order not found</p>
              <p className="text-sm text-muted-foreground">
                We couldn&apos;t find an order with that reference.
              </p>
            </div>
            <Button variant="outline" size="sm" nativeButton={false} render={<Link href="/rentals" />}>
              <ArrowLeft className="size-4" />
              Back to rentals
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const timeline = orderTimeline(order);
  const isOverdue = order.state === "overdue";
  const overdueDays = isOverdue ? daysBetween(order.expectedReturn, TODAY) : 0;

  // State-dependent primary action.
  let primaryAction = null;
  if (order.state === "reserved") {
    primaryAction = { label: "Confirm Pickup", icon: PackageCheck };
  } else if (["picked_up", "in_rent", "overdue"].includes(order.state)) {
    primaryAction = { label: "Process Return", icon: Truck };
  } else if (order.state === "quotation") {
    primaryAction = { label: "Send Quotation", icon: Send };
  }
  const PrimaryIcon = primaryAction?.icon;

  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/rentals"
        className="inline-flex w-fit items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Back to rentals
      </Link>

      <PageHeader
        title={order.id}
        description={
          <span className="flex flex-wrap items-center gap-2">
            <Badge variant={stateTone[order.state]}>{stateLabel[order.state]}</Badge>
            <span>
              {order.customer} · Created {fmtDate(order.createdAt)}
            </span>
          </span>
        }
        actions={
          <>
            <Button variant="outline" size="sm">
              <Printer className="size-4" />
              Print
            </Button>
            {primaryAction && (
              <Button size="sm">
                <PrimaryIcon className="size-4" />
                {primaryAction.label}
              </Button>
            )}
          </>
        }
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* LEFT column */}
        <div className="flex flex-col gap-4 lg:col-span-2">
          {/* Lifecycle */}
          <Card className="animate-dash-rise" style={{ animationDelay: "40ms" }}>
            <CardHeader>
              <CardTitle>Lifecycle</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="relative">
                {timeline.map((step, i) => {
                  const last = i === timeline.length - 1;
                  const active = step.done || step.current;
                  return (
                    <li key={step.key} className="relative flex gap-4 pb-6 last:pb-0">
                      {/* connecting line */}
                      {!last && (
                        <span
                          className={cn(
                            "absolute left-[15px] top-8 h-[calc(100%-2rem)] w-px",
                            step.done ? "bg-[var(--dash-emerald)]" : "bg-border",
                          )}
                        />
                      )}
                      {/* node */}
                      <span
                        className={cn(
                          "relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                          step.done
                            ? "border-transparent text-white"
                            : step.current
                              ? "bg-background"
                              : "border-border bg-background",
                        )}
                        style={
                          step.done
                            ? { backgroundColor: "var(--dash-emerald)" }
                            : step.current
                              ? {
                                  borderColor: "var(--dash-indigo)",
                                  boxShadow: "0 0 0 3px color-mix(in oklch, var(--dash-indigo), transparent 82%)",
                                }
                              : undefined
                        }
                      >
                        {step.done ? (
                          <Check className="size-4" />
                        ) : (
                          <span
                            className="size-2 rounded-full"
                            style={{
                              backgroundColor: step.current
                                ? "var(--dash-indigo)"
                                : "var(--color-muted-foreground, currentColor)",
                            }}
                          />
                        )}
                      </span>
                      {/* label */}
                      <div className="flex min-w-0 flex-1 flex-col pt-1">
                        <span
                          className={cn(
                            "text-sm font-medium",
                            active ? "text-foreground" : "text-muted-foreground",
                          )}
                        >
                          {step.label}
                        </span>
                        <span className="text-xs text-muted-foreground">{fmtDate(step.date)}</span>
                      </div>
                    </li>
                  );
                })}
              </ol>
            </CardContent>
          </Card>

          {/* Items */}
          <Card className="animate-dash-rise gap-0" style={{ animationDelay: "80ms" }}>
            <CardHeader className="pb-4">
              <CardTitle>Items</CardTitle>
            </CardHeader>
            <CardContent className="px-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-y border-border text-left text-xs font-medium text-muted-foreground">
                      <th className="px-6 py-2.5 font-medium">Product</th>
                      <th className="px-6 py-2.5 text-right font-medium">Qty</th>
                      <th className="px-6 py-2.5 text-right font-medium">Rate/day</th>
                      <th className="px-6 py-2.5 text-right font-medium">Days</th>
                      <th className="px-6 py-2.5 text-right font-medium">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.lineItems.map((li) => (
                      <tr key={li.sku} className="border-b border-border/60">
                        <td className="px-6 py-3">
                          <div className="font-medium text-foreground">{li.product}</div>
                          <div className="text-xs text-muted-foreground">{li.sku}</div>
                        </td>
                        <td className="px-6 py-3 text-right tabular-nums text-foreground">{li.qty}</td>
                        <td className="px-6 py-3 text-right tabular-nums text-muted-foreground">
                          {inr.format(li.rate)}
                        </td>
                        <td className="px-6 py-3 text-right tabular-nums text-muted-foreground">{li.days}</td>
                        <td className="px-6 py-3 text-right tabular-nums font-medium text-foreground">
                          {inr.format(li.subtotal)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
            <CardFooter className="justify-between border-t border-border pt-4">
              <span className="text-sm text-muted-foreground">Subtotal</span>
              <span className="text-sm font-semibold tabular-nums text-foreground">
                {inr.format(order.amount)}
              </span>
            </CardFooter>
          </Card>

          {/* Notes */}
          {order.notes && (
            <Card className="animate-dash-rise" style={{ animationDelay: "120ms" }}>
              <CardHeader>
                <CardTitle>Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed text-muted-foreground">{order.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* RIGHT column */}
        <div className="flex flex-col gap-4">
          {/* Customer */}
          <Card className="animate-dash-rise" style={{ animationDelay: "60ms" }}>
            <CardHeader>
              <CardTitle>Customer</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="font-medium text-foreground">{order.customer}</p>
                {order.company !== "—" && (
                  <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Building2 className="size-3.5" />
                    {order.company}
                  </p>
                )}
              </div>
              <div className="space-y-2 border-t border-border pt-3 text-sm">
                <p className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="size-4 shrink-0" />
                  <span className="truncate text-foreground">{order.email}</span>
                </p>
                <p className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="size-4 shrink-0" />
                  <span className="text-foreground">{order.phone}</span>
                </p>
                <p className="flex items-start gap-2 text-muted-foreground">
                  <MapPin className="mt-0.5 size-4 shrink-0" />
                  <span className="text-foreground">{order.address}</span>
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Payment Summary */}
          <Card className="animate-dash-rise" style={{ animationDelay: "100ms" }}>
            <CardHeader>
              <CardTitle>Payment Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <InfoRow label="Rental Amount" value={inr.format(order.amount)} />
              <InfoRow
                label="Late Fee"
                value={
                  order.lateFee > 0 ? (
                    <span className="text-destructive">{inr.format(order.lateFee)}</span>
                  ) : (
                    "—"
                  )
                }
              />
              <div className="border-t border-border" />
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-foreground">Total</span>
                <span className="text-base font-semibold tabular-nums text-foreground">
                  {inr.format(orderTotal(order))}
                </span>
              </div>
              <div className="flex items-start justify-between gap-4 text-sm">
                <span className="text-muted-foreground">
                  Security Deposit
                  <span className="ml-1 text-xs text-muted-foreground/70">(refundable)</span>
                </span>
                <span className="text-right font-medium tabular-nums text-foreground">
                  {inr.format(order.deposit)}
                </span>
              </div>

              {isOverdue && (
                <div
                  className="flex items-start gap-2 rounded-lg p-3 text-sm text-destructive"
                  style={{ background: "color-mix(in oklch, var(--destructive), transparent 90%)" }}
                >
                  <AlertTriangle className="mt-0.5 size-4 shrink-0" />
                  <span>
                    This rental is overdue by{" "}
                    <span className="font-semibold tabular-nums">{overdueDays}</span>{" "}
                    {overdueDays === 1 ? "day" : "days"}.
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Schedule */}
          <Card className="animate-dash-rise" style={{ animationDelay: "140ms" }}>
            <CardHeader>
              <CardTitle>Schedule</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <InfoRow
                label="Delivery Method"
                value={
                  <span className="inline-flex items-center gap-1.5">
                    <Truck className="size-3.5 text-muted-foreground" />
                    {order.deliveryMethod}
                  </span>
                }
              />
              <InfoRow
                label="Pickup"
                value={
                  <span className="inline-flex items-center gap-1.5">
                    <CalendarClock className="size-3.5 text-muted-foreground" />
                    {fmtDate(order.pickup)}
                  </span>
                }
              />
              <InfoRow label="Expected Return" value={fmtDate(order.expectedReturn)} />
              <InfoRow
                label="Returned"
                value={order.returnedAt ? fmtDate(order.returnedAt) : "—"}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
