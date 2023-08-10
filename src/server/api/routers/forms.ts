import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { log } from "next-axiom";
import { spotifyURLIsValid } from "./spotify";

export const formsRouter = createTRPCRouter({
  spotifyUrlHandler: publicProcedure
    .input(z.object({ url: z.string() }))
    .mutation(({ input }) => {
      try {
        const url = new URL(input.url);
        return spotifyURLIsValid(url);
      } catch (e) {
        log.error(`URL construct error`)
        return false
      }
    }),
});

