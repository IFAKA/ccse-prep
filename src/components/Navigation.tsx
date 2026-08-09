"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type NavigationItem = {
  label: string;
  href?: string;
  children?: NavigationItem[];
};

const navigationItems: NavigationItem[] = [
  { label: "Study", href: "/study" },
  { label: "Mock", href: "/mock" },
  { label: "Errors", href: "/errors" },
  { label: "Progress", href: "/progress" },
  { label: "Settings", href: "/settings" },
];

function NavigationItems({ items, pathname }: { items: NavigationItem[]; pathname: string }) {
  return <>
    {items.map((item) => item.children ? <details key={item.label}>
      <summary>{item.label}</summary>
      <div className="nf-navigation-children">
        <NavigationItems items={item.children} pathname={pathname} />
      </div>
    </details> : <Link key={item.href} href={item.href ?? "#"} aria-current={item.href === pathname ? "page" : undefined}>{item.label}</Link>)}
  </>;
}

export default function Navigation() {
  const pathname = usePathname();

  return <>
    <nav className="nf-navigation main-nav" aria-label="Main navigation">
      <NavigationItems items={navigationItems} pathname={pathname} />
    </nav>
    <details className="nf-navigation mobile-menu">
      <summary>Menu</summary>
      <nav className="mobile-menu-panel" aria-label="Mobile navigation">
        <NavigationItems items={navigationItems} pathname={pathname} />
      </nav>
    </details>
  </>;
}
