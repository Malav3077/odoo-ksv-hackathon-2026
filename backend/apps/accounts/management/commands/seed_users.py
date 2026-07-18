from django.core.management.base import BaseCommand
from django.db import transaction
from django.db.models import Q

from apps.accounts.models import User, VendorProfile

# (username, email, password, first_name, last_name, phone)
SEED_USERS = {
    "admin": [
        ("admin", "admin@rentease.com", "Admin@123", "Site", "Admin", "9000000001"),
    ],
    "vendor": [
        ("vendor1", "vendor1@rentease.com", "Vendor@123", "Ravi", "Shah", "9000000011"),
        ("vendor2", "vendor2@rentease.com", "Vendor@123", "Meena", "Patel", "9000000012"),
    ],
    "customer": [
        ("customer1", "customer1@rentease.com", "Customer@1", "Amit", "Kumar", "9000000021"),
        ("customer2", "customer2@rentease.com", "Customer@1", "Priya", "Verma", "9000000022"),
    ],
}

VENDOR_COMPANIES = {
    "vendor1": ("Shah Rentals Pvt Ltd", "24ABCDE1234F1Z5"),
    "vendor2": ("Patel Equipment Co", "24FGHIJ5678K2Z9"),
}


class Command(BaseCommand):
    help = "Seed the database with demo admin, vendor and customer users."

    def add_arguments(self, parser):
        parser.add_argument(
            "--reset",
            action="store_true",
            help="Reset passwords/roles on users that already exist.",
        )

    @transaction.atomic
    def handle(self, *args, **options):
        reset = options["reset"]
        created, updated = [], []

        for role, users in SEED_USERS.items():
            for username, email, password, first, last, phone in users:
                user = User.objects.filter(
                    Q(email__iexact=email) | Q(username__iexact=username)
                ).first()
                is_new = user is None

                if is_new:
                    user = User(username=username, email=email)
                elif not reset:
                    self.stdout.write(self.style.WARNING(f"skip  {email} (exists, use --reset)"))
                    continue
                else:
                    user.username = username
                    user.email = email

                user.role = role
                user.first_name = first
                user.last_name = last
                user.phone = phone
                if role == "admin":
                    user.is_staff = True
                    user.is_superuser = True
                user.set_password(password)
                user.save()

                if role == "vendor":
                    company, gst = VENDOR_COMPANIES[username]
                    VendorProfile.objects.update_or_create(
                        user=user, defaults={"company_name": company, "gst_no": gst}
                    )

                (created if is_new else updated).append((role, email, password))

        self._print_summary(created, updated)

    def _print_summary(self, created, updated):
        self.stdout.write("")
        self.stdout.write(self.style.SUCCESS("=" * 56))
        self.stdout.write(self.style.SUCCESS("  SEED COMPLETE — LOGIN CREDENTIALS"))
        self.stdout.write(self.style.SUCCESS("=" * 56))
        self.stdout.write(f"  {'ROLE':<10}{'EMAIL':<30}{'PASSWORD'}")
        self.stdout.write("  " + "-" * 52)
        for role, email, password in SEED_USERS_flat():
            self.stdout.write(f"  {role:<10}{email:<30}{password}")
        self.stdout.write(self.style.SUCCESS("=" * 56))
        self.stdout.write(
            f"  created: {len(created)}   updated: {len(updated)}"
        )
        self.stdout.write("  Login (frontend): use EMAIL + PASSWORD")
        self.stdout.write("  Django admin: http://localhost:8000/admin/ (admin@rentease.com)")
        self.stdout.write("")


def SEED_USERS_flat():
    for role, users in SEED_USERS.items():
        for username, email, password, *_ in users:
            yield role, email, password
