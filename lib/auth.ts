import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getIronSession, type IronSession } from "iron-session";
import { prisma } from "@/lib/prisma";

export interface SessionData {
  userId?: number;
  email?: string;
}

export const sessionOptions = {
  cookieName: "cg_session",
  password: process.env.SESSION_SECRET!,
  cookieOptions: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
  },
};

export async function getSession(): Promise<IronSession<SessionData>> {
  const cookieStore = await cookies();
  return getIronSession<SessionData>(cookieStore, sessionOptions);
}

export async function getCurrentUser() {
  const session = await getSession();
  const userId = session.userId;
  if (!userId) return null;
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { gym: true },
  });
  return user ? { session, user } : null;
}

export async function requireAdmin() {
  const auth = await getCurrentUser();
  if (!auth) redirect("/login");
  return auth;
}

export async function requireGymAdmin() {
  const auth = await requireAdmin();
  const gym = auth.user.gym;
  if (!gym) redirect("/admin");
  return { session: auth.session, user: auth.user, gym, gymId: gym.id };
}