import type { LucideIcon } from "lucide-react";

/**
 * A single navigation entry rendered in the sidebar or navbar.
 */
export interface NavItem {
  title: string;
  href: string;
  icon?: LucideIcon;
  /** Optional trailing badge/count, e.g. "12" or "New". */
  badge?: string;
  /** Renders the item as non-interactive. */
  disabled?: boolean;
  /** Opens in a new tab and adds an external indicator. */
  external?: boolean;
}

/**
 * A labelled cluster of nav items (a section in the sidebar).
 */
export interface NavGroup {
  title: string;
  items: NavItem[];
}

/**
 * Minimal shape for the signed-in user surfaced in the shell.
 * Real auth/session wiring lands in a later milestone.
 */
export interface AppUser {
  name: string;
  email: string;
  avatarUrl?: string;
  role: "admin" | "customer";
}
