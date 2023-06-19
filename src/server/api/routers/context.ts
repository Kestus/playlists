import { createTRPCRouter, publicProcedure } from "../trpc";

export const contextRouter = createTRPCRouter({
  getContext: publicProcedure.query(({ ctx }) => {
    return ctx;
  }),
});
