import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { prisma } from "~/server/db";

export const playlistsRouter = createTRPCRouter({
  getLatest: publicProcedure
    .input(
      z
        .object({
          offset: z.number().optional(),
          limit: z.number().optional(),
        })
        .optional()
    )
    .query(async ({ input }) => {
      const offset = input?.offset ? input.offset : 0;
      const limit = input?.limit ? input.limit : 30;
      const playlists = await getLatestPlaylists(offset, limit);
      return playlists;
    }),
});

const getLatestPlaylists = async (offset: number, limit: number) => {
  const entries = await prisma.playlists.findMany({
    orderBy: {
      createdAt: "desc",
    },
    include: {
      _count: {
        select: { Tracks: true },
      },
    },
    skip: offset,
    take: limit,
  });
  if (!entries) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "No playlists found",
    });
  }
  return entries;
};
