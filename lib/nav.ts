export type NavItem = {
  href: string;
  label: string;
  /** Shorter label for compact header nav (md+). */
  shortLabel?: string;
};

/** Public nav — no Admin (DIV-L1-07). Admins see {@link ADMIN_NAV_ITEM} via nav menu. */
export const NAV: NavItem[] = [
  { href: "/", label: "Experts" },
  { href: "/calls", label: "Calls" },
  { href: "/stats", label: "Stats" },
  { href: "/about", label: "About" },
  { href: "/stats", label: "Stats" },
  {
    href: "/mentor/register",
    label: "Offer your expertise",
    shortLabel: "Register",
  },
];

export const ADMIN_NAV_ITEM: NavItem = { href: "/admin", label: "Admin" };

export function getNavItems(isAdmin: boolean): NavItem[] {
  return isAdmin ? [...NAV, ADMIN_NAV_ITEM] : NAV;
}

export function isNavItemActive(pathname: string, href: string): boolean {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

export function findNavItem(pathname: string, isAdmin: boolean): NavItem | undefined {
  if (pathname.startsWith("/admin")) {
    return isAdmin ? ADMIN_NAV_ITEM : undefined;
  }
  return NAV.find((item) => isNavItemActive(pathname, item.href));
}
