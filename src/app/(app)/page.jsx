import Link from "next/link";
import { Plus, Download } from "lucide-react";

import { PageHeader } from "@/components/common/page-header";
import { Button } from "@/components/ui/button";
import { KpiGrid } from "@/components/dashboard/kpi-grid";
import { DateRangeFilter } from "@/components/dashboard/date-range-filter";
import { AttentionPanel } from "@/components/dashboard/attention-panel";
import { RevenueChart } from "@/components/dashboard/revenue-chart";
import { StatusDonut } from "@/components/dashboard/status-donut";
import { WeeklyBars } from "@/components/dashboard/weekly-bars";
import { RecentOrders } from "@/components/dashboard/recent-orders";

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Operations Dashboard"
        description="Live view of rentals, pickups, returns and revenue."
        actions={
          <>
            <span className="mr-1 hidden items-center gap-1.5 text-xs text-muted-foreground sm:flex">
              <span className="size-1.5 rounded-full bg-emerald-500 animate-dash-pulse" />
              Live
            </span>
            <DateRangeFilter defaultValue="30d" />
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

      <KpiGrid />

      {/* Revenue trend + what needs action today */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RevenueChart />
        </div>
        <AttentionPanel />
      </div>

      {/* Status split + recent orders */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <StatusDonut />
        <div className="lg:col-span-2">
          <RecentOrders />
        </div>
      </div>

      {/* Weekly activity */}
      <WeeklyBars />
    </div>
  );
}
