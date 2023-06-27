import { type Playlists } from "@prisma/client";
import { prisma } from "../db";
import { type zodPlaylist } from "../api/routers/zod/validators";

export class Playlist {
  data: Playlists;

  constructor(dbEntry: Playlists) {
    this.data = dbEntry;
  }

  //TODO
}

//TODO: save response data to database
export const savePlaylistResponse = async (res: zodPlaylist) => {

  // TODO: get all the tracks from playlist
  // for each track
  // check db
  // if exists, add id to list of id's
  // else...
  // create dbEntry and add id to list of id's
  // ^^ same for artists

  const newEntry = await prisma.playlists.upsert({
    where: { spotifyId: res.id },
    create: {
      name: res.name,
      spotifyId: res.id,
      type: res.type,
      image: res.images[0]?.url
    }, 
    update: {
      image: res.images[0]?.url,
      // TODO: update tracks
    }
  },);


  return new Playlist(newEntry);
};

export const dbEntryToPlaylist = (dbEntry: Playlists) => {
  return new Playlist(dbEntry);
};
