import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import cookie from "cookie";
import { playlistValidator } from "./zod/validators";
import { savePlaylistResponse } from "~/server/models/playlist";

const COOKIE_KEY = "spotify_access_token";

// TODO:
// getPlaylist
// check database by playlist id
// if exists
//    return class
// else...
// fetch playlist (100 tracks limit)
//  fetch additional tracks if needed
// save result to database
// create class
// return class

export const spotifyRouter = createTRPCRouter({
  getPlaylist: publicProcedure
    .input(
      z.object({
        url: z.string(),
        spotifyAccessToken: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      return await fetchPlaylist(input.url, input.spotifyAccessToken);
    }),

  getAccessToken: publicProcedure.query(async ({ ctx }) => {
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


const fetchPlaylist = async (url: string, spotifyAccessToken: string) => {
  const splitUrl = url.split("/");
  const length = splitUrl.length;
  const indexOfId = length - 1;
  const indexOfType = length - 2;
  const type = splitUrl[indexOfType];
  const playlistId = splitUrl[indexOfId];
  if (!type || !playlistId) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Wrong URL",
    });
  }

  const endPoint = `https://api.spotify.com/v1/${type}s/${playlistId}`;
  const options = {
    method: "GET",
    headers: {
      Authorization: `Bearer ${spotifyAccessToken}`,
    },
  };

  const response = await fetchSpotify(endPoint, options);  
  const resPlaylist = playlistValidator.parse(response)
  const playlist = await savePlaylistResponse(resPlaylist)

  return playlist;
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

const fetchSpotify = async (
  apiEndpoint: string,
  options: object,
  // offset: number = 0
) => {
  const res = await fetch(apiEndpoint, options)
    .then((response) => {
      if (!response.ok) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: response.statusText,
        });
      }
      return response.json() as object;
    })

  return res;
};
