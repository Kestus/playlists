import { type Playlists } from "@prisma/client";
import { prisma } from "../db";
import { type zodPlaylist } from "../api/routers/zod/validators";



export class Playlist {
  data: Playlists

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


  const newEntry = await prisma.playlists.create({
    data: {
      name: res.name,
      spotifyId: res.id,
      type: res.type,
      image: res.images[0]?.url,

      // Artists: artists,
      // Tracks: tracks
    }
  })

  return new Playlist(newEntry)
}