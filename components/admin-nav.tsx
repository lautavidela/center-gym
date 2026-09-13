"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

const navItems = [
  { sub: "", label: "Inicio", icon: "▦", exact: true },
  { sub: "/clientes", label: "Clientes", icon: "👥" },
  { sub: "/asistencias", label: "Asistencias", icon: "✓" },
  { sub: "/vencimientos", label: "Vencimientos", icon: "⏰" },
  { sub: "/ingresos", label: "Ingresos", icon: "📈" },
  { sub: "/planes", label: "Planes", icon: "🏋" },
  { sub: "/migracion", label: "Migración", icon: "⇅" },
];

export default function AdminNav({ slug }: { slug: string }) {
  const pathname = usePathname();
  const base = `/g/${slug}/admin`;
  const itemRefs = useRef(new Map<string, HTMLAnchorElement>());
  const [indicator, setIndicator] = useState({ left: 0, width: 0 });

  const activeSub = navItems.find((item) => {
    const href = base + item.sub;
    return item.exact
      ? pathname === href
      : pathname === href || pathname.startsWith(href + "/");
  })?.sub;

  useEffect(() => {
    const update = () => {
      const key = activeSub ?? "";
      const el = itemRefs.current.get(key);
      if (el) {
        setIndicator({ left: el.offsetLeft, width: el.offsetWidth });
      }
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [activeSub, pathname]);

  return (
    <nav className="overflow-x-auto">
      <div className="relative mx-auto flex w-max gap-1 px-4 pb-3">
        {navItems.map((item) => {
          const href = base + item.sub;
          const active = item.sub === activeSub;
          return (
            <Link
              key={item.sub}
              ref={(el) => {
                if (el) itemRefs.current.set(item.sub, el);
                else itemRefs.current.delete(item.sub);
              }}
              href={href}
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