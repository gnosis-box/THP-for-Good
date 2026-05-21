export type NavItem = {
  href: string;
  label: string;
};

export const NAV: NavItem[] = [
  { href: "/", label: "Dashboard" },
  { href: "/mentors", label: "Mentors" },
  { href: "/calls", label: "Mes appels" },
  { href: "/profile", label: "Profile" },
  { href: "/actions", label: "Actions" },
];
