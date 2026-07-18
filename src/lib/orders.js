/**
 * Order/quotation data for the back-office.
 *
 * `getQuotations()` fetches live orders from the API and keeps only those in a
 * quotation state (draft / sent), mapping each to a flat row the table renders.
 * If the API is unreachable (backend down, no service account), it falls back
 * to the mock dataset so the screen still renders — the caller gets `source`
 * so the UI can flag demo data.
 */
import { serverGet } from "./server-data";
import { rentalOrders } from "./rentals-data";

/** Backend statuses that count as a quotation. */
export const QUOTATION_STATUSES = ["quotation", "quotation_sent"];

/** ISO datetime -> "YYYY-MM-DD" (date only), or null. */
function dateOnly(value) {
  return value ? String(value).slice(0, 10) : null;
}

/** Map a backend RentalOrder into a quotation table row. */
function toRow(o) {
  return {
    id: o.id,
    reference: o.order_reference || `RO-${o.id}`,
    customer: o.customer_name || "—",
    status: o.status,
    total: Number(o.total_amount || 0),
    deposit: Number(o.security_deposit_held || 0),
    itemsCount: Array.isArray(o.lines) ? o.lines.length : 0,
    createdAt: dateOnly(o.created_at),
    pickup: dateOnly(o.pickup_date),
  };
}

/** Quotation rows derived from the mock dataset (fallback only). */
function mockRows() {
  return rentalOrders
    .filter((o) => o.state === "quotation")
    .map((o) => ({
      id: o.id,
      reference: o.id,
      customer: o.customer,
      status: "quotation",
      total: o.amount,
      deposit: o.deposit,
      itemsCount: o.lineItems.length,
      createdAt: o.createdAt,
      pickup: o.pickup,
    }));
}

/**
 * @returns {Promise<{rows: object[], source: "live"|"mock", error?: string}>}
 */
export async function getQuotations() {
  try {
    const data = await serverGet("orders/");
    const results = Array.isArray(data) ? data : data.results || [];
    const rows = results
      .filter((o) => QUOTATION_STATUSES.includes(o.status))
      .map(toRow)
      .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
    return { rows, source: "live" };
  } catch (err) {
    return { rows: mockRows(), source: "mock", error: String(err?.message || err) };
  }
}
