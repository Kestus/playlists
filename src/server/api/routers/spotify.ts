import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import cookie from "cookie";


const COOKIE_KEY = "spotify_access_token";

export const spotifyRouter = createTRPCRouter({
  getPlaylist: publicProcedure
    .input(
      z.object({
        spotifyPlaylistId: z.string(),
        spotifyAccessToken: z.string(),
      })
    )
    .query(async ({ input }) => {
      return fetchPlaylist(input.spotifyPlaylistId, input.spotifyAccessToken);
    }),
  getAccessToken: publicProcedure.mutation(async ({ ctx }) => {
    const browserCookie = ctx.req.cookies[COOKIE_KEY];
    if (browserCookie) return browserCookie;

    const newToken = await fetchAccessToken();
    ctx.res.setHeader(
      "Set-Cookie",
      cookie.serialize(COOKIE_KEY, newToken, {
        maxAge: 60 * 59, // 59 minutes
        sameSite: "strict",
        path: "/",
        httpOnly: true,
      })
    );
    return newToken;
  }),
});

export type SpotifyRouter = typeof spotifyRouter;

const fetchPlaylist = async (
  spotifyPlaylistId: string,
  spotifyAccessToken: string
) => {
  const res = await fetch(`${spotifyPlaylistId}, ${spotifyAccessToken}`);
  console.log(res);
  return "yep";
};

export const fetchAccessToken = () => {
  const API_KEY = process.env.API_KEY_SPOTIFY;
  const API_SECRET = process.env.API_SECRET_SPOTIFY;
  if (!API_KEY || !API_SECRET) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
    });
  }

  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: `grant_type=client_credentials&client_id=${API_KEY}&client_secret=${API_SECRET}`,
  };

  const res = fetch("https://accounts.spotify.com/api/token", options)
    .then((response) => {
      if (!response.ok) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: response.statusText,
        });
      }
      return response.json();
    })
    .then(({ access_token }) => {
      const token: string | undefined =
        typeof access_token === "string" ? access_token : undefined;
      if (token === undefined) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
      return token;
    });

  return res;
};
