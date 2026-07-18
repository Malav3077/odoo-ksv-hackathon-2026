from datetime import timedelta

from django.core.management.base import BaseCommand
from django.utils import timezone

from apps.accounts.models import CustomerAddress, User, VendorProfile
from apps.billing import services as billing_services
from apps.catalog.models import Category, PriceList, Product, RentalConfig
from apps.rentals import services as rental_services
from apps.rentals.models import RentalOrder


class Command(BaseCommand):
    help = "Seed demo data (users, products, orders in various states)."

    def handle(self, *args, **options):
        admin = self._user("admin", "admin@demo.com", "Admin@123", "admin", staff=True, superuser=True)
        vendor = self._user("vendor", "vendor@demo.com", "Vendor@123", "vendor")
        VendorProfile.objects.get_or_create(
            user=vendor,
            defaults={"company_name": "RentEase Store", "gst_no": "22AAAAA0000A1Z5"},
        )
        customer = self._user("customer", "customer@demo.com", "Customer@123", "customer")
        CustomerAddress.objects.get_or_create(
            user=customer,
            full_name="Demo Customer",
            defaults={
                "address_line": "12 MG Road",
                "city": "Ahmedabad",
                "zip_code": "380001",
                "country": "India",
                "is_default": True,
            },
        )

        electronics = Category.objects.get_or_create(name="Electronics")[0]
        furniture = Category.objects.get_or_create(name="Furniture")[0]

        catalog = [
            ("Sony DSLR Camera", electronics, 1500, 8, 2, 200, 5000, "https://picsum.photos/seed/camera/400/300"),
            ("DJI Drone", electronics, 2500, 5, 1, 300, 8000, "https://picsum.photos/seed/drone/400/300"),
            ("Camping Tent (4-person)", furniture, 600, 12, 4, 80, 1500, "https://picsum.photos/seed/tent/400/300"),
            ("Office Chair", furniture, 300, 20, 6, 50, 800, "https://picsum.photos/seed/chair/400/300"),
        ]
        products = []
        for name, cat, price, qty, grace, late_fee, deposit, img in catalog:
            product, created = Product.objects.get_or_create(
                name=name,
                defaults={
                    "category": cat,
                    "sales_price": price,
                    "quantity_on_hand": qty,
                    "image_url": img,
                    "is_published": True,
                    "created_by": admin,
                },
            )
            if created:
                RentalConfig.objects.create(
                    product=product,
                    periodicity="daily",
                    padding_time=grace,
                    late_fee_per_hour=late_fee,
                    security_deposit_amount=deposit,
                )
            products.append(product)

        PriceList.objects.get_or_create(name="Default Pricelist", defaults={"is_default": True})

        if not RentalOrder.objects.filter(customer=customer).exists():
            now = timezone.now()
            self._order(customer, products[0], now + timedelta(days=1), now + timedelta(days=4), admin, "reserved")
            self._order(customer, products[1], now - timedelta(days=5), now - timedelta(days=1), admin, "returned")
            self._order(customer, products[2], now - timedelta(hours=30), now - timedelta(hours=6), admin, "late_return")
            self._order(customer, products[3], now + timedelta(days=2), now + timedelta(days=5), admin, "quotation")
            self.stdout.write("Created demo orders (reserved, returned, late_return, quotation).")

        self.stdout.write(self.style.SUCCESS("Demo data seeded. Login: admin@demo.com / Admin@123"))

    def _user(self, username, email, password, role, staff=False, superuser=False):
        user, created = User.objects.get_or_create(
            username=username,
            defaults={"email": email, "role": role, "is_staff": staff, "is_superuser": superuser},
        )
        if created:
            user.set_password(password)
            user.save()
        return user

    def _order(self, customer, product, pickup, ret, admin, state):
        if state == "quotation":
            rental_services.create_order(
                customer=customer,
                lines=[{"product": product, "quantity": 1}],
                pickup_date=pickup,
                return_date=ret,
                created_by=admin,
                confirm=False,
            )
            return
        order = rental_services.create_order(
            customer=customer,
            lines=[{"product": product, "quantity": 1}],
            pickup_date=pickup,
            return_date=ret,
            created_by=admin,
            confirm=True,
        )
        billing_services.generate_invoice(order)
        billing_services.record_payments(order)
        if state == "reserved":
            return
        rental_services.mark_pickup(order, admin, when=pickup)
        if state == "returned":
            rental_services.settle_return(order, admin, when=ret - timedelta(hours=1))
        elif state == "late_return":
            rental_services.settle_return(order, admin, when=ret + timedelta(hours=6))

from datetime import timedelta
from decimal import Decimal

from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils import timezone

from apps.accounts.models import User
from apps.billing import services as bsvc
from apps.billing.models import Invoice
from apps.catalog.models import Category, Product, RentalConfig
from apps.rentals import services as rsvc
from apps.rentals.models import RentalOrder

PRODUCTS = [
    # name, category, price, deposit, late_fee_per_hour
    ("DSLR Camera", "Electronics", "500", "2000", "50"),
    ("Party Speaker", "Electronics", "300", "1000", "30"),
    ("Office Chair", "Furniture", "120", "500", "10"),
    ("Mountain Bike", "Sports", "250", "1500", "40"),
    ("Camping Tent", "Sports", "200", "800", "20"),
]


class Command(BaseCommand):
    help = "Seed demo catalog + rental orders in every state so the dashboard is populated."

    def add_arguments(self, parser):
        parser.add_argument(
            "--fresh",
            action="store_true",
            help="Delete existing orders and invoices before seeding.",
        )

    @transaction.atomic
    def handle(self, *args, **options):
        admin = User.objects.filter(role="admin").first()
        customer = User.objects.filter(role="customer").first()
        if not admin or not customer:
            self.stderr.write(
                self.style.ERROR("Run `seed_users` first — need an admin and a customer.")
            )
            return

        if options["fresh"]:
            Invoice.objects.all().delete()
            RentalOrder.objects.all().delete()
            self.stdout.write(self.style.WARNING("Cleared existing orders + invoices."))
        elif RentalOrder.objects.exists():
            self.stdout.write(
                self.style.WARNING("Orders already exist — use --fresh to reseed. Skipping.")
            )
            return

        products = self._seed_catalog(admin)
        self._seed_orders(admin, customer, products)

        self.stdout.write("")
        self.stdout.write(self.style.SUCCESS("Demo data seeded:"))
        self.stdout.write(f"  products : {Product.objects.count()}")
        self.stdout.write(f"  orders   : {RentalOrder.objects.count()}")
        self.stdout.write(f"  invoices : {Invoice.objects.count()}")
        self.stdout.write("  Dashboard KPIs: GET /api/dashboard/stats/")

    def _seed_catalog(self, admin):
        products = []
        for name, cat_name, price, deposit, late_fee in PRODUCTS:
            category, _ = Category.objects.get_or_create(name=cat_name)
            product, _ = Product.objects.get_or_create(
                name=name,
                defaults=dict(
                    category=category,
                    sales_price=Decimal(price),
                    quantity_on_hand=10,
                    is_published=True,
                    created_by=admin,
                ),
            )
            RentalConfig.objects.update_or_create(
                product=product,
                defaults=dict(
                    periodicity="daily",
                    late_fee_per_hour=Decimal(late_fee),
                    security_deposit_amount=Decimal(deposit),
                ),
            )
            products.append(product)
        return products

    def _seed_orders(self, admin, customer, products):
        now = timezone.now()

        def make(product, qty, pickup, ret, confirm=True):
            order = rsvc.create_order(
                customer=customer,
                lines=[{"product": product, "quantity": qty}],
                pickup_date=pickup,
                return_date=ret,
                delivery_method="store_pickup",
                created_by=admin,
                confirm=confirm,
            )
            if confirm:
                bsvc.generate_invoice(order)
                bsvc.record_payments(order)
            return order

        # 1) Reserved, pickup in the future -> upcoming pickup
        make(products[0], 1, now + timedelta(days=1), now + timedelta(days=3))

        # 2) Picked up, returns in the future -> active + upcoming return
        o2 = make(products[1], 2, now - timedelta(days=1), now + timedelta(days=2))
        rsvc.mark_pickup(o2, admin, when=now - timedelta(days=1))

        # 3) Picked up, due today -> due today + active
        o3 = make(products[2], 1, now - timedelta(days=2), now + timedelta(hours=4))
        rsvc.mark_pickup(o3, admin, when=now - timedelta(days=2))

        # 4) Picked up, already overdue -> overdue
        o4 = make(products[3], 1, now - timedelta(days=3), now - timedelta(hours=6))
        rsvc.mark_pickup(o4, admin, when=now - timedelta(days=3))

        # 5) Returned on time -> revenue, full deposit back
        o5 = make(products[4], 1, now - timedelta(days=5), now - timedelta(days=1))
        rsvc.mark_pickup(o5, admin, when=now - timedelta(days=5))
        rsvc.settle_return(o5, admin, when=now - timedelta(days=1, hours=2))

        # 6) Returned late -> late fee charged, deposit partly withheld
        o6 = make(products[0], 1, now - timedelta(days=4), now - timedelta(days=2))
        rsvc.mark_pickup(o6, admin, when=now - timedelta(days=4))
        rsvc.settle_return(o6, admin, when=now - timedelta(days=1, hours=20))
