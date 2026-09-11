import type { Prisma } from "@prisma/client";

export const activeMembershipInclude = {
  memberships: {
    where: { isActive: true },
    orderBy: { endDate: "desc" },
    take: 1,
    include: { plan: true },
  },
} satisfies Prisma.ClientInclude;

export type ClientWithMembership = Prisma.ClientGetPayload<{
  include: typeof activeMembershipInclude;
}>;