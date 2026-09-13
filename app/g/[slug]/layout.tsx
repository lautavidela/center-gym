import { notFound } from "next/navigation";
import { getGymBySlug } from "@/lib/gyms";

export default async function GymLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const gym = await getGymBySlug(slug);
  if (!gym) notFound();
  return <>{children}</>;
}