'use client';

import { Menu } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { motion } from 'motion/react';

import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { useIsAdmin } from '@/hooks/use-is-admin';
import { usePrefersReducedMotion } from '@/hooks/use-prefers-reduced-motion';
import { motionClass, motionStaggerStyle } from '@/lib/motion';
import { getNavItems, isNavItemActive, type NavItem } from '@/lib/nav';
import { cn } from '@/lib/utils';

const navLinkClass = (active: boolean, compact = false) =>
  cn(
    'inline-flex min-h-11 items-center rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
    compact ? 'relative px-2.5 pb-1 text-xs' : 'px-3 text-sm',
    active
      ? 'font-semibold text-foreground'
      : 'text-muted-foreground hover:bg-muted hover:text-foreground',
    compact &&
      active &&
      'after:absolute after:inset-x-1 after:bottom-0 after:h-0.5 after:rounded-full after:bg-primary',
  );

type NavLinksProps = {
  items: NavItem[];
  pathname: string;
  compact?: boolean;
  onNavigate?: () => void;
  className?: string;
  stagger?: boolean;
};

function NavLinks({
  items,
  pathname,
  compact = false,
  onNavigate,
  className,
  stagger = false,
}: NavLinksProps) {
  const reducedMotion = usePrefersReducedMotion();
  const activeHref = items.find((item) => isNavItemActive(pathname, item.href))?.href;

  return (
    <>
      {items.map((item, index) => {
        const active = isNavItemActive(pathname, item.href);
        const label = compact && item.shortLabel ? item.shortLabel : item.label;
        const linkClass = cn(navLinkClass(active, compact), className);

        if (compact && !reducedMotion && activeHref) {
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              aria-current={active ? 'page' : undefined}
              className={cn(linkClass, 'relative')}
            >
              {label}
              {active ? (
                <motion.span
                  layoutId="desktop-nav-underline"
                  className="absolute inset-x-1 bottom-0 h-0.5 rounded-full bg-primary"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              ) : null}
            </Link>
          );
        }

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            aria-current={active ? 'page' : undefined}
            className={cn(
              linkClass,
              stagger && motionClass('', 'motion-list-item-in', reducedMotion),
            )}
            style={stagger ? motionStaggerStyle(index, reducedMotion, items.length) : undefined}
          >
            {label}
          </Link>
        );
      })}
    </>
  );
}

export function DesktopNav() {
  const pathname = usePathname();
  const { isAdmin } = useIsAdmin();
  const items = getNavItems(isAdmin);

  return (
    <nav
      className="hidden min-w-0 flex-1 items-center justify-center gap-0.5 lg:flex lg:gap-1"
      aria-label="Main navigation"
    >
      <NavLinks items={items} pathname={pathname} compact />
    </nav>
  );
}

export function MobileNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { isAdmin } = useIsAdmin();
  const items = getNavItems(isAdmin);
  const sheetId = 'mobile-main-nav';

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="size-11 shrink-0 lg:hidden"
        aria-label={open ? 'Close navigation menu' : 'Open navigation menu'}
        aria-expanded={open}
        aria-controls={sheetId}
        onClick={() => setOpen(true)}
      >
        <Menu className="size-5" aria-hidden />
      </Button>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          id={sheetId}
          side="left"
          className="w-[min(calc(100vw-2rem),16rem)] gap-0 p-0 pb-[env(safe-area-inset-bottom)] [&_[data-slot=sheet-close]]:size-11 [&_[data-slot=sheet-close]]:min-h-11 [&_[data-slot=sheet-close]]:min-w-11"
        >
          <SheetHeader className="border-b border-border px-4 py-4 pr-14">
            <SheetTitle>Menu</SheetTitle>
            <SheetDescription className="sr-only">
              Main navigation links for THP for Good
            </SheetDescription>
          </SheetHeader>
          <nav
            key={open ? 'nav-open' : 'nav-closed'}
            className="flex flex-col gap-1 p-3"
            aria-label="Main navigation"
          >
            <NavLinks
              items={items}
              pathname={pathname}
              onNavigate={() => setOpen(false)}
              className="w-full"
              stagger={open}
            />
          </nav>
        </SheetContent>
      </Sheet>
    </>
  );
}
