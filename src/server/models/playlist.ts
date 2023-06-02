import { type Playlists } from "@prisma/client";

export class Playlist {
  id: string;
  name: string;

  constructor(id: string, name: string) {
    this.id = id;
    this.name = name;
  }
}

export function playlistDataToClass(data: Playlists) {
  return new Playlist(data.id, data.name);
}
