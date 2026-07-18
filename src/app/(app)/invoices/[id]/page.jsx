"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Download, Printer, ReceiptText } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { inr, getInvoice, fmtDate } from "@/lib/rentals-data";

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

function printPage() {
  if (typeof window !== "undefined") window.print();
}

export default function InvoiceDetailPage() {
  const { id } = useParams();
  const invoice = getInvoice(id);

  if (!invoice) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Card className="animate-dash-rise flex flex-col items-center gap-4 p-10 text-center">
          <span className="flex size-12 items-center justify-center rounded-xl bg-muted text-muted-foreground">
            <ReceiptText className="size-6" />
          </span>
          <div className="space-y-1">
            <p className="text-lg font-semibold text-foreground">Invoice not found</p>
            <p className="text-sm text-muted-foreground">
              We couldn&apos;t find an invoice with that reference.
            </p>
          </div>
          <Button variant="outline" size="sm" nativeButton={false} render={<Link href="/invoices" />}>
            <ArrowLeft className="size-4" />
            Back to Invoices
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Top bar — not printed */}
      <div className="flex flex-col gap-4 print:hidden sm:flex-row sm:items-center sm:justify-between">
        <Link
          href="/invoices"
          className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Back to Invoices
        </Link>
        <div className="flex flex-wrap items-center gap-2">
          <Button size="sm" onClick={printPage}>
            <Download className="size-4" />
            Download PDF
          </Button>
          <Button variant="outline" size="sm" onClick={printPage}>
            <Printer className="size-4" />
            Print
          </Button>
        </div>
      </div>

      {/* Printable invoice document */}
      <Card className="animate-dash-rise mx-auto w-full max-w-3xl gap-0 p-8 sm:p-12">
        {/* Header */}
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-center gap-3">
            <span
              className="flex size-11 shrink-0 items-center justify-center rounded-xl"
              style={{
                color: "var(--dash-indigo)",
                background: "color-mix(in oklch, var(--dash-indigo), transparent 88%)",
              }}
            >
              <ReceiptText className="size-6" />
            </span>
            <div>
              <p className="text-lg font-bold tracking-tight text-foreground">RentEase</p>
              <p className="text-sm text-muted-foreground">Rental Management</p>
            </div>
          </div>
          <div className="space-y-1 sm:text-right">
            <p className="text-2xl font-bold tracking-tight text-foreground">INVOICE</p>
            <p className="text-sm font-medium tabular-nums text-muted-foreground">{invoice.id}</p>
            <div className="sm:flex sm:justify-end">
              <Badge variant={statusVariant[invoice.status]}>{statusLabel[invoice.status]}</Badge>
            </div>
          </div>
        </div>

        <div className="my-8 border-t border-border" />

        {/* Billed To + Invoice Details */}
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
          <div className="space-y-1">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Billed To
            </p>
            <p className="font-medium text-foreground">{invoice.customer}</p>
            <p className="text-sm text-muted-foreground">{invoice.email}</p>
            <p className="text-sm text-muted-foreground">{invoice.address}</p>
          </div>
          <div className="space-y-2 sm:text-right">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Invoice Details
            </p>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between gap-4 sm:justify-end sm:gap-6">
                <span className="text-muted-foreground">Invoice #</span>
                <span className="font-medium tabular-nums text-foreground">{invoice.id}</span>
              </div>
              <div className="flex justify-between gap-4 sm:justify-end sm:gap-6">
                <span className="text-muted-foreground">Order #</span>
                <Link
                  href={`/rentals/${invoice.orderId}`}
                  className="font-medium text-foreground hover:underline"
                >
                  {invoice.orderId}
                </Link>
              </div>
              <div className="flex justify-between gap-4 sm:justify-end sm:gap-6">
                <span className="text-muted-foreground">Issue Date</span>
                <span className="text-foreground">{fmtDate(invoice.issueDate)}</span>
              </div>
              <div className="flex justify-between gap-4 sm:justify-end sm:gap-6">
                <span className="text-muted-foreground">Due Date</span>
                <span className="text-foreground">{fmtDate(invoice.dueDate)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Line items */}
        <div className="mt-8 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                <th className="py-3 pr-4 font-medium">Description</th>
                <th className="px-4 py-3 text-right font-medium">Qty</th>
                <th className="px-4 py-3 text-right font-medium">Rate/day</th>
                <th className="px-4 py-3 text-right font-medium">Days</th>
                <th className="py-3 pl-4 text-right font-medium">Amount</th>
              </tr>
            </thead>
            <tbody>
              {invoice.lineItems.map((li) => (
                <tr key={li.sku} className="border-b border-border/60">
                  <td className="py-3 pr-4">
                    <div className="font-medium text-foreground">{li.product}</div>
                    <div className="text-xs text-muted-foreground">{li.sku}</div>
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">{li.qty}</td>
                  <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">
                    {inr.format(li.rate)}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">{li.days}</td>
                  <td className="py-3 pl-4 text-right tabular-nums text-foreground">
                    {inr.format(li.subtotal)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="mt-6 flex justify-end">
          <div className="w-full max-w-xs space-y-2 text-sm">
            <div className="flex justify-between gap-6">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="tabular-nums text-foreground">{inr.format(invoice.subtotal)}</span>
            </div>
            <div className="flex justify-between gap-6">
              <span className="text-muted-foreground">GST 18%</span>
              <span className="tabular-nums text-foreground">{inr.format(invoice.tax)}</span>
            </div>
            {invoice.lateFee > 0 && (
              <div className="flex justify-between gap-6" style={{ color: "var(--dash-rose)" }}>
                <span>Late Fee</span>
                <span className="tabular-nums">{inr.format(invoice.lateFee)}</span>
              </div>
            )}
            <div className="flex justify-between gap-6 border-t border-border pt-2">
              <span className="font-semibold text-foreground">Total</span>
              <span className="font-semibold tabular-nums text-foreground">
                {inr.format(invoice.total)}
              </span>
            </div>
            <p className="pt-1 text-xs text-muted-foreground">
              Security Deposit (refundable): {inr.format(invoice.deposit)}
            </p>
          </div>
        </div>

        <div className="my-8 border-t border-border" />

        {/* Footer note */}
        <p className="text-xs text-muted-foreground">
          Thank you for your business. Deposit is refundable on undamaged return.
        </p>
      </Card>
    </div>
  );
}
