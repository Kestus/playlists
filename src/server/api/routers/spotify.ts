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
import { prisma } from "~/server/db";

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

  // -----------
  savePlaylist: publicProcedure
    .input(
      z.object({
        url: z.string() ,
        spotifyAccessToken: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const url = new URL(input.url);
        return savePlaylist(url, input.spotifyAccessToken);
      } catch (e) {
        log.error(`URL construct error`);
        throw new TRPCError({ code: "BAD_REQUEST", message: "Bad URL" });
      }
    }),

  // -----------
  fetchPlaylistPreview: publicProcedure
    .input(
      z.object({
        url: z.string(),
        spotifyAccessToken: z.string(),
      })
    )
    .mutation(({ input }) => {
      try {
        const url = new URL(input.url);
        return fetchPlaylistData(url, input.spotifyAccessToken);
      } catch (e) {
        log.error(`URL construct error`);
        throw new TRPCError({ code: "BAD_REQUEST", message: "Bad URL" });
      }
    }),

  // -----------
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
const savePlaylist = async (url: URL, spotifyAccessToken: string) => {
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
  url: URL,
  spotifyAccessToken: string
) => {
  const endPoint = getEndpoint(url);

  log.info(`Fetching playlist ${endPoint}...`);
  const { playlistData } = await fetchPlaylistData(url, spotifyAccessToken);
  const tracksData = await fetchTracksData(url, spotifyAccessToken);
  if (!playlistData) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

  return { playlistData, tracksData };
};

// fetch playlist data from spotify
export const fetchPlaylistData = async (
  url: URL,
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

  // check Playlist existence in DataBase
  const alreadyExists = await checkPlaylistAlreadySaved(playlistData.id);

  return { playlistData, alreadyExists };
};

// fetch only tracks from playlist
const fetchTracksData = async (url: URL, spotifyAccessToken: string) => {
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
const getEndpoint = (url: URL) => {
  if (!spotifyURLIsValid(url)) {
    throw new TRPCError({ code: "BAD_REQUEST", message: "Invalid URL" });
  }

  const path = url.pathname.split("/");
  const type = path[1] as string;
  const playlistId = path[2] as string;
  return `https://api.spotify.com/v1/${type}s/${playlistId}`;
};

// check spotify url
// example: https://open.spotify.com/playlist/30zZTU35EaRXm0iOZm9rN7
export const spotifyURLIsValid = (url: URL): string | undefined => {
  if (!url.hostname.includes("spotify.com")) {
    return;
  }
  const path = url.pathname.split("/");
  if (path.length < 2 || !urlPathIsValid(path)) {
    return;
  }
  return url.toString();
};

const urlPathIsValid = (path: Array<string>) => {
  return path.includes("playlist") || path.includes("album");
};

const checkPlaylistAlreadySaved = async (spotifyId: string) => {
  const entry = await prisma.playlists.findFirst({
    where: { spotifyId: spotifyId },
  });
  return entry?.id;
};
