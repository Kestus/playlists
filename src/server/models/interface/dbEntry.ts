import type { Artists, Playlists, Tracks } from "@prisma/client";

export interface dbEntry {
  data: Playlists | Tracks | Artists;

  // GETTERS
  getId: () => string;
  getName: () => string;
  getSpotifyId: () => string | null;
  getImage: () => string | null;

  
}
