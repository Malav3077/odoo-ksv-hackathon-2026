import Link from "next/link";
import { Plus, Info } from "lucide-react";

import { PageHeader } from "@/components/common/page-header";
import { Button } from "@/components/ui/button";
import { getQuotations } from "@/lib/orders";
import { QuotationsTable } from "@/components/quotations/quotations-table";

// Always fetch fresh — quotations change as orders move through their lifecycle.
export const dynamic = "force-dynamic";

export default async function QuotationsPage() {
  const { rows, source } = await getQuotations();

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Quotations"
        description="Draft and sent rental quotations — track them through to confirmation."
        actions={
          <Button size="sm" nativeButton={false} render={<Link href="/quotations/new" />}>
            <Plus className="size-4" />
            New Quotation
          </Button>
        }
      />

      {source === "mock" && (
        <div className="flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-700 dark:text-amber-400">
          <Info className="mt-0.5 size-4 shrink-0" />
          <span>
            Showing demo data — the live API isn&apos;t reachable. Start the backend on{" "}
            <code className="font-mono text-xs">:8000</code> to see real quotations.
          </span>
        </div>
      )}

      <QuotationsTable rows={rows} />
    </div>
  );
}
