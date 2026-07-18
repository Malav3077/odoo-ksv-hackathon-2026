from datetime import timedelta
from decimal import Decimal

from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils import timezone

from apps.accounts.models import User
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
        self.stdout.write("  Open the dashboard: GET /api/reports/dashboard/")

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
            return rsvc.create_order(
                customer=customer,
                lines=[{"product": product, "quantity": qty}],
                pickup_date=pickup,
                return_date=ret,
                delivery_method="store_pickup",
                created_by=admin,
                confirm=confirm,
            )

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
        rsvc.mark_return(o5, admin, when=now - timedelta(days=1, hours=2))

        # 6) Returned late -> late fee charged, deposit partly withheld
        o6 = make(products[0], 1, now - timedelta(days=4), now - timedelta(days=2))
        rsvc.mark_pickup(o6, admin, when=now - timedelta(days=4))
        rsvc.mark_return(o6, admin, when=now - timedelta(days=1, hours=20))
