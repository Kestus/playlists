import { z } from "zod";

const zodImage = z.object({
  url: z.string(),
  height: z.number(),
  width: z.number(),
});

const zodArtist = z.object({
  id: z.string(),
  images: z.array(zodImage),
  name: z.string(),
});

const zodAlbum = z.object({
  total_tracks: z.number(),
  id: z.string(),
  images: z.array(zodImage),
  name: z.string(),
  release_date: z.string(),
  type: z.string(),
  genres: z.array(z.string()),
  artists: z.array(zodArtist),
})

const zodTrack = z.object({
  album: zodAlbum,
  artists: z.array(zodArtist),
  id: z.string(),
  name: z.string(),
  type: z.string(),
});

export const zodPlaylist = z.object({
  total_tracks: z.number(),
  id: z.string(),
  images: z.array(zodImage),
  name: z.string(),
  release_date: z.string(),
  type: z.string(),
  genres: z.array(z.string()),
  artists: z.array(zodArtist),
  tracks: z.object({
    next: z.string(),
    offset: z.number(),
    previous: z.string(),
    total: z.number(),
    items: z.array(zodTrack),
  }),
});

export {zodPlaylist as playlistValidator}
export type zodPlaylist = z.infer<typeof zodPlaylist>