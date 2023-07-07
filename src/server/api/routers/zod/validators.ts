import { z } from "zod";

const zodImage = z.object({
  url: z.string(),
  height: z.number().nullable(),
  width: z.number().nullable(),
});

const zodArtist = z.object({
  id: z.string(),
  images: z.array(zodImage).optional(),
  name: z.string(),
});

const zodAlbum = z.object({
  total_tracks: z.number().nullish(),
  id: z.string(),
  images: z.array(zodImage),
  name: z.string(),
  release_date: z.string().nullable(),
  type: z.string(),
  genres: z.array(z.string()).optional(),
  artists: z.array(zodArtist),
});

const zodTrack = z.object({
  album: zodAlbum,
  artists: z.array(zodArtist),
  id: z.string(),
  name: z.string(),
  type: z.string(),
  duration_ms: z.number(),
});

const zodPlaylist = z.object({
  total_tracks: z.number().optional(),
  id: z.string(),
  images: z.array(zodImage),
  name: z.string(),
  release_date: z.string().nullish(),
  type: z.enum(["playlist", "album"]),
  genres: z.array(z.string()).nullish(),
  artists: z.array(zodArtist).nullish(),
});

const zodPlaylistItems = z.object({
  limit: z.number(),
  next: z.string().nullish(),
  offset: z.number(),
  previous: z.string().nullish(),
  total: z.number(),
  items: z.array(z.object({ track: z.any() })),
});

const zodArrayOfItems = z.array(z.object({ track: z.any() }));

export { zodPlaylist as playlistValidator };
export type zodPlaylist = z.infer<typeof zodPlaylist>;
export { zodPlaylistItems as playlistItemsValidator };
export type zodPlaylistItems = z.infer<typeof zodPlaylistItems>;
export { zodTrack as trackValidator };
export type zodTrack = z.infer<typeof zodTrack>;

export type zodArrayOfItems = z.infer<typeof zodArrayOfItems>;
export type zodArtist = z.infer<typeof zodArtist>;
