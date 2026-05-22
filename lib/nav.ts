export type NavItem = {
  href: string;
  label: string;
};

export const NAV: NavItem[] = [
  { href: "/", label: "Experts" },
  { href: "/calls", label: "Calls" },
  { href: "/about", label: "About" },
  { href: "/mentor/register", label: "Offer your expertise" },
  { href: "/admin", label: "Admin" },
];
