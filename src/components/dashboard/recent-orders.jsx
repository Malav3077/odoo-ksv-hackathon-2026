import Link from "next/link";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { inr, orderStates, recentOrders } from "@/lib/dashboard-data";

/** "2026-07-16" -> "16 Jul". */
function shortDate(iso) {
  const [, month, day] = iso.split("-");
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${day} ${months[Number(month) - 1]}`;
}

export function RecentOrders() {
  return (
    <Card className="animate-dash-rise" style={{ animationDelay: "300ms" }}>
      <CardHeader>
        <CardTitle>Recent Rental Orders</CardTitle>
        <CardDescription>Latest quotations and active rentals</CardDescription>
        <CardAction>
          <Button variant="outline" size="sm" nativeButton={false} render={<Link href="/rentals" />}>
            View all
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className="px-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-y border-border text-left text-xs text-muted-foreground">
                <th className="px-6 py-2.5 font-medium">Order</th>
                <th className="px-3 py-2.5 font-medium">Customer</th>
                <th className="px-3 py-2.5 font-medium">Product</th>
                <th className="px-3 py-2.5 font-medium">Status</th>
                <th className="px-3 py-2.5 font-medium">Return</th>
                <th className="px-6 py-2.5 text-right font-medium">Amount</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order) => {
                const state = orderStates[order.state];
                return (
                  <tr
                    key={order.id}
                    className="border-b border-border/60 last:border-0 transition-colors hover:bg-muted/40"
                  >
                    <td className="px-6 py-3">
                      <Link
                        href={`/rentals/${order.id}`}
                        className="font-medium text-foreground hover:underline"
                      >
                        {order.id}
                      </Link>
                    </td>
                    <td className="px-3 py-3 text-foreground">{order.customer}</td>
                    <td className="max-w-[220px] truncate px-3 py-3 text-muted-foreground">
                      {order.product}
                    </td>
                    <td className="px-3 py-3">
                      <Badge variant={state.tone}>{state.label}</Badge>
                    </td>
                    <td className="px-3 py-3 text-muted-foreground">
                      {shortDate(order.expectedReturn)}
                    </td>
                    <td className="px-6 py-3 text-right font-medium tabular-nums text-foreground">
                      {inr.format(order.amount)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
