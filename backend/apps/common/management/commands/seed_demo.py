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
            ("Sony DSLR Camera", electronics, 1500, 8, 2, 200, 5000, "https://loremflickr.com/500/400/dslr,camera?lock=11"),
            ("DJI Drone", electronics, 2500, 5, 1, 300, 8000, "https://loremflickr.com/500/400/drone?lock=22"),
            ("Camping Tent (4-person)", furniture, 600, 12, 4, 80, 1500, "https://loremflickr.com/500/400/camping,tent?lock=33"),
            ("Office Chair", furniture, 300, 20, 6, 50, 800, "https://loremflickr.com/500/400/office,chair?lock=44"),
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
