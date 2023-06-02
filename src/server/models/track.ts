import { type Tracks } from "@prisma/client";
import { type Artist, artistDataToClass } from "./artist";
import { type Playlist } from "./playlist";
import { prisma } from "~/server/db";

export class Track {
  id: string;
  name: string;
  lenghtSeconds: number;
  idSpotify?: string;
  playlists: Playlist[] = new Array<Playlist>;
  artists: Artist[] = new Array<Artist>;

  constructor(
    id: string,
    name: string,
    lenghtSeconds: number,
    idSpotify?: string
  ) {
    this.id = id;
    this.name = name;
    this.lenghtSeconds = lenghtSeconds;
    this.idSpotify = idSpotify;
  }

  getName(): string {
    return this.name;
  }

  getArtists(): Artist[] | null {
    return this.artists ?? this.fetchArtists();
  }

  async fetchArtists(): Promise<Artist[] | null> {
    const res = await prisma.tracks.findUnique({
      where: { id: this.id },
      include: { artists: true },
    });
    if (res == null) {
      return null;
    }

    res.artists.forEach((item) => {
      const artist = artistDataToClass(item);
      this.addArtist(artist);
    });

    return this.artists;
  }

  addArtist(artist: Artist) {
    this.artists.push(artist);
  }
}

export function trackDataToClass(data: Tracks): Track {
  return new Track(data.id, data.name, data.lengthSeconds);
}
