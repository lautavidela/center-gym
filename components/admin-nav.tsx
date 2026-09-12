"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/admin", label: "Inicio", icon: "▦", exact: true },
  { href: "/admin/clientes", label: "Clientes", icon: "👥" },
  { href: "/admin/asistencias", label: "Asistencias", icon: "✓" },
  { href: "/admin/vencimientos", label: "Vencimientos", icon: "⏰" },
  { href: "/admin/ingresos", label: "Ingresos", icon: "📈" },
  { href: "/admin/planes", label: "Planes", icon: "🏋" },
  { href: "/admin/migracion", label: "Migración", icon: "⇅" },
];

export default function AdminNav() {
  const pathname = usePathname();
  const itemRefs = useRef(new Map<string, HTMLAnchorElement>());
  const [indicator, setIndicator] = useState({ left: 0, width: 0 });

  const activeHref = navItems.find((item) =>
    item.exact
      ? pathname === item.href
      : pathname === item.href || pathname.startsWith(item.href + "/")
  )?.href;

  useEffect(() => {
    const update = () => {
      const el = activeHref ? itemRefs.current.get(activeHref) : undefined;
      if (el) {
        setIndicator({ left: el.offsetLeft, width: el.offsetWidth });
      }
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [activeHref, pathname]);

  return (
    <nav className="overflow-x-auto">
      <div className="relative mx-auto flex w-max gap-1 px-4 pb-3">
        {navItems.map((item) => {
          const active = item.href === activeHref;
          return (
            <Link
              key={item.href}
              ref={(el) => {
                if (el) itemRefs.current.set(item.href, el);
                else itemRefs.current.delete(item.href);
              }}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={`flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                active
                  ? "text-emerald-700"
                  : "text-zinc-600 hover:bg-zinc-100 hover:text-emerald-700"
              }`}
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
        <span
          aria-hidden
          className="pointer-events-none absolute bottom-0 h-0.5 rounded-full bg-emerald-600 transition-transform duration-300 ease-out"
          style={{
            width: indicator.width,
            transform: `translateX(${indicator.left}px)`,
          }}
        />
      </div>
    </nav>
  );
}