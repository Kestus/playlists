import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { log } from "next-axiom";
import { spotifyURLIsValid } from "./spotify";
import { TRPCError } from "@trpc/server";

export const formsRouter = createTRPCRouter({
  spotifyUrlHandler: publicProcedure
    .input(z.object({ url: z.string() }))
    .mutation(({ input }) => {
      try {
        const url = new URL(input.url);
        return spotifyURLIsValid(url);
      } catch (e) {
        log.error(`URL construct error`)
        throw new TRPCError({code: "PARSE_ERROR"})
      }
    }),
});