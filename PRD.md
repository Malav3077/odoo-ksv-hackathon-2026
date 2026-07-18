# PRD — Rental Management System

Odoo x KSV Hackathon 2026 · Team: Malav, Shailesh, Dhruvi, Shivangi

---

## 1. ONE-LINE PROBLEM

An Odoo-style Rental Management System where a customer can rent products
(furniture, electronics) online with a security deposit, pick up and return
them, and where Admin/Vendor manage products, pricing, orders, invoices, and
automatic late-fee and deposit settlement from a single real-time dashboard.

## 2. CORE VALUE (the differentiator we pitch to jury)

The whole rental lifecycle (quotation to order to pickup to return to deposit
settlement) is tracked automatically in one dashboard. On return, late fees and
deposit refunds are calculated by the system, not by hand.

## 3. ROLES

```
Admin     Full control: products, pricelists, attributes, settings (late-fee
          rules, rental periods), quotation templates, publish/unpublish
          products, org-wide reports, user management.

Vendor    Manages own products, creates in-store quotations and orders,
          processes pickup and return, sees own orders and reports.
          Cannot publish products (only Admin can).

Customer  Storefront user. Browse, rent for a period, cart, checkout (address
          + payment + deposit), download invoice, manage own profile, address
          and orders. Sees nothing of the backend.
```

## 4. MUST HAVE (complete in 24 hours)

```
1  Auth: Login, Customer Signup, Vendor Signup, Reset Password (JWT)
2  Catalog: Product + Category + Attributes (Brand/Color/Size) + Variants
3  Rental config per product: periodicity, pickup/return time, deposit, late fee
4  Pricelist: default + custom rules (discount / fixed, time-bound)
5  Storefront: browse -> product detail -> cart -> checkout -> payment (mock)
6  Rental Order state machine: quotation -> sent -> reserved -> picked_up /
   late_pickup -> returned / late_return -> (cancelled)
7  Security Deposit + Late Fee auto calculation on return
8  Invoice generation + PDF download
9  Admin dashboard: Active, Due Today, Upcoming Pickups/Returns, Overdue,
   Revenue, Deposits Held, Late Fee Collected
10 Pickup and Return confirmation with inspection
```

## 5. NICE TO HAVE (only if time remains)

```
Rental calendar / scheduler view
Reports export (CSV / PDF), admin vs vendor scope
Barcode / QR scan on pickup and return
Coupon code at checkout
Mock customer reminder notifications
```

## 6. OUT OF SCOPE (do not build, saves time)

```
Real payment gateway    -> mock "Pay Now" button, no real charge
Real email / SMS        -> log to console, no external service
IoT / predictive maint. -> bonus idea only, skip
Multi-language / multi-currency -> single currency
Route optimization      -> show schedule list only, no maps
```

## 7. BUSINESS FLOW

Online (Customer):
```
Browse (filter category/brand/price/color/duration)
 -> select product + rental period -> add to cart
 -> checkout: delivery address OR store pickup
 -> pay rental amount + security deposit (mock)
 -> order status Reserved, invoice auto-generated, PDF download
 -> return date: Admin/Vendor inspects product
 -> on time  : Returned, full deposit refunded
 -> late     : Late Return, late fee = rate x hours_late, deducted from
               deposit as an itemized line, remaining refunded
```

Offline (Admin/Vendor in-store):
```
Create quotation (use Quotation Template for speed)
 -> send quotation (status Quotation Sent)
 -> client confirms -> Confirm (status Reserved) -> create invoice
 -> collect payment + deposit -> pickup (Picked Up / Late pickup)
 -> return -> inspect -> Returned / Late Return -> deposit settled
```

## 8. TIME ESTIMATE

```
Auth (both sides)                          2.0 hrs
Catalog + attributes + variants            2.5 hrs
Pricelist + rules                          1.5 hrs
Storefront (browse/detail/cart/checkout)   3.0 hrs
Rental order + state machine               3.0 hrs
Invoice + PDF                              1.5 hrs
Deposit + late fee (settle_return)         2.0 hrs
Dashboard stats                            1.5 hrs
Pickup / return                            1.5 hrs
Quotation template + settings              1.5 hrs
Polish + testing + seed + README           3.5 hrs
TOTAL                                     ~23.5 hrs
```

## 9. TEAM DIVISION (feature ownership)

```
Malav (backend lead)
  accounts, catalog, rentals models + services (state machine, settle_return),
  billing, reports/dashboard endpoints, JWT auth, project settings, seed data

Shailesh (backend)
  auth endpoints (register/login/reset), attribute + quotation-template
  endpoints, pickup/return endpoints (call settle_return), admin registrations

Dhruvi (frontend, Next.js)
  auth pages (login/signup/vendor-signup/reset) + customer storefront
  (home, product detail, cart, checkout, order success, my orders, profile)

Shivangi (frontend, Next.js)
  backend dashboard (KPI tiles + order table + kanban), order detail,
  product management screens, pickup/return screens, invoice view
```

See `API_CONTRACT.md` for exactly which endpoint each screen calls.
