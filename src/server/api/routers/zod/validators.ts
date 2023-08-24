import { z } from "zod";

const zodImage = z.object({
  url: z.string(),
  height: z.number().nullable(),
  width: z.number().nullable(),
});

export const zodArtist = z.object({
  id: z.string(),
  images: z.array(zodImage).optional(),
  name: z.string(),
});

export const zodAlbum = z.object({
  total_tracks: z.number().nullish(),
  id: z.string(),
  images: z.array(zodImage),
  name: z.string(),
  release_date: z.string().nullable(),
  type: z.string(),
  genres: z.array(z.string()).optional(),
  artists: z.array(zodArtist),
});

export const zodTrack = z.object({
  album: zodAlbum,
  artists: z.array(zodArtist),
  id: z.string(),
  name: z.string(),
  type: z.string(),
  duration_ms: z.number(),
});

export const zodPlaylist = z.object({
  total_tracks: z.number().optional(),
  id: z.string(),
  images: z.array(zodImage),
  name: z.string(),
  release_date: z.string().nullish(),
  type: z.enum(["playlist", "album"]),
  genres: z.array(z.string()).nullish(),
  artists: z.array(zodArtist).nullish(),
  alreadyExists: z.string().optional(),
});

export const zodPlaylistItems = z.object({
  limit: z.number(),
  next: z.string().nullish(),
  offset: z.number(),
  previous: z.string().nullish(),
  total: z.number(),
  items: z.array(z.object({ track: z.any() })),
});

const zodArrayOfItems = z.array(z.object({ track: z.any() }));

// const zodURLSearchParams = z.object({
//   append: z.function(),
//   delete: z.function(),
//   entries: z.function(),
//   get: z.function(),
//   getAll: z.function(),
//   has: z.function(),
//   keys: z.function(),
//   set: z.function(),
//   sort: z.function(),
//   toString: z.function(),
// });

export const zodURL = z.object({
  href: z.string(),
  origin: z.string(),
  protocol: z.string(),
  username: z.string(),
  password: z.string(),
  host: z.string(),
  hostname: z.string(),
  port: z.string(),
  pathname: z.string(),
  search: z.string(),
  hash: z.string(),
  // searchParams: zodURLSearchParams,
});

export type zodPlaylist = z.infer<typeof zodPlaylist>;
export type zodPlaylistItems = z.infer<typeof zodPlaylistItems>;
export type zodTrack = z.infer<typeof zodTrack>;
export type zodURL = z.infer<typeof zodURL>;
export type zodArrayOfItems = z.infer<typeof zodArrayOfItems>;
export type zodArtist = z.infer<typeof zodArtist>;
