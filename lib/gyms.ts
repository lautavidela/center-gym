import { cache } from "react";
import { prisma } from "@/lib/prisma";

export const DEFAULT_GYM_SLUG = process.env.DEFAULT_GYM_SLUG ?? "center-gym";

export const getGymBySlug = cache(async (slug: string) => {
  if (!slug) return null;
  return prisma.gym.findUnique({ where: { slug } });
});

export function adminPath(slug: string, sub = ""): string {
  return `/g/${slug}/admin${sub}`;
}