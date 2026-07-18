import {
  LayoutDashboard,
  ClipboardList,
  FileText,
  Truck,
  CalendarRange,
  Boxes,
  Tags,
  ListTree,
  BadgeDollarSign,
  Users,
  MapPin,
  CreditCard,
  Wallet,
  ReceiptText,
  AlarmClock,
  Timer,
  SlidersHorizontal,
  UserCog,
  Settings,
  LifeBuoy,
  BookOpen,
} from "lucide-react";

import type { NavGroup, NavItem } from "@/types";

/**
 * Primary sidebar navigation, grouped by domain area.
 *
 * Routes are declared here up-front so the shell reflects the full product
 * surface; the corresponding pages are implemented in later milestones.
 */
export const primaryNav: NavGroup[] = [
  {
    title: "Overview",
    items: [{ title: "Dashboard", href: "/", icon: LayoutDashboard }],
  },
  {
    title: "Operations",
    items: [
      { title: "Rentals", href: "/rentals", icon: ClipboardList },
      { title: "Quotations", href: "/quotations", icon: FileText },
      { title: "Pickups & Returns", href: "/logistics", icon: Truck },
      { title: "Schedule", href: "/schedule", icon: CalendarRange },
    ],
  },
  {
    title: "Catalog",
    items: [
      { title: "Products", href: "/products", icon: Boxes },
      { title: "Categories", href: "/categories", icon: ListTree },
      { title: "Attributes", href: "/attributes", icon: Tags },
      { title: "Pricelists", href: "/pricelists", icon: BadgeDollarSign },
    ],
  },
  {
    title: "Customers",
    items: [
      { title: "Customers", href: "/customers", icon: Users },
      { title: "Addresses", href: "/addresses", icon: MapPin },
    ],
  },
  {
    title: "Finance",
    items: [
      { title: "Payments", href: "/payments", icon: CreditCard },
      { title: "Deposits", href: "/deposits", icon: Wallet },
      { title: "Invoices", href: "/invoices", icon: ReceiptText },
      { title: "Late Fees", href: "/late-fees", icon: AlarmClock },
    ],
  },
];

/**
 * Secondary nav shown lower in the sidebar (config + help).
 */
export const secondaryNav: NavItem[] = [
  { title: "Rental Periods", href: "/settings/periods", icon: Timer },
  { title: "Late Fee Rules", href: "/settings/late-fee-rules", icon: SlidersHorizontal },
  { title: "Team", href: "/settings/team", icon: UserCog },
  { title: "Settings", href: "/settings", icon: Settings },
];

/**
 * Utility links pinned at the very bottom of the sidebar.
 */
export const utilityNav: NavItem[] = [
  { title: "Documentation", href: "/docs", icon: BookOpen },
  { title: "Support", href: "/support", icon: LifeBuoy },
];
