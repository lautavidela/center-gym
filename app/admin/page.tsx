import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";

export default async function AdminIndexPage() {
  const { user } = await requireAdmin();
  if (user.isSuperAdmin) redirect("/admin/gyms");
  if (!user.gym) redirect("/login");
  redirect(`/g/${user.gym.slug}/admin`);
}