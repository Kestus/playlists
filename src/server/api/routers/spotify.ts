import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import cookie from "cookie";
import {
  playlistItemsValidator,
  playlistValidator,
  trackValidator,
} from "./zod/validators";
import type { zodPlaylist, zodArrayOfItems, zodTrack } from "./zod/validators";
import { savePlaylistAndTracks } from "prisma/spotifyMethods/prismaPlaylists";
import { saveAlbumAndTracks } from "prisma/spotifyMethods/prismaAlbums";
import { log } from "next-axiom";

// import { promises as fs } from "fs";
// fs.writeFile("dataArray_.json", JSON.stringify(arrayOfTracks, null, 4))

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
  fetchPlaylist: publicProcedure
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
  const { type, playlistId } = splitUrl(url);
  log.info(`Fetching playlist ${playlistId}...`);

  const endPoint = `https://api.spotify.com/v1/${type}s/${playlistId}`;
  const options = {
    method: "GET",
    headers: {
      Authorization: `Bearer ${spotifyAccessToken}`,
    },
  };

  const fields = `?fields=total_tracks,release_date,type,genres,artists,id,images,name,tracks%28total%29`;
  const playlistInfoEndPoint = `${endPoint}${fields}`;
  const response = await fetchSpotify(playlistInfoEndPoint, options);

  let playlistData: zodPlaylist;
  try {
    playlistData = playlistValidator.parse(response);
  } catch (err) {
    if (err instanceof z.ZodError) {
      log.error(`${JSON.stringify(err.issues, null, 4)}`);
    }
    throw new TRPCError({ code: "PARSE_ERROR" });
  }
  const tracksData = await fetchTracks(endPoint, options);

  if (!playlistData) return;
  log.info("Saving playlist...");
  const playlist =
    playlistData.type === "album"
      ? saveAlbumAndTracks(playlistData, tracksData)
      : savePlaylistAndTracks(playlistData, tracksData);

  return playlist;
};

const fetchTracks = async (apiEndpoint: string, options: object) => {
  let nextTracksEndpoint:
    | string
    | undefined
    | null = `${apiEndpoint}/tracks?offset=0&limit=100`;

  const arrayOfTracks = new Array<zodTrack>();
  while (typeof nextTracksEndpoint === "string") {
    const response = await fetchSpotify(nextTracksEndpoint, options);
    const parsedRes = playlistItemsValidator.parse(response);

    nextTracksEndpoint = parsedRes.next;
    const newTracks = parseAndFilterTracks(parsedRes.items);

    arrayOfTracks.push(...newTracks);
  }

  return arrayOfTracks;
};

const parseAndFilterTracks = (items: zodArrayOfItems) => {
  const arrayOfTracks = new Array<zodTrack>();
  for (let i = 0; i < items.length; i++) {
    const track = trackValidator.safeParse(items[i]?.track);
    if (track.success) {
      arrayOfTracks.push(track.data);
    }
  }
  return arrayOfTracks;
};

const fetchAccessToken = () => {
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

const fetchSpotify = async (apiEndpoint: string, options: object) => {
  options;
  const res = await fetch(apiEndpoint, options).then((response) => {
    if (!response.ok) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: response.statusText,
      });
    }
    return response.json() as object;
  });

  return res;
};

const splitUrl = (url: string) => {
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
  return { type, playlistId };
};
