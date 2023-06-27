import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { prisma } from "~/server/db";
import { Playlist } from "~/server/models/playlist";

export const prismaRouter = createTRPCRouter({
  getPlaylistBySpotifyId: publicProcedure
    .input(z.string())
    .query(async ({ input }) => {
      return await getPlaylistBySpotifyId(input);
    }),
});

export const getPlaylistBySpotifyId = async (spotifyId: string) => {
  const entry = await prisma.playlists.findUniqueOrThrow({
    where: { spotifyId: spotifyId },
  });
  return new Playlist(entry);
};
