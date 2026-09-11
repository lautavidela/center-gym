import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { logout } from "@/app/login/actions";

const navItems = [
  { href: "/admin", label: "Inicio", icon: "▦" },
  { href: "/admin/clientes", label: "Clientes", icon: "👥" },
  { href: "/admin/asistencias", label: "Asistencias", icon: "✓" },
  { href: "/admin/vencimientos", label: "Vencimientos", icon: "⏰" },
  { href: "/admin/planes", label: "Planes", icon: "🏋" },
  { href: "/admin/migracion", label: "Migración", icon: "⇅" },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();

  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-56 shrink-0 flex-col border-r border-zinc-200 bg-white ps-0 md:flex">
        <div className="border-b border-zinc-100 px-5 py-4">
          <p className="text-lg font-black text-red-600">CENTER GYM</p>
          <p className="text-xs text-zinc-500">Panel del dueño</p>
        </div>
        <nav className="flex flex-1 flex-col gap-1 p-3">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100"
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>
        <form action={logout} className="p-3">
          <button
            type="submit"
            className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm font-medium text-zinc-600 transition hover:bg-zinc-100"
          >
            Cerrar sesión
          </button>
        </form>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-10 border-b border-zinc-200 bg-white">
          <div className="flex items-center justify-between px-4 py-3 md:hidden">
            <p className="text-lg font-black text-red-600">CENTER GYM</p>
            <form action={logout}>
              <button
                type="submit"
                className="rounded-lg border border-zinc-200 px-3 py-1.5 text-sm text-zinc-600"
              >
                Salir
              </button>
            </form>
          </div>
          <nav className="flex gap-1 overflow-x-auto px-3 pb-2 pt-1 md:hidden">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="whitespace-nowrap rounded-full bg-zinc-100 px-4 py-1.5 text-sm font-medium text-zinc-700"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </header>

        <main className="flex-1 p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}