/**
 * Mock dashboard data for the operations dashboard.
 *
 * Shapes mirror the eventual `GET /api/reports/dashboard/` and
 * `GET /api/rentals/orders/` responses so screens can swap the constants
 * for real fetches without changing the components. See API_CONTRACT.md
 * (pending) for the authoritative contract.
 *
 * Currency is INR; dates are ISO strings so rendering is deterministic and
 * safe against server/client hydration mismatches.
 */

/** Indian Rupee formatter, no decimals (rental amounts are whole rupees). */
export const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

/** KPI tiles — matches PRD §4.9 (Admin dashboard cards). `color` is a --dash-* accent. */
export const kpis = [
  { key: "active", label: "Active Rentals", value: 42, unit: "count", delta: 8, trend: "up", color: "indigo", hint: "currently on rent", spark: [30, 34, 32, 37, 39, 40, 42] },
  { key: "due_today", label: "Due Today", value: 7, unit: "count", delta: 2, trend: "up", color: "sky", hint: "returns expected today", spark: [4, 5, 4, 6, 5, 6, 7] },
  { key: "upcoming_pickups", label: "Upcoming Pickups", value: 11, unit: "count", delta: -3, trend: "down", color: "violet", hint: "next 7 days", spark: [16, 15, 15, 13, 12, 12, 11] },
  { key: "upcoming_returns", label: "Upcoming Returns", value: 19, unit: "count", delta: 5, trend: "up", color: "teal", hint: "next 7 days", spark: [12, 14, 13, 16, 17, 18, 19] },
  { key: "overdue", label: "Overdue Rentals", value: 4, unit: "count", delta: 1, trend: "up", color: "rose", tone: "danger", hint: "past return date", spark: [1, 2, 2, 3, 3, 4, 4] },
  { key: "revenue", label: "Rental Revenue", value: 486500, unit: "currency", delta: 12.4, trend: "up", color: "emerald", hint: "this month", spark: [312000, 358000, 331000, 402000, 433000, 486500] },
  { key: "deposits_held", label: "Deposits Held", value: 218000, unit: "currency", delta: 4.1, trend: "up", color: "amber", hint: "refundable", spark: [180000, 195000, 190000, 205000, 210000, 214000, 218000] },
  { key: "late_fees", label: "Late Fee Collected", value: 15750, unit: "currency", delta: 9, trend: "up", color: "rose", hint: "this month", spark: [6000, 9000, 8000, 11000, 13000, 14000, 15750] },
];

/** Monthly rental revenue — feeds the area chart. */
export const revenueSeries = [
  { month: "Feb", revenue: 312000 },
  { month: "Mar", revenue: 358000 },
  { month: "Apr", revenue: 331000 },
  { month: "May", revenue: 402000 },
  { month: "Jun", revenue: 433000 },
  { month: "Jul", revenue: 486500 },
];

/** Rentals started per weekday (this week) — feeds the bar chart. */
export const weeklyRentals = [
  { day: "Mon", count: 8 },
  { day: "Tue", count: 12 },
  { day: "Wed", count: 6 },
  { day: "Thu", count: 15 },
  { day: "Fri", count: 18 },
  { day: "Sat", count: 22 },
  { day: "Sun", count: 9 },
];

/** Order status split — feeds the donut chart. `color` is a --dash-* accent. */
export const statusDistribution = [
  { label: "In Rent", value: 42, color: "indigo" },
  { label: "Reserved", value: 18, color: "sky" },
  { label: "Returned", value: 27, color: "emerald" },
  { label: "Overdue", value: 4, color: "rose" },
  { label: "Quotation", value: 13, color: "amber" },
];

/** Order state machine — label + badge tone per state. */
export const orderStates = {
  quotation: { label: "Quotation", tone: "outline" },
  reserved: { label: "Reserved", tone: "secondary" },
  picked_up: { label: "Picked Up", tone: "default" },
  in_rent: { label: "In Rent", tone: "default" },
  returned: { label: "Returned", tone: "secondary" },
  overdue: { label: "Overdue", tone: "destructive" },
  cancelled: { label: "Cancelled", tone: "ghost" },
};

/** Recent rental orders — mirrors GET /api/rentals/orders/ list rows. */
export const recentOrders = [
  { id: "RO-1042", customer: "Aarav Mehta", product: "Sony A7 IV Camera Kit", state: "overdue", amount: 8400, deposit: 15000, pickup: "2026-07-10", expectedReturn: "2026-07-16" },
  { id: "RO-1041", customer: "Priya Nair", product: "Ergonomic Office Chair ×4", state: "in_rent", amount: 3200, deposit: 4000, pickup: "2026-07-14", expectedReturn: "2026-07-21" },
  { id: "RO-1040", customer: "Rohan Desai", product: "DJI Ronin Gimbal", state: "picked_up", amount: 2600, deposit: 6000, pickup: "2026-07-18", expectedReturn: "2026-07-20" },
  { id: "RO-1039", customer: "Sneha Kulkarni", product: "Projector + Screen Combo", state: "reserved", amount: 4100, deposit: 5000, pickup: "2026-07-19", expectedReturn: "2026-07-22" },
  { id: "RO-1038", customer: "Vikram Shah", product: "Party Sound System", state: "returned", amount: 5900, deposit: 8000, pickup: "2026-07-08", expectedReturn: "2026-07-12" },
  { id: "RO-1037", customer: "Ananya Iyer", product: "MacBook Pro 16\"", state: "quotation", amount: 7200, deposit: 20000, pickup: "2026-07-21", expectedReturn: "2026-07-28" },
  { id: "RO-1036", customer: "Karan Malhotra", product: "Folding Banquet Tables ×10", state: "in_rent", amount: 4500, deposit: 3000, pickup: "2026-07-15", expectedReturn: "2026-07-19" },
];

/** Columns for the kanban view, in lifecycle order. */
export const kanbanColumns = ["quotation", "reserved", "picked_up", "in_rent", "returned"];
