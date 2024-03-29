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
      return await getLatestPlaylists(input?.offset, input?.limit);
    }),

  getBySpotifyId: publicProcedure
    .input(z.object({ spotifyId: z.string() }))
    .query(({ input }) => {
      return prisma.playlists.findUniqueOrThrow({
        where: { spotifyId: input.spotifyId },
      });
    }),

  checkPlaylistExistsBySpotifyId: publicProcedure
    .input(z.object({ spotifyId: z.string() }))
    .mutation(async ({ input }) => {
      const entry = await prisma.playlists.findFirst({
        where: { spotifyId: input.spotifyId },
      });
      return entry ? true : false
    }),
});

export const getLatestPlaylists = async (offset?: number, limit?: number) => {
  offset = offset ? offset : 0;
  limit = limit ? limit : 30;

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
