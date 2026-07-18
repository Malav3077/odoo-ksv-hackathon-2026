"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Plus,
  Search,
  Trash2,
  Send,
  Save,
  User,
  CalendarRange,
  Truck,
  Store,
  FileText,
  CheckCircle2,
  PackagePlus,
} from "lucide-react";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/common/page-header";
import { cn } from "@/lib/utils";
import { inr, products, daysBetween } from "@/lib/rentals-data";

const GST_RATE = 0.18;

/** A labelled field wrapper. */
function Field({ label, children, className }) {
  return (
    <label className={cn("flex flex-col gap-1.5", className)}>
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}

export default function NewQuotationPage() {
  const [customer, setCustomer] = React.useState({ name: "", email: "", phone: "", company: "" });
  const [pickup, setPickup] = React.useState("");
  const [expectedReturn, setExpectedReturn] = React.useState("");
  const [delivery, setDelivery] = React.useState("Delivery");
  const [notes, setNotes] = React.useState("");
  const [items, setItems] = React.useState([]);
  const [query, setQuery] = React.useState("");
  const [submitted, setSubmitted] = React.useState(false);

  // Default rental length from the chosen period (min 1 day).
  const periodDays = React.useMemo(() => {
    if (!pickup || !expectedReturn) return 1;
    const d = daysBetween(pickup, expectedReturn);
    return d > 0 ? d : 1;
  }, [pickup, expectedReturn]);

  function addProduct(p) {
    setItems((prev) => {
      const existing = prev.find((it) => it.id === p.id);
      if (existing) {
        return prev.map((it) => (it.id === p.id ? { ...it, qty: it.qty + 1 } : it));
      }
      return [
        ...prev,
        { id: p.id, name: p.name, rate: p.ratePerDay, depositPer: p.deposit, qty: 1, days: periodDays },
      ];
    });
  }
  function updateItem(id, field, value) {
    const n = Math.max(field === "days" ? 1 : 0, Number(value) || 0);
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, [field]: n } : it)));
  }
  function removeItem(id) {
    setItems((prev) => prev.filter((it) => it.id !== id));
  }

  const subtotal = items.reduce((s, it) => s + it.qty * it.rate * it.days, 0);
  const depositTotal = items.reduce((s, it) => s + it.qty * it.depositPer, 0);
  const tax = Math.round(subtotal * GST_RATE);
  const total = subtotal + tax;

  const filteredProducts = products.filter((p) => {
    const q = query.trim().toLowerCase();
    return !q || p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q) || p.id.toLowerCase().includes(q);
  });

  const canSubmit = customer.name.trim() && items.length > 0 && pickup && expectedReturn;

  if (submitted) {
    return (
      <div className="mx-auto flex max-w-lg flex-col items-center gap-4 py-16 text-center">
        <span className="flex size-16 items-center justify-center rounded-2xl bg-emerald-500/10">
          <CheckCircle2 className="size-8 text-emerald-600 dark:text-emerald-400" />
        </span>
        <h1 className="text-2xl font-semibold tracking-tight">Quotation Created</h1>
        <p className="text-sm text-muted-foreground">
          Quotation <span className="font-medium text-foreground">QT-2050</span> for{" "}
          <span className="font-medium text-foreground">{customer.name}</span> has been created
          {delivery === "Delivery" ? " for delivery" : " for store pickup"} — total {inr.format(total)}.
        </p>
        <div className="mt-2 flex gap-2">
          <Button variant="outline" nativeButton={false} render={<Link href="/quotations" />}>
            View quotations
          </Button>
          <Button onClick={() => setSubmitted(false)}>
            <Plus className="size-4" />
            New quotation
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/quotations"
        className="inline-flex w-fit items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Back to quotations
      </Link>

      <PageHeader
        title="New Quotation"
        description="Build a rental quotation — add items, set the period, and send."
        actions={
          <>
            <Button variant="outline" size="sm" nativeButton={false} render={<Link href="/quotations" />}>
              Cancel
            </Button>
            <Button variant="secondary" size="sm" disabled={!items.length} onClick={() => setSubmitted(true)}>
              <Save className="size-4" />
              Save draft
            </Button>
            <Button size="sm" disabled={!canSubmit} onClick={() => setSubmitted(true)}>
              <Send className="size-4" />
              Send quotation
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* ---------------- left: form ---------------- */}
        <div className="flex flex-col gap-4 lg:col-span-2">
          {/* Customer */}
          <Card className="animate-dash-rise" style={{ animationDelay: "40ms" }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="size-4.5" style={{ color: "var(--dash-indigo)" }} />
                Customer
              </CardTitle>
              <CardDescription>Who this quotation is for</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Full name">
                <Input value={customer.name} onChange={(e) => setCustomer({ ...customer, name: e.target.value })} placeholder="e.g. Aarav Mehta" />
              </Field>
              <Field label="Company (optional)">
                <Input value={customer.company} onChange={(e) => setCustomer({ ...customer, company: e.target.value })} placeholder="e.g. Frameworks Studio" />
              </Field>
              <Field label="Email">
                <Input type="email" value={customer.email} onChange={(e) => setCustomer({ ...customer, email: e.target.value })} placeholder="name@email.com" />
              </Field>
              <Field label="Phone">
                <Input value={customer.phone} onChange={(e) => setCustomer({ ...customer, phone: e.target.value })} placeholder="+91 …" />
              </Field>
            </CardContent>
          </Card>

          {/* Rental period */}
          <Card className="animate-dash-rise" style={{ animationDelay: "100ms" }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarRange className="size-4.5" style={{ color: "var(--dash-sky)" }} />
                Rental Period
              </CardTitle>
              <CardDescription>{periodDays} day{periodDays > 1 ? "s" : ""} · applied to new items</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Pickup date">
                  <Input type="date" value={pickup} onChange={(e) => setPickup(e.target.value)} />
                </Field>
                <Field label="Expected return">
                  <Input type="date" value={expectedReturn} onChange={(e) => setExpectedReturn(e.target.value)} />
                </Field>
              </div>
              <Field label="Fulfilment">
                <div className="flex gap-2">
                  {[
                    { key: "Delivery", icon: Truck },
                    { key: "Store Pickup", icon: Store },
                  ].map(({ key, icon: Icon }) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setDelivery(key)}
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors",
                        delivery === key
                          ? "border-transparent bg-primary text-primary-foreground"
                          : "border-border bg-background text-muted-foreground hover:text-foreground",
                      )}
                    >
                      <Icon className="size-4" />
                      {key}
                    </button>
                  ))}
                </div>
              </Field>
            </CardContent>
          </Card>

          {/* Items */}
          <Card className="animate-dash-rise" style={{ animationDelay: "160ms" }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PackagePlus className="size-4.5" style={{ color: "var(--dash-violet)" }} />
                Items
              </CardTitle>
              <CardDescription>Add products and set quantity &amp; days</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              {/* selected items table */}
              {items.length === 0 ? (
                <p className="rounded-lg border border-dashed border-border py-8 text-center text-sm text-muted-foreground">
                  No items yet — pick products below.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border text-left text-xs text-muted-foreground">
                        <th className="py-2 pr-3 font-medium">Product</th>
                        <th className="px-2 py-2 font-medium">Rate/day</th>
                        <th className="px-2 py-2 font-medium">Qty</th>
                        <th className="px-2 py-2 font-medium">Days</th>
                        <th className="px-2 py-2 text-right font-medium">Subtotal</th>
                        <th className="py-2 pl-2" />
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((it) => (
                        <tr key={it.id} className="border-b border-border/60 last:border-0">
                          <td className="py-2 pr-3">
                            <span className="font-medium text-foreground">{it.name}</span>
                            <span className="block text-xs text-muted-foreground">{it.id}</span>
                          </td>
                          <td className="px-2 py-2 tabular-nums text-muted-foreground">{inr.format(it.rate)}</td>
                          <td className="px-2 py-2">
                            <Input
                              type="number"
                              min={1}
                              value={it.qty}
                              onChange={(e) => updateItem(it.id, "qty", e.target.value)}
                              className="h-7 w-16"
                            />
                          </td>
                          <td className="px-2 py-2">
                            <Input
                              type="number"
                              min={1}
                              value={it.days}
                              onChange={(e) => updateItem(it.id, "days", e.target.value)}
                              className="h-7 w-16"
                            />
                          </td>
                          <td className="px-2 py-2 text-right font-medium tabular-nums text-foreground">
                            {inr.format(it.qty * it.rate * it.days)}
                          </td>
                          <td className="py-2 pl-2 text-right">
                            <Button variant="ghost" size="icon-sm" onClick={() => removeItem(it.id)} aria-label="Remove">
                              <Trash2 className="size-4 text-muted-foreground" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* product picker */}
              <div className="rounded-lg border border-border bg-muted/30 p-3">
                <div className="relative mb-3">
                  <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search products to add…"
                    className="pl-8"
                  />
                </div>
                <div className="grid max-h-56 grid-cols-1 gap-2 overflow-y-auto sm:grid-cols-2">
                  {filteredProducts.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => addProduct(p)}
                      className="group flex items-center gap-2.5 rounded-lg border border-border bg-card p-2 text-left transition-colors hover:border-foreground/20 hover:bg-muted/50"
                    >
                      <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-muted text-lg">
                        {p.icon}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium text-foreground">{p.name}</span>
                        <span className="block text-xs text-muted-foreground">
                          {inr.format(p.ratePerDay)}/day · {p.category}
                        </span>
                      </span>
                      <Plus className="size-4 shrink-0 text-muted-foreground transition-colors group-hover:text-foreground" />
                    </button>
                  ))}
                  {filteredProducts.length === 0 && (
                    <p className="col-span-full py-4 text-center text-xs text-muted-foreground">No products match.</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          <Card className="animate-dash-rise" style={{ animationDelay: "220ms" }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="size-4.5" style={{ color: "var(--dash-teal)" }} />
                Notes
              </CardTitle>
              <CardDescription>Internal notes or special terms (optional)</CardDescription>
            </CardHeader>
            <CardContent>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                placeholder="e.g. Fragile items, deliver before 10 AM…"
                className="w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
              />
            </CardContent>
          </Card>
        </div>

        {/* ---------------- right: summary ---------------- */}
        <div className="lg:col-span-1">
          <Card className="animate-dash-rise sticky top-6" style={{ animationDelay: "80ms" }}>
            <CardHeader>
              <CardTitle>Summary</CardTitle>
              <CardDescription>
                {items.length} item{items.length === 1 ? "" : "s"} · {periodDays} day{periodDays > 1 ? "s" : ""}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-2.5 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium tabular-nums text-foreground">{inr.format(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">GST (18%)</span>
                <span className="font-medium tabular-nums text-foreground">{inr.format(tax)}</span>
              </div>
              <div className="my-1 h-px bg-border" />
              <div className="flex justify-between text-base">
                <span className="font-medium text-foreground">Total</span>
                <span className="font-semibold tabular-nums text-foreground">{inr.format(total)}</span>
              </div>
              <div className="mt-1 flex justify-between rounded-lg bg-muted/50 px-3 py-2">
                <span className="text-xs text-muted-foreground">Security deposit</span>
                <span className="text-xs font-medium tabular-nums text-foreground">{inr.format(depositTotal)}</span>
              </div>
            </CardContent>
            <CardFooter className="flex-col gap-2">
              <Button className="w-full" disabled={!canSubmit} onClick={() => setSubmitted(true)}>
                <Send className="size-4" />
                Send quotation
              </Button>
              <Button variant="outline" className="w-full" disabled={!items.length} onClick={() => setSubmitted(true)}>
                <Save className="size-4" />
                Save as draft
              </Button>
              {!canSubmit && (
                <p className="text-center text-xs text-muted-foreground">
                  Add a customer name, items and rental dates to send.
                </p>
              )}
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
