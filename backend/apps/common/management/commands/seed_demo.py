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
        outdoor = Category.objects.get_or_create(name="Outdoor")[0]
        party = Category.objects.get_or_create(name="Party & Events")[0]

        def img(photo_id):
            return f"https://images.unsplash.com/photo-{photo_id}?w=500&h=400&fit=crop"

        def media_img(name):
            import re
            slug = re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-")
            return f"http://localhost:8000/media/products/{slug}.jpg"

        catalog = [
            ("Sony DSLR Camera", electronics, 1500, 8, 2, 200, 5000, img("1516035069371-29a1b244cc32")),
            ("DJI Drone", electronics, 2500, 5, 1, 300, 8000, img("1508614589041-895b88991e3e")),
            ("HD Projector", electronics, 800, 6, 2, 100, 3000, img("1626379953822-baec19c3accd")),
            ("PlayStation 5 Console", electronics, 700, 10, 2, 150, 4000, img("1606813907291-d86efa9b94db")),
            ("MacBook Pro Laptop", electronics, 1200, 6, 1, 200, 6000, img("1517336714731-489689fd1ca8")),
            ("Office Chair", furniture, 300, 20, 6, 50, 800, img("1580480055273-228ff5388ef8")),
            ("Leather Sofa Set", furniture, 900, 6, 6, 80, 3000, img("1555041469-a586c61ea9bc")),
            ("Dining Table", furniture, 500, 8, 6, 60, 2000, img("1617806118233-18e1de247200")),
            ("Camping Tent (4-person)", outdoor, 600, 12, 4, 80, 1500, img("1504280390367-361c6d9f38f4")),
            ("Sleeping Bag", outdoor, 150, 25, 4, 20, 400, img("1520095972714-909e91b038e5")),
            ("Mountain Bike", outdoor, 400, 10, 2, 70, 2500, img("1576435728678-68d0fbf94e91")),
            ("DJ Sound System", party, 1800, 4, 2, 250, 7000, img("1571330735066-03aaa9429d89")),
        ]
        products = []
        for name, cat, price, qty, grace, late_fee, deposit, image in catalog:
            product, created = Product.objects.get_or_create(
                name=name,
                defaults={
                    "category": cat,
                    "sales_price": price,
                    "quantity_on_hand": qty,
                    "image_url": media_img(name),
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

        vendor_catalog = [
            ("Canon Cinema Camera", electronics, 2000, 4, 2, 250, 6000, img("1516035069371-29a1b244cc32")),
            ("Wireless Speaker", party, 500, 10, 2, 80, 1500, img("1571330735066-03aaa9429d89")),
            ("LED Projector", electronics, 900, 6, 2, 120, 3500, img("1626379953822-baec19c3accd")),
        ]
        vendor_products = []
        for name, cat, price, qty, grace, late_fee, deposit, image in vendor_catalog:
            product, created = Product.objects.get_or_create(
                name=name,
                defaults={
                    "category": cat,
                    "sales_price": price,
                    "quantity_on_hand": qty,
                    "image_url": media_img(name),
                    "is_published": True,
                    "created_by": vendor,
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
            vendor_products.append(product)

        if not RentalOrder.objects.filter(customer=customer).exists():
            now = timezone.now()
            # (product, pickup_offset_days, return_offset_days, actor, state, created_days_ago)
            # created_days_ago spreads booking dates across the last 2 weeks so the
            # revenue trend has a real curve instead of a single spike.
            plan = [
                (products[1],        -13, -10, admin,  "returned",    13),
                (products[5],        -12,  -9, admin,  "returned",    12),
                (products[8],        -11,  -8, vendor, "returned",    11),
                (products[3],         -9,  -6, admin,  "returned",     9),
                (products[10],        -8,  -5, admin,  "returned",     8),
                (products[6],         -7,  -4, vendor, "returned",     7),
                (products[2],         -6,  -3, admin,  "late_return",   6),
                (products[9],         -5,  -2, admin,  "returned",      5),
                (products[4],         -4,  -1, admin,  "returned",      4),
                (vendor_products[1],  -4,  -1, vendor, "returned",      3),
                (products[0],         -2,  +2, admin,  "picked_up",     2),  # active, return upcoming
                (products[11],        -3,  -1, admin,  "picked_up",     3),  # still out -> overdue
                (products[7],         +1,  +4, admin,  "reserved",      1),  # upcoming pickup
                (vendor_products[0],  +2,  +5, vendor, "reserved",      0),  # upcoming pickup
                (products[3],         +2,  +5, admin,  "quotation",     0),
            ]
            for product, pu, rt, actor, state, cdays in plan:
                self._order(
                    customer, product,
                    now + timedelta(days=pu), now + timedelta(days=rt),
                    actor, state, created_days_ago=cdays,
                )
            self.stdout.write("Created demo orders spread over the last 14 days.")

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

    def _order(self, customer, product, pickup, ret, admin, state, created_days_ago=None):
        confirm = state != "quotation"
        order = rental_services.create_order(
            customer=customer,
            lines=[{"product": product, "quantity": 1}],
            pickup_date=pickup,
            return_date=ret,
            created_by=admin,
            confirm=confirm,
        )
        # Backdate the booking (auto_now_add can't be set at creation, so update()).
        if created_days_ago is not None:
            RentalOrder.objects.filter(pk=order.pk).update(
                created_at=timezone.now() - timedelta(days=created_days_ago)
            )
        if not confirm:
            return
        billing_services.generate_invoice(order)
        billing_services.record_payments(order)
        if state == "reserved":
            return
        rental_services.mark_pickup(order, admin, when=pickup)
        if state == "returned":
            rental_services.settle_return(order, admin, when=ret - timedelta(hours=1))
        elif state == "late_return":
            rental_services.settle_return(order, admin, when=ret + timedelta(hours=6))
        # "picked_up" -> leave the order out (drives active / overdue counts)
