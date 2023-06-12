import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const testRouter = createTRPCRouter({
  fun: publicProcedure.query(({ ctx }) => {
    return ctx.prisma.tracks.findFirst();
  }),
});
