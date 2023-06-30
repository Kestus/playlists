import { type Artists } from "@prisma/client";
import { type dbEntry } from "./interface/dbEntry";

export class Artist implements dbEntry {
  data: Artists;

  constructor(dbEntry: Artists) {
    this.data = dbEntry;
  }

  // getters
  getId() {
    return this.data.id;
  }
  getName() {
    return this.data.name
  }
  getSpotifyId() {
    return this.data.spotifyId
  }
  getImage() {
    return this.data.image
  }

  //TODO
}
