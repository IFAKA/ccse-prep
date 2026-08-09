"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { enhanceNativeInteractions } from "@/app/native-first-ui/behavior";

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
      <div>
        <NavigationItems items={item.children} pathname={pathname} />
      </div>
    </details> : <Link key={item.href} href={item.href ?? "#"} aria-current={item.href === pathname ? "page" : undefined}>{item.label}</Link>)}
  </>;
}

export default function Navigation() {
  const pathname = usePathname();

  useEffect(() => {
    enhanceNativeInteractions();
  }, []);

  return <>
    <nav className="nf-navigation nf-navigation-desktop" aria-label="Main navigation">
      <NavigationItems items={navigationItems} pathname={pathname} />
    </nav>
    <details className="nf-navigation nf-navigation-mobile">
      <summary>Menu</summary>
      <nav data-menu-content aria-label="Mobile navigation">
        <NavigationItems items={navigationItems} pathname={pathname} />
      </nav>
    </details>
  </>;
}
