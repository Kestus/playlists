import { Artists } from "@prisma/client";
import { zodArtist } from "~/server/api/routers/zod/validators"


export class Artist {
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

export const batchSaveArtist = (artists: zodArtist[]) => {

}

const saveArtist = (artistData: zodArtist) => {

}