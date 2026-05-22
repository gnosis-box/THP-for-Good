export type NavItem = {
  href: string;
  label: string;
};

/** Public nav — no Admin (DIV-L1-07). Admins see {@link ADMIN_NAV_ITEM} via MobileNav only. */
export const NAV: NavItem[] = [
  { href: "/", label: "Experts" },
  { href: "/calls", label: "Calls" },
  { href: "/mentor/register", label: "Offer your expertise" },
  { href: "/admin", label: "Admin" },
];

export const ADMIN_NAV_ITEM: NavItem = { href: "/admin", label: "Admin" };
