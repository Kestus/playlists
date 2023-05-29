import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const tracksRouter = createTRPCRouter({
  getFirst: publicProcedure.query(({ ctx }) => {
    return ctx.prisma.tracks.findFirst();    
  })
})
