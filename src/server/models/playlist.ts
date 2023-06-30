import { Albums, type Playlists } from "@prisma/client";
import { prisma } from "../db";
import { type zodPlaylist } from "../api/routers/zod/validators";
import { type dbEntry } from "./interface/dbEntry";
import { Track } from "./track";
import { type Artist } from "./artist";

export class Playlist implements dbEntry {
  data: Playlists | Albums;
  tracks: Array<Track>;
  artists: Array<Artist>;
  type: "playlist" | "album";

  constructor(dbEntry: Playlists | Albums) {
    this.data = dbEntry;
    this.tracks = new Array<Track>();
    this.artists = new Array<Artist>();
    this.type = dbEntry.type;
  }

  // getters
  getName() {
    return this.data.name;
  }
  getId() {
    return this.data.id;
  }
  getSpotifyId() {
    return this.data.spotifyId;
  }
  getImage() {
    return this.data.image;
  }

  
  async getTracks() {
    if (this.tracks.length > 0) {
      return this.tracks;
    }

    const dbTracks = await prisma.playlists
      .findUnique({ where: { id: this.data.id } })
      .Tracks();

    if (!dbTracks) return;
    for (const entry of dbTracks) {
      this.tracks.push(new Track(entry));
    }
    return this.tracks;
  }

  addTrack(track: Track) {
    prisma.playlists.update({
      where: { id: this.data.id },
      data: {
        Tracks: { set: { id: track.data.id } },
      },
    }).catch(err => {
      // TODO:
      console.log(err)
    })
  }
  removeTrack(track: Track) {
    prisma.playlists.update({
      where: { id: this.data.id },
      data: {
        Tracks: { delete: { id: track.data.id } },
      },
    }).catch(err => {
      // TODO:
      console.log(err)
    })
  }

  addManyTracks(arrayOfTracks: Array<Track>) {
    const arrayOfIds = arrayOfTracks.map((track) => {
      return { id: track.data.id };
    });

    prisma.playlists.update({
      where: { id: this.data.id },
      data: {
        Tracks: { set: arrayOfIds },
      },
    }).catch(err => {
      // TODO:
      console.log(err)
    })
  }
  removeManyTracks(arrayOfTracks: Array<Track>) {
    const arrayOfIds = arrayOfTracks.map((track) => {
      return { id: track.data.id };
    });

    prisma.playlists.update({
      where: { id: this.data.id },
      data: {
        Tracks: { delete: arrayOfIds },
      },
    }).catch(err => {
      // TODO:
      console.log(err)
    })
  }
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
      image: res.images[0]?.url,
    },
    update: {
      image: res.images[0]?.url,
      // TODO: update tracks
    },
  });

  return new Playlist(newEntry);
};

export const dbEntryToPlaylist = (dbEntry: Playlists) => {
  return new Playlist(dbEntry);
};
