import {
  LayoutDashboard, ClipboardList, FileText, Truck, CalendarRange,
  Boxes, Tags, ListTree, BadgeDollarSign, Users, MapPin,
  CreditCard, Wallet, ReceiptText, AlarmClock,
  Timer, SlidersHorizontal, UserCog, Settings, LifeBuoy, BookOpen,
} from 'lucide-react'

export const primaryNav = [
  {
    title: 'Overview',
    items: [{ title: 'Dashboard', href: '/dashboard', icon: LayoutDashboard }],
  },
  {
    title: 'Operations',
    items: [
      { title: 'Rentals', href: '/dashboard/rentals', icon: ClipboardList },
      { title: 'Quotations', href: '/dashboard/quotations', icon: FileText },
      { title: 'Pickups & Returns', href: '/dashboard/logistics', icon: Truck },
      { title: 'Schedule', href: '/dashboard/schedule', icon: CalendarRange },
    ],
  },
  {
    title: 'Catalog',
    items: [
      { title: 'Products', href: '/dashboard/products', icon: Boxes },
      { title: 'Categories', href: '/dashboard/categories', icon: ListTree },
      { title: 'Attributes', href: '/dashboard/attributes', icon: Tags },
      { title: 'Pricelists', href: '/dashboard/pricelists', icon: BadgeDollarSign },
    ],
  },
  {
    title: 'Customers',
    items: [
      { title: 'Customers', href: '/dashboard/customers', icon: Users },
      { title: 'Addresses', href: '/dashboard/addresses', icon: MapPin },
    ],
  },
  {
    title: 'Finance',
    items: [
      { title: 'Payments', href: '/dashboard/payments', icon: CreditCard },
      { title: 'Deposits', href: '/dashboard/deposits', icon: Wallet },
      { title: 'Invoices', href: '/dashboard/invoices', icon: ReceiptText },
      { title: 'Late Fees', href: '/dashboard/late-fees', icon: AlarmClock },
    ],
  },
]

export const secondaryNav = [
  { title: 'Rental Periods', href: '/dashboard/settings/periods', icon: Timer },
  { title: 'Late Fee Rules', href: '/dashboard/settings/late-fee-rules', icon: SlidersHorizontal },
  { title: 'Team', href: '/dashboard/settings/team', icon: UserCog },
  { title: 'Settings', href: '/dashboard/settings', icon: Settings },
]

export const utilityNav = [
  { title: 'Documentation', href: '/docs', icon: BookOpen },
  { title: 'Support', href: '/support', icon: LifeBuoy },
]
