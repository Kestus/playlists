import { createTRPCRouter } from "~/server/api/trpc";
import { tracksRouter } from "./routers/tracks";
import { testRouter } from "./routers/test";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  tracks: tracksRouter,
  test: testRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
