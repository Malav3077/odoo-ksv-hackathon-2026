"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Search } from "lucide-react";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ModeToggle } from "@/components/theme/mode-toggle";
import {
  primaryNav,
  secondaryNav,
  utilityNav,
} from "@/config/navigation";

/** href -> human label, sourced from the nav config. */
const LABELS = Object.fromEntries(
  [...primaryNav.flatMap((g) => g.items), ...secondaryNav, ...utilityNav].map(
    (item) => [item.href, item.title],
  ),
);

function titleize(segment) {
  return segment
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function useBreadcrumbs(pathname) {
  return React.useMemo(() => {
    const segments = pathname.split("/").filter(Boolean);
    if (segments.length === 0) {
      return [{ label: "Dashboard", href: "/", isLast: true }];
    }
    return segments.map((segment, index) => {
      const href = `/${segments.slice(0, index + 1).join("/")}`;
      return {
        label: LABELS[href] ?? titleize(segment),
        href,
        isLast: index === segments.length - 1,
      };
    });
  }, [pathname]);
}

export function Navbar() {
  const pathname = usePathname();
  const crumbs = useBreadcrumbs(pathname);

  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-2 border-b border-border/60 bg-background/80 px-3 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:px-4">
      <SidebarTrigger className="-ml-1 text-muted-foreground" />
      <Separator orientation="vertical" className="mr-1 h-4" />

      <Breadcrumb>
        <BreadcrumbList>
          {crumbs.map((crumb) => (
            <React.Fragment key={crumb.href}>
              <BreadcrumbItem>
                {crumb.isLast ? (
                  <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink render={<Link href={crumb.href} />}>
                    {crumb.label}
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
              {!crumb.isLast && <BreadcrumbSeparator />}
            </React.Fragment>
          ))}
        </BreadcrumbList>
      </Breadcrumb>

      <div className="ml-auto flex items-center gap-1.5">
        {/* Search — visual placeholder for the command palette (later milestone) */}
        <button
          type="button"
          className="hidden h-8 items-center gap-2 rounded-lg border border-border bg-muted/40 px-2.5 text-sm text-muted-foreground transition-colors hover:bg-muted md:flex"
        >
          <Search className="size-4" />
          <span>Search…</span>
          <kbd className="pointer-events-none ml-4 hidden items-center gap-0.5 rounded border border-border bg-background px-1.5 font-mono text-[10px] font-medium text-muted-foreground lg:inline-flex">
            <span className="text-xs">⌘</span>K
          </kbd>
        </button>

        <Button
          variant="ghost"
          size="icon"
          className="size-8 text-muted-foreground md:hidden"
          aria-label="Search"
        >
          <Search className="size-4" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="relative size-8 text-muted-foreground"
          aria-label="Notifications"
        >
          <Bell className="size-4" />
          <span className="absolute top-1.5 right-1.5 size-1.5 rounded-full bg-primary ring-2 ring-background" />
        </Button>

        <ModeToggle />
      </div>
    </header>
  );
}
