/**
 * Mock domain data for the rental back-office screens (rentals, order detail,
 * products, logistics, invoices). Shapes mirror the eventual REST responses so
 * screens can swap constants for `GET /api/rentals/orders/`, `/products/`,
 * `/invoices/` without touching the components.
 *
 * All dates are ISO strings and all money is whole INR — deterministic, no
 * `Date.now()` / random, so server and client render identically.
 */
import { inr, orderStates } from "./dashboard-data";

export { inr, orderStates };

/** "today" for the mock dataset. Swap for real now once wired to the API. */
export const TODAY = "2026-07-18";

/** Lifecycle order used by the detail-page stepper. */
export const lifecycle = ["quotation", "reserved", "picked_up", "returned"];

/** Badge variant per order state (maps to <Badge variant>). */
export const stateTone = {
  quotation: "outline",
  reserved: "secondary",
  picked_up: "default",
  in_rent: "default",
  returned: "secondary",
  overdue: "destructive",
  cancelled: "ghost",
};

export const stateLabel = {
  quotation: "Quotation",
  reserved: "Reserved",
  picked_up: "Picked Up",
  in_rent: "In Rent",
  returned: "Returned",
  overdue: "Overdue",
  cancelled: "Cancelled",
};

/** "2026-07-16" -> "16 Jul 2026". */
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
export function fmtDate(iso) {
  if (!iso) return "—";
  const [y, m, d] = iso.split("-").map(Number);
  return `${d} ${MONTHS[m - 1]} ${y}`;
}
export function fmtShort(iso) {
  if (!iso) return "—";
  const [, m, d] = iso.split("-").map(Number);
  return `${d} ${MONTHS[m - 1]}`;
}
/** Whole-day difference b − a from ISO strings. Deterministic. */
export function daysBetween(aIso, bIso) {
  const [ay, am, ad] = aIso.split("-").map(Number);
  const [by, bm, bd] = bIso.split("-").map(Number);
  return Math.round((Date.UTC(by, bm - 1, bd) - Date.UTC(ay, am - 1, ad)) / 86_400_000);
}

/**
 * Rental orders with full detail (line items, customer, timeline, financials).
 * `state` drives status badges; `timeline` entries are the events that have
 * happened so far.
 */
export const rentalOrders = [
  {
    id: "RO-1042",
    customer: "Aarav Mehta",
    email: "aarav.mehta@gmail.com",
    phone: "+91 98250 11223",
    company: "Frameworks Studio",
    state: "overdue",
    createdAt: "2026-07-08",
    pickup: "2026-07-10",
    expectedReturn: "2026-07-16",
    returnedAt: null,
    address: "12 Satellite Road, Ahmedabad, Gujarat 380015",
    deliveryMethod: "Delivery",
    notes: "Customer requested extra battery grip. Follow up on overdue return.",
    lineItems: [
      { product: "Sony A7 IV Camera Body", sku: "CAM-A7IV", qty: 1, rate: 1200, days: 6, subtotal: 7200 },
      { product: "24-70mm f/2.8 Lens", sku: "LEN-2470", qty: 1, rate: 200, days: 6, subtotal: 1200 },
    ],
    amount: 8400,
    deposit: 15000,
    lateFee: 1400,
  },
  {
    id: "RO-1041",
    customer: "Priya Nair",
    email: "priya.nair@outlook.com",
    phone: "+91 99045 88710",
    company: "—",
    state: "in_rent",
    createdAt: "2026-07-12",
    pickup: "2026-07-14",
    expectedReturn: "2026-07-21",
    returnedAt: null,
    address: "44 Koregaon Park, Pune, Maharashtra 411001",
    deliveryMethod: "Store Pickup",
    notes: "",
    lineItems: [
      { product: "Ergonomic Office Chair", sku: "FUR-CHAIR", qty: 4, rate: 800, days: 7, subtotal: 3200 },
    ],
    amount: 3200,
    deposit: 4000,
    lateFee: 0,
  },
  {
    id: "RO-1040",
    customer: "Rohan Desai",
    email: "rohan.desai@gmail.com",
    phone: "+91 98191 44502",
    company: "Desai Events",
    state: "picked_up",
    createdAt: "2026-07-16",
    pickup: "2026-07-18",
    expectedReturn: "2026-07-20",
    returnedAt: null,
    address: "7 Marine Drive, Mumbai, Maharashtra 400020",
    deliveryMethod: "Delivery",
    notes: "Handle with care — gimbal calibration done at pickup.",
    lineItems: [
      { product: "DJI Ronin Gimbal", sku: "GIM-RONIN", qty: 1, rate: 1300, days: 2, subtotal: 2600 },
    ],
    amount: 2600,
    deposit: 6000,
    lateFee: 0,
  },
  {
    id: "RO-1039",
    customer: "Sneha Kulkarni",
    email: "sneha.k@gmail.com",
    phone: "+91 97640 20388",
    company: "Bright Media",
    state: "reserved",
    createdAt: "2026-07-15",
    pickup: "2026-07-19",
    expectedReturn: "2026-07-22",
    returnedAt: null,
    address: "90 MG Road, Bengaluru, Karnataka 560001",
    deliveryMethod: "Delivery",
    notes: "",
    lineItems: [
      { product: "Full HD Projector", sku: "PRJ-FHD", qty: 1, rate: 900, days: 3, subtotal: 2700 },
      { product: "120\" Projection Screen", sku: "SCR-120", qty: 1, rate: 466, days: 3, subtotal: 1400 },
    ],
    amount: 4100,
    deposit: 5000,
    lateFee: 0,
  },
  {
    id: "RO-1038",
    customer: "Vikram Shah",
    email: "vikram.shah@yahoo.com",
    phone: "+91 98212 77341",
    company: "—",
    state: "returned",
    createdAt: "2026-07-06",
    pickup: "2026-07-08",
    expectedReturn: "2026-07-12",
    returnedAt: "2026-07-12",
    address: "3 Law Garden, Ahmedabad, Gujarat 380006",
    deliveryMethod: "Store Pickup",
    notes: "Returned on time, no damage. Deposit fully refunded.",
    lineItems: [
      { product: "Party Sound System (2 speakers + mixer)", sku: "AUD-PARTY", qty: 1, rate: 1475, days: 4, subtotal: 5900 },
    ],
    amount: 5900,
    deposit: 8000,
    lateFee: 0,
  },
  {
    id: "RO-1037",
    customer: "Ananya Iyer",
    email: "ananya.iyer@gmail.com",
    phone: "+91 99872 63400",
    company: "Iyer Consulting",
    state: "quotation",
    createdAt: "2026-07-17",
    pickup: "2026-07-21",
    expectedReturn: "2026-07-28",
    returnedAt: null,
    address: "21 Anna Salai, Chennai, Tamil Nadu 600002",
    deliveryMethod: "Delivery",
    notes: "Awaiting customer confirmation on quotation.",
    lineItems: [
      { product: "MacBook Pro 16\" M3", sku: "LAP-MBP16", qty: 1, rate: 1028, days: 7, subtotal: 7200 },
    ],
    amount: 7200,
    deposit: 20000,
    lateFee: 0,
  },
  {
    id: "RO-1036",
    customer: "Karan Malhotra",
    email: "karan.m@gmail.com",
    phone: "+91 98118 90021",
    company: "Malhotra Caterers",
    state: "in_rent",
    createdAt: "2026-07-13",
    pickup: "2026-07-15",
    expectedReturn: "2026-07-19",
    returnedAt: null,
    address: "56 Connaught Place, New Delhi 110001",
    deliveryMethod: "Delivery",
    notes: "Bulk order for wedding event.",
    lineItems: [
      { product: "Folding Banquet Table", sku: "FUR-TABLE", qty: 10, rate: 450, days: 4, subtotal: 4500 },
    ],
    amount: 4500,
    deposit: 3000,
    lateFee: 0,
  },
  {
    id: "RO-1035",
    customer: "Meera Joshi",
    email: "meera.joshi@gmail.com",
    phone: "+91 97030 55128",
    company: "—",
    state: "returned",
    createdAt: "2026-07-01",
    pickup: "2026-07-03",
    expectedReturn: "2026-07-07",
    returnedAt: "2026-07-08",
    address: "8 FC Road, Pune, Maharashtra 411004",
    deliveryMethod: "Store Pickup",
    notes: "Returned 1 day late — late fee deducted from deposit.",
    lineItems: [
      { product: "Canon EOS R6 Kit", sku: "CAM-R6", qty: 1, rate: 1100, days: 4, subtotal: 4400 },
    ],
    amount: 4400,
    deposit: 12000,
    lateFee: 1100,
  },
  {
    id: "RO-1034",
    customer: "Dev Patel",
    email: "dev.patel@gmail.com",
    phone: "+91 98795 32107",
    company: "Patel Interiors",
    state: "reserved",
    createdAt: "2026-07-16",
    pickup: "2026-07-20",
    expectedReturn: "2026-07-27",
    returnedAt: null,
    address: "15 CG Road, Ahmedabad, Gujarat 380009",
    deliveryMethod: "Delivery",
    notes: "",
    lineItems: [
      { product: "Designer Sofa Set (3+2)", sku: "FUR-SOFA", qty: 1, rate: 700, days: 7, subtotal: 4900 },
    ],
    amount: 4900,
    deposit: 10000,
    lateFee: 0,
  },
  {
    id: "RO-1033",
    customer: "Isha Reddy",
    email: "isha.reddy@gmail.com",
    phone: "+91 99512 60934",
    company: "Reddy Studios",
    state: "cancelled",
    createdAt: "2026-07-10",
    pickup: "2026-07-13",
    expectedReturn: "2026-07-16",
    returnedAt: null,
    address: "34 Jubilee Hills, Hyderabad, Telangana 500033",
    deliveryMethod: "Delivery",
    notes: "Cancelled by customer before pickup.",
    lineItems: [
      { product: "LED Studio Light Kit", sku: "LGT-STUDIO", qty: 2, rate: 600, days: 3, subtotal: 3600 },
    ],
    amount: 3600,
    deposit: 4000,
    lateFee: 0,
  },
  {
    id: "RO-1032",
    customer: "Aditya Rao",
    email: "aditya.rao@gmail.com",
    phone: "+91 98450 71620",
    company: "—",
    state: "picked_up",
    createdAt: "2026-07-15",
    pickup: "2026-07-17",
    expectedReturn: "2026-07-24",
    returnedAt: null,
    address: "12 Indiranagar, Bengaluru, Karnataka 560038",
    deliveryMethod: "Store Pickup",
    notes: "",
    lineItems: [
      { product: "Mountain Bike (Trek)", sku: "BIK-TREK", qty: 2, rate: 350, days: 7, subtotal: 4900 },
    ],
    amount: 4900,
    deposit: 6000,
    lateFee: 0,
  },
  {
    id: "RO-1031",
    customer: "Nisha Verma",
    email: "nisha.verma@gmail.com",
    phone: "+91 97110 42856",
    company: "Verma Weddings",
    state: "returned",
    createdAt: "2026-06-28",
    pickup: "2026-06-30",
    expectedReturn: "2026-07-05",
    returnedAt: "2026-07-05",
    address: "78 Banjara Hills, Hyderabad, Telangana 500034",
    deliveryMethod: "Delivery",
    notes: "Repeat customer. Smooth return.",
    lineItems: [
      { product: "Decorative Mandap Set", sku: "DEC-MANDAP", qty: 1, rate: 1600, days: 5, subtotal: 8000 },
    ],
    amount: 8000,
    deposit: 15000,
    lateFee: 0,
  },
];

export function getRentalOrder(id) {
  return rentalOrders.find((o) => o.id === id) ?? null;
}

/** Total of an order (rental + late fee). Deposit is refundable, tracked separately. */
export function orderTotal(o) {
  return o.amount + (o.lateFee || 0);
}

/**
 * Build a lifecycle timeline for the detail page: which steps are done vs
 * pending, given the order state. `overdue` is treated as a picked-up order
 * whose return is late.
 */
export function orderTimeline(o) {
  const reached = {
    quotation: ["quotation", "reserved", "picked_up", "in_rent", "overdue", "returned"],
    reserved: ["reserved", "picked_up", "in_rent", "overdue", "returned"],
    picked_up: ["picked_up", "in_rent", "overdue", "returned"],
    returned: ["returned"],
  };
  const steps = [
    { key: "quotation", label: "Quotation Created", date: o.createdAt },
    { key: "reserved", label: "Reserved / Confirmed", date: o.createdAt },
    { key: "picked_up", label: "Picked Up", date: o.pickup },
    { key: "returned", label: o.lateFee > 0 ? "Returned (Late)" : "Returned", date: o.returnedAt || o.expectedReturn },
  ];
  return steps.map((s) => ({
    ...s,
    done: reached[s.key]?.includes(o.state) ?? false,
    current:
      (o.state === "quotation" && s.key === "quotation") ||
      (o.state === "reserved" && s.key === "reserved") ||
      ((o.state === "picked_up" || o.state === "in_rent" || o.state === "overdue") && s.key === "picked_up") ||
      (o.state === "returned" && s.key === "returned"),
  }));
}

/* ------------------------------------------------------------------ */
/* Products (catalog + availability)                                   */
/* ------------------------------------------------------------------ */

export const productCategories = ["Cameras", "Furniture", "Audio", "Electronics", "Events", "Sports"];

export const products = [
  { id: "CAM-A7IV", name: "Sony A7 IV Camera Body", category: "Cameras", brand: "Sony", ratePerDay: 1200, deposit: 15000, totalUnits: 5, onRent: 3, status: "published", icon: "📷" },
  { id: "LEN-2470", name: "24-70mm f/2.8 GM Lens", category: "Cameras", brand: "Sony", ratePerDay: 200, deposit: 8000, totalUnits: 6, onRent: 2, status: "published", icon: "🔭" },
  { id: "GIM-RONIN", name: "DJI Ronin Gimbal", category: "Cameras", brand: "DJI", ratePerDay: 1300, deposit: 6000, totalUnits: 3, onRent: 1, status: "published", icon: "🎥" },
  { id: "FUR-CHAIR", name: "Ergonomic Office Chair", category: "Furniture", brand: "Herman", ratePerDay: 800, deposit: 1000, totalUnits: 40, onRent: 12, status: "published", icon: "🪑" },
  { id: "FUR-TABLE", name: "Folding Banquet Table", category: "Furniture", brand: "Generic", ratePerDay: 450, deposit: 300, totalUnits: 60, onRent: 34, status: "published", icon: "🪧" },
  { id: "FUR-SOFA", name: "Designer Sofa Set (3+2)", category: "Furniture", brand: "Urban", ratePerDay: 700, deposit: 10000, totalUnits: 4, onRent: 1, status: "published", icon: "🛋️" },
  { id: "AUD-PARTY", name: "Party Sound System", category: "Audio", brand: "JBL", ratePerDay: 1475, deposit: 8000, totalUnits: 6, onRent: 4, status: "published", icon: "🔊" },
  { id: "PRJ-FHD", name: "Full HD Projector", category: "Electronics", brand: "Epson", ratePerDay: 900, deposit: 5000, totalUnits: 8, onRent: 5, status: "published", icon: "📽️" },
  { id: "LAP-MBP16", name: "MacBook Pro 16\" M3", category: "Electronics", brand: "Apple", ratePerDay: 1028, deposit: 20000, totalUnits: 4, onRent: 4, status: "published", icon: "💻" },
  { id: "LGT-STUDIO", name: "LED Studio Light Kit", category: "Events", brand: "Godox", ratePerDay: 600, deposit: 4000, totalUnits: 10, onRent: 2, status: "published", icon: "💡" },
  { id: "DEC-MANDAP", name: "Decorative Mandap Set", category: "Events", brand: "Custom", ratePerDay: 1600, deposit: 15000, totalUnits: 2, onRent: 0, status: "draft", icon: "🎪" },
  { id: "BIK-TREK", name: "Mountain Bike (Trek)", category: "Sports", brand: "Trek", ratePerDay: 350, deposit: 6000, totalUnits: 12, onRent: 5, status: "published", icon: "🚲" },
];

export function productAvailable(p) {
  return Math.max(0, p.totalUnits - p.onRent);
}
export function getProduct(id) {
  return products.find((p) => p.id === id) ?? null;
}

/* ------------------------------------------------------------------ */
/* Invoices (derived from confirmed+ orders)                           */
/* ------------------------------------------------------------------ */

const GST_RATE = 0.18;

/** Invoices are generated for orders that are reserved or beyond. */
export const invoices = rentalOrders
  .filter((o) => o.state !== "quotation" && o.state !== "cancelled")
  .map((o, i) => {
    const tax = Math.round(o.amount * GST_RATE);
    const total = o.amount + tax + (o.lateFee || 0);
    let status = "unpaid";
    if (o.state === "returned") status = "paid";
    else if (o.state === "overdue") status = "overdue";
    else if (["picked_up", "in_rent"].includes(o.state)) status = "paid";
    else status = "partial";
    return {
      id: `INV-${2001 + i}`,
      orderId: o.id,
      customer: o.customer,
      email: o.email,
      address: o.address,
      issueDate: o.createdAt,
      dueDate: o.pickup,
      lineItems: o.lineItems,
      subtotal: o.amount,
      tax,
      lateFee: o.lateFee || 0,
      deposit: o.deposit,
      total,
      status,
    };
  });

export function getInvoice(id) {
  return invoices.find((v) => v.id === id) ?? null;
}
export function getInvoiceByOrder(orderId) {
  return invoices.find((v) => v.orderId === orderId) ?? null;
}
