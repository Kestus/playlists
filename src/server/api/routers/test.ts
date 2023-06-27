import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const testRouter = createTRPCRouter({
  fun: publicProcedure.query(async ({ ctx }) => {
    return await ctx.prisma.playlists.findUniqueOrThrow({where: {spotifyId: "123142"}});
  }),
});
