# RentEase — Rental Management System

Odoo x KSV Hackathon 2026 · A full rental lifecycle platform where customers
rent products online with a security deposit, and admins/vendors manage the
whole operation — with **automatic late-fee and deposit settlement** on return.

## Team
- **Malav Parekh** — Team Lead + Backend (Django REST)
- **Shailesh Parmar** — Backend (Django REST)
- **Dhruvi Soliya** — Frontend (Next.js)
- **Shivangi Gohel** — Frontend (Next.js)

## Tech Stack
- **Backend:** Django 4.2 + Django REST Framework + SimpleJWT + PostgreSQL
- **Frontend:** Next.js 14 (App Router) + Tailwind CSS + Axios
- **Auth:** JWT (access + refresh), Argon2 password hashing
- **PDF:** ReportLab (invoice generation)

## Key Features
- Role-based auth (Admin / Vendor / Customer) with JWT
- Product catalog with categories, attributes, pricelists, per-product rental config
- Storefront: browse → cart → checkout with security deposit
- Rental order **state machine**: quotation → sent → reserved → picked up → returned / late return
- **Automatic late-fee + deposit settlement** on return (capped so refund is never negative)
- Invoice generation + branded **PDF download**
- Real-time operations **dashboard** (active, overdue, revenue, deposits held, late fees)
- Production security: rate limiting, token blacklist, IDOR protection, security headers

---

## Setup

### Prerequisites
- Python 3.10+, Node.js 18+, PostgreSQL 14+

### 1. Backend (Django REST — runs on :8000)
```bash
# create the database and role
psql -d postgres -c "CREATE ROLE rental_user WITH LOGIN PASSWORD 'rental_pass' CREATEDB;"
createdb rental -O rental_user

cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

cp .env.example .env          # defaults already point at the rental database
python manage.py migrate
python manage.py seed_demo     # loads demo users, products, and orders
python manage.py runserver
```

### 2. Frontend (Next.js — runs on :3000)
```bash
cd frontend
npm install
cp .env.example .env.local     # NEXT_PUBLIC_API_URL=http://localhost:8000/api
npm run dev
```

Open **http://localhost:3000** in your browser.
Django admin panel: **http://localhost:8000/admin**

---

## Demo Credentials
| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@demo.com` | `Admin@123` |
| Vendor | `vendor@demo.com` | `Vendor@123` |
| Customer | `customer@demo.com` | `Customer@123` |

The seed command also creates demo products and orders in several states
(reserved, returned, late return, quotation) so the dashboard shows live data.

---

## API Overview (base: `/api`)
```
Auth      POST /auth/register/  /auth/register/vendor/  /auth/login/  /auth/logout/
          POST /auth/token/refresh/  GET /auth/me/  /auth/addresses/
Catalog   GET/POST /categories/  /attributes/  /products/  /pricelists/
          POST /products/{id}/publish/
Rentals   POST /checkout/   GET /orders/   POST /orders/  (quotation)
          POST /orders/{id}/confirm/  /pickup/  /return/  /cancel/  /send-quotation/
Billing   GET /orders/{id}/invoice/   GET /invoices/{id}/pdf/   POST /payments/
Reports   GET /dashboard/stats/   GET /dashboard/orders/
```

## Project Structure
```
backend/                Django REST API
  config/               settings, urls
  apps/
    accounts/           users, roles, JWT auth
    catalog/            products, categories, pricelists
    rentals/            orders, state machine, settle_return()
    billing/            invoice, payment, PDF
    reports/            dashboard stats
    common/             base model, ActivityLog, permissions, seed_demo
frontend/               Next.js app (pages, components, api client)
```

## Security Highlights
- Argon2 password hashing, JWT with refresh-token rotation + blacklist
- Login rate limiting (5/min) to block brute force
- All money computed server-side; browser can never tamper totals
- Object-level scoping (customers only see their own orders/invoices/addresses)
- Secrets in `.env` (gitignored), CORS restricted to the frontend origin
