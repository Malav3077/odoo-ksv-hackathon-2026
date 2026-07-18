from django.core.management.base import BaseCommand
from django.db import transaction

from apps.catalog.models import (
    Attribute, AttributeValue, Category, PriceList, PriceListRule, Product, RentalConfig
)


class Command(BaseCommand):
    help = "Seed demo catalog data — categories, attributes, products, pricelists."

    @transaction.atomic
    def handle(self, *args, **options):
        self.stdout.write("Seeding catalog...")

        # ── CATEGORIES ──────────────────────────────────────────────────
        electronics, _ = Category.objects.get_or_create(name="Electronics")
        furniture,   _ = Category.objects.get_or_create(name="Furniture")
        vehicles,    _ = Category.objects.get_or_create(name="Vehicles")
        tools,       _ = Category.objects.get_or_create(name="Tools")
        events,      _ = Category.objects.get_or_create(name="Events")
        cameras,     _ = Category.objects.get_or_create(name="Cameras", defaults={"parent": electronics})
        laptops,     _ = Category.objects.get_or_create(name="Laptops", defaults={"parent": electronics})

        self.stdout.write(self.style.SUCCESS("  ✓ Categories"))

        # ── ATTRIBUTES ───────────────────────────────────────────────────
        color_attr, _ = Attribute.objects.get_or_create(name="Color", defaults={"display_type": "pills"})
        brand_attr, _ = Attribute.objects.get_or_create(name="Brand", defaults={"display_type": "radio"})
        size_attr,  _ = Attribute.objects.get_or_create(name="Size",  defaults={"display_type": "radio"})

        color_vals = [
            ("Black", 0), ("White", 0), ("Silver", 0), ("Red", 50), ("Blue", 50),
        ]
        brand_vals = [
            ("Sony", 0), ("Canon", 0), ("DJI", 0), ("Dell", 0), ("HP", 0), ("Apple", 200),
        ]
        size_vals = [
            ("Small", 0), ("Medium", 0), ("Large", 100), ("XL", 150),
        ]
        for val, price in color_vals:
            AttributeValue.objects.get_or_create(attribute=color_attr, value=val, defaults={"extra_price": price})
        for val, price in brand_vals:
            AttributeValue.objects.get_or_create(attribute=brand_attr, value=val, defaults={"extra_price": price})
        for val, price in size_vals:
            AttributeValue.objects.get_or_create(attribute=size_attr, value=val, defaults={"extra_price": price})

        self.stdout.write(self.style.SUCCESS("  ✓ Attributes & Values"))

        # ── PRODUCTS + RENTAL CONFIGS ─────────────────────────────────
        PRODUCTS = [
            {
                "name": "Sony Alpha A7 III Camera",
                "category": cameras,
                "description": "Full-frame mirrorless camera, perfect for professional photography and videography. Comes with 28-70mm kit lens.",
                "sales_price": "800.00",
                "cost_price": "200.00",
                "quantity_on_hand": 5,
                "is_published": True,
                "rental": {"periodicity": "daily", "security_deposit_amount": "5000.00", "late_fee_per_hour": "200.00"},
                "attrs": [("Brand", "Sony"), ("Color", "Black")],
            },
            {
                "name": "DJI Mavic 3 Pro Drone",
                "category": electronics,
                "description": "Professional drone with 4K camera, 46-minute flight time, and obstacle avoidance. Ideal for aerial photography.",
                "sales_price": "1500.00",
                "cost_price": "400.00",
                "quantity_on_hand": 3,
                "is_published": True,
                "rental": {"periodicity": "daily", "security_deposit_amount": "10000.00", "late_fee_per_hour": "500.00"},
                "attrs": [("Brand", "DJI"), ("Color", "Silver")],
            },
            {
                "name": "Dell XPS 15 Laptop",
                "category": laptops,
                "description": "High-performance laptop with Intel i7, 16GB RAM, 512GB SSD. Great for presentations, design work, and events.",
                "sales_price": "600.00",
                "cost_price": "150.00",
                "quantity_on_hand": 8,
                "is_published": True,
                "rental": {"periodicity": "daily", "security_deposit_amount": "3000.00", "late_fee_per_hour": "100.00"},
                "attrs": [("Brand", "Dell"), ("Color", "Silver")],
            },
            {
                "name": "Canon EOS 90D DSLR",
                "category": cameras,
                "description": "32.5MP DSLR camera with dual pixel autofocus. Excellent for events, weddings, and sports photography.",
                "sales_price": "700.00",
                "cost_price": "180.00",
                "quantity_on_hand": 4,
                "is_published": True,
                "rental": {"periodicity": "daily", "security_deposit_amount": "4000.00", "late_fee_per_hour": "150.00"},
                "attrs": [("Brand", "Canon"), ("Color", "Black")],
            },
            {
                "name": "Honda Activa 6G Scooter",
                "category": vehicles,
                "description": "Fuel-efficient 110cc scooter. Perfect for city commute and short trips. Helmet included.",
                "sales_price": "400.00",
                "cost_price": "80.00",
                "quantity_on_hand": 10,
                "is_published": True,
                "rental": {"periodicity": "daily", "security_deposit_amount": "2000.00", "late_fee_per_hour": "150.00"},
                "attrs": [("Color", "White")],
            },
            {
                "name": "Full HD Projector 4000 Lumens",
                "category": events,
                "description": "1080p projector with HDMI/USB connectivity. Ideal for presentations, movie nights, and outdoor events.",
                "sales_price": "700.00",
                "cost_price": "150.00",
                "quantity_on_hand": 6,
                "is_published": True,
                "rental": {"periodicity": "daily", "security_deposit_amount": "4000.00", "late_fee_per_hour": "200.00"},
                "attrs": [("Color", "Black")],
            },
            {
                "name": "Camping Tent (6-Person)",
                "category": events,
                "description": "Spacious waterproof tent for 6 people. Easy setup with carry bag. Perfect for outdoor events and camping.",
                "sales_price": "300.00",
                "cost_price": "60.00",
                "quantity_on_hand": 12,
                "is_published": True,
                "rental": {"periodicity": "daily", "security_deposit_amount": "1500.00", "late_fee_per_hour": "50.00"},
                "attrs": [("Color", "Blue"), ("Size", "Large")],
            },
            {
                "name": "Bosch Power Drill Set",
                "category": tools,
                "description": "18V cordless drill with 25-piece bit set, 2 batteries, and carry case. Professional grade.",
                "sales_price": "200.00",
                "cost_price": "50.00",
                "quantity_on_hand": 15,
                "is_published": True,
                "rental": {"periodicity": "daily", "security_deposit_amount": "500.00", "late_fee_per_hour": "50.00"},
                "attrs": [("Brand", "Sony"), ("Color", "Black")],
            },
            {
                "name": "Wooden Dining Table (8-Seater)",
                "category": furniture,
                "description": "Premium teak wood dining table seating 8. Suitable for events, exhibitions, and temporary office setups.",
                "sales_price": "500.00",
                "cost_price": "100.00",
                "quantity_on_hand": 7,
                "is_published": True,
                "rental": {"periodicity": "daily", "security_deposit_amount": "3000.00", "late_fee_per_hour": "100.00"},
                "attrs": [("Color", "Black"), ("Size", "XL")],
            },
            {
                "name": "HP EliteBook 840 Laptop",
                "category": laptops,
                "description": "Business laptop with Intel i5, 8GB RAM, 256GB SSD. Great for office use and travel.",
                "sales_price": "450.00",
                "cost_price": "100.00",
                "quantity_on_hand": 6,
                "is_published": True,
                "rental": {"periodicity": "daily", "security_deposit_amount": "2500.00", "late_fee_per_hour": "80.00"},
                "attrs": [("Brand", "HP"), ("Color", "Silver")],
            },
        ]

        for p_data in PRODUCTS:
            rental_data = p_data.pop("rental")
            attrs_data  = p_data.pop("attrs")

            product, created = Product.objects.get_or_create(
                name=p_data["name"],
                defaults={k: v for k, v in p_data.items()}
            )

            RentalConfig.objects.get_or_create(product=product, defaults=rental_data)

            for attr_name, val_name in attrs_data:
                try:
                    av = AttributeValue.objects.get(attribute__name=attr_name, value=val_name)
                    product.attribute_values.add(av)
                except AttributeValue.DoesNotExist:
                    pass

        self.stdout.write(self.style.SUCCESS("  ✓ Products & Rental Configs"))

        # ── PRICELISTS ────────────────────────────────────────────────
        default_pl, _ = PriceList.objects.get_or_create(
            name="Standard Pricing",
            defaults={"is_default": True}
        )

        weekend_pl, _ = PriceList.objects.get_or_create(
            name="Weekend Special",
            defaults={"is_default": False}
        )
        for product in Product.objects.filter(is_published=True):
            PriceListRule.objects.get_or_create(
                pricelist=weekend_pl,
                applies_to_product=product,
                defaults={"price_type": "discount", "discount_percent": "10.00", "min_qty": 1}
            )

        bulk_pl, _ = PriceList.objects.get_or_create(
            name="Bulk Rental (3+ items)",
            defaults={"is_default": False}
        )
        for product in Product.objects.filter(is_published=True):
            PriceListRule.objects.get_or_create(
                pricelist=bulk_pl,
                applies_to_product=product,
                defaults={"price_type": "discount", "discount_percent": "20.00", "min_qty": 3}
            )

        self.stdout.write(self.style.SUCCESS("  ✓ Pricelists & Rules"))

        # ── SUMMARY ───────────────────────────────────────────────────
        self.stdout.write("")
        self.stdout.write(self.style.SUCCESS("=" * 50))
        self.stdout.write(self.style.SUCCESS("  CATALOG SEEDED SUCCESSFULLY"))
        self.stdout.write(self.style.SUCCESS("=" * 50))
        self.stdout.write(f"  Categories  : {Category.objects.count()}")
        self.stdout.write(f"  Attributes  : {Attribute.objects.count()}")
        self.stdout.write(f"  Attr Values : {AttributeValue.objects.count()}")
        self.stdout.write(f"  Products    : {Product.objects.count()}")
        self.stdout.write(f"  Pricelists  : {PriceList.objects.count()}")
        self.stdout.write(f"  PL Rules    : {PriceListRule.objects.count()}")
        self.stdout.write(self.style.SUCCESS("=" * 50))
        self.stdout.write("")
