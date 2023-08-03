import { createTRPCRouter } from "~/server/api/trpc";
import { testRouter } from "./routers/test";
import { profileRouter } from "./routers/profile";
import { spotifyRouter } from "./routers/spotify";
import { contextRouter } from "./routers/context";
import { playlistsRouter } from "./routers/prisma/playlists";
import { formsRouter } from "./routers/forms";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  forms: formsRouter,
  prismaPlaylists: playlistsRouter,
  test: testRouter,
  profile: profileRouter,
  spotify: spotifyRouter,
  context: contextRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
