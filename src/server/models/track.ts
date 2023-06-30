import { type Tracks } from "@prisma/client";
import { type dbEntry } from "./interface/dbEntry";

export class Track implements dbEntry {
  data: Tracks;

  constructor(dbEntry: Tracks) {
    this.data = dbEntry;
  }

  // getters
  getName(): string {
    return this.data.name;
  }
  getId() {
    return this.data.id;
  }
  getSpotifyId() {
    return this.data.spotifyId;
  }
  getImage() {
    //TODO
    return null;
  }
}


