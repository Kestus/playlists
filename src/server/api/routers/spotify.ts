import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import cookie from "cookie";
import {
  playlistItemsValidator,
  playlistValidator,
  trackValidator,
  zodURL,
} from "./zod/validators";
import type { zodArrayOfItems, zodTrack } from "./zod/validators";
import { savePlaylistAndTracks } from "prisma/methods/playlists";
import { saveAlbumAndTracks } from "prisma/methods/albums";
import { log } from "next-axiom";
import { prisma } from "~/server/db";
import { tryZodParse } from "~/utils/zod";

// import { promises as fs } from "fs";
// fs.writeFile("dataArray_.json", JSON.stringify(arrayOfTracks, null, 4))

const COOKIE_KEY = "spotify_access_token";

export const spotifyRouter = createTRPCRouter({
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

  savePlaylist: publicProcedure
    .input(
      z.object({
        url: zodURL,
        spotifyAccessToken: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      return savePlaylist(input.url, input.spotifyAccessToken);
    }),

  fetchPlaylistPreview: publicProcedure
    .input(
      z.object({
        url: zodURL,
        spotifyAccessToken: z.string(),
      })
    )
    .mutation(({ input }) => {
      return fetchPlaylistData(input.url, input.spotifyAccessToken);
    }),
});

export type SpotifyRouter = typeof spotifyRouter;

// Access token required to make spotify API request
export const fetchAccessToken = () => {
  const API_KEY = process.env.API_KEY_SPOTIFY;
  const API_SECRET = process.env.API_SECRET_SPOTIFY;
  if (!API_KEY || !API_SECRET) {
    log.error("[spotify][fetchAccessToken] Missing enviroment variables!");
    throw new TRPCError({
      code: "UNAUTHORIZED",
    });
  }

  // construct request options
  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: `grant_type=client_credentials&client_id=${API_KEY}&client_secret=${API_SECRET}`,
  };

  // Make request
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

// fetch and save playlist
const savePlaylist = async (url: zodURL, spotifyAccessToken: string) => {
  const { playlistData, tracksData } = await fetchPlaylistAndTracksData(
    url,
    spotifyAccessToken
  );

  log.info("Saving playlist...");
  const playlist =
    playlistData.type === "album"
      ? await saveAlbumAndTracks(playlistData, tracksData)
      : await savePlaylistAndTracks(playlistData, tracksData);
  return playlist.getId();
};

// fetch playlist data and tracks
const fetchPlaylistAndTracksData = async (
  url: zodURL,
  spotifyAccessToken: string
) => {
  const endPoint = getEndpoint(url);

  log.info(`Fetching playlist ${endPoint}...`);
  const playlistData = await fetchPlaylistData(url, spotifyAccessToken);
  const tracksData = await fetchTracksData(url, spotifyAccessToken);
  if (!playlistData) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

  return { playlistData, tracksData };
};

// fetch playlist data from spotify
export const fetchPlaylistData = async (
  url: zodURL,
  spotifyAccessToken: string
) => {
  const endPoint = getEndpoint(url);
  const options = {
    method: "GET",
    headers: {
      Authorization: `Bearer ${spotifyAccessToken}`,
    },
  };
  const fields = `?fields=total_tracks,release_date,type,genres,artists,id,images,name,tracks%28total%29`;
  const playlistInfoEndPoint = `${endPoint}${fields}`;

  // fetch data
  const response = await fetchSpotify(playlistInfoEndPoint, options);
  // parse response
  const playlistData = tryZodParse(response, playlistValidator);
  // check Playlist existence in DB
  playlistData.alreadyExists = await isAlreadyExists(playlistData.id);

  return playlistData;
};

// fetch only tracks from playlist
const fetchTracksData = async (url: zodURL, spotifyAccessToken: string) => {
  const endPoint = getEndpoint(url);
  const options = {
    method: "GET",
    headers: {
      Authorization: `Bearer ${spotifyAccessToken}`,
    },
  };

  let nextTracksEndpoint:
    | string
    | undefined
    | null = `${endPoint}/tracks?offset=0&limit=100`;

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

// create spotift API endpoint
const getEndpoint = (url: zodURL) => {
  const path = url.pathname.split("/");
  const type = path[1] as string;
  const playlistId = path[2] as string;
  return `https://api.spotify.com/v1/${type}s/${playlistId}`;
};

const isAlreadyExists = async (spotifyId: string) => {
  const entry = await prisma.playlists.findFirst({
    where: { spotifyId: spotifyId },
  });
  return entry?.id;
};
