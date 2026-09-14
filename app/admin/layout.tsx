import Link from "next/link";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { logout } from "@/app/login/actions";
import Brand from "@/components/brand";

export default async function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = await requireAdmin();

  if (!user.isSuperAdmin) {
    if (!user.gym) redirect("/login");
    redirect(`/g/${user.gym.slug}/admin`);
  }

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50">
      <header className="sticky top-0 z-10 border-b border-zinc-200 bg-white">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <Brand />
            <p className="text-xl font-black tracking-tight">
              <span className="text-emerald-600">MT</span>Gym
              <span className="ml-2 rounded-full bg-zinc-100 px-2 py-0.5 align-middle text-xs font-bold text-zinc-600">
                superadmin
              </span>
            </p>
          </div>
          <form action={logout}>
            <button
              type="submit"
              className="rounded-lg border border-zinc-200 px-3 py-1.5 text-sm font-medium text-zinc-600 transition hover:bg-zinc-100"
            >
              Salir
            </button>
          </form>
        </div>
        <nav className="mx-auto w-full max-w-6xl px-4 pb-3">
          <div className="flex gap-1">
            <Link
              href="/admin/gyms"
              className="rounded-md px-3 py-1.5 text-sm font-medium text-emerald-700"
            >
              Gyms
            </Link>
            {user.gym && (
              <Link
                href={`/g/${user.gym.slug}/admin`}
                className="rounded-md px-3 py-1.5 text-sm font-medium text-zinc-600 hover:bg-zinc-100"
              >
                Mi panel ({user.gym.name})
              </Link>
            )}
          </div>
        </nav>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 p-4 md:p-8">
        {children}
      </main>
    </div>
  );
}