import { TrackSchema } from "@prisma/client";

export class Track {
  name: string;
  author: string;
  lenghtSeconds: number;
  idSpotify?: string;
  playlists?: string[];

  constructor(
    name: string,
    author: string,
    lenghtSeconds: number,
    playlists?: string,
    idSpotify?: string
  ) {
    this.name = name;
    this.author = author;
    this.lenghtSeconds = lenghtSeconds;
    this.idSpotify = idSpotify;
    // this.playlists = playlists;
  }

  getName(): string | undefined {
    return this.name;
  }

  makeClass(dbData: object) {}
}

// export function trackDataToClass(TrackData: TrackSchema): Track {
//   return new Track(
//     TrackData.name,
//     TrackData.author,
//     TrackData.lengthSeconds,
//     TrackData
//   );
// }
