import { requireAdmin } from "@/lib/auth";
import { logout } from "@/app/login/actions";
import AdminNav from "@/components/admin-nav";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50">
      <header className="sticky top-0 z-10 border-b border-zinc-200 bg-white">
        <div className="flex items-center justify-between px-4 py-3">
          <p className="text-xl font-black tracking-tight">
            <span className="text-emerald-600">MT</span>Gym
          </p>
          <form action={logout}>
            <button
              type="submit"
              className="rounded-lg border border-zinc-200 px-3 py-1.5 text-sm font-medium text-zinc-600 transition hover:bg-zinc-100"
            >
              Salir
            </button>
          </form>
        </div>
        <AdminNav />
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 p-4 md:p-8">
        {children}
      </main>
    </div>
  );
}