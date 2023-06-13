import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import { setSpotifyAccessTokenHeader } from "~/utils/api";
import { type IncomingHttpHeaders } from "http";

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
  getAccessToken: publicProcedure.mutation(({ ctx }) => {
    return getAccessToken(ctx.req.headers);
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
  const apiKey = process.env.API_KEY_SPOTIFY;
  const apiSecret = process.env.API_SECRET_SPOTIFY;
  if (!apiKey || !apiSecret) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
    });
  }

  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: `grant_type=client_credentials&client_id=${apiKey}&client_secret=${apiSecret}`,
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

      const expires = Date.now() + 3600000;
      return { token, expires };
    });

  return res;
};

const getAccessToken = async (headers: IncomingHttpHeaders) => {
  const header = headers["spotify_access_token"] as string;
  if (header === "undefined") {
    const { token } = await getNewAccessToken();
    return token;
  }

  const [token, expires] = header.split(":");
  if (!token || !expires) {
    throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
  } else if (Date.now() > Number(expires)) { //check if token is expired
    return await getNewAccessToken();
  } else return token;
};

const getNewAccessToken = async () => {
  const newTokenData = await fetchAccessToken();
  setSpotifyAccessTokenHeader(newTokenData);
  return newTokenData;
};
