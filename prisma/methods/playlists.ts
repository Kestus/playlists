import { zodPlaylist, zodTrack } from "~/server/api/routers/zod/validators";
import { prisma } from "~/server/db";
import { Track, batchSaveTrack } from "./tracks";
import { log } from "next-axiom";
import { Albums, Playlists } from "@prisma/client";
import { Artist } from "./artists";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

export class Playlist {
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

  connectOneOrManyTracks(tracks: Track | Track[]) {
    const isArray = Array.isArray(tracks);
    const toConnect = isArray
      ? tracks.map((track) => {
          return { id: track.data.id };
        })
      : [{ id: tracks.data.id }];

    const amount = isArray ? tracks.length : 1;
    log.info(
      `Connecting [${amount}] track(s) to playlist [ID: ${this.data.id}]`
    );

    prisma.playlists
      .update({
        where: { id: this.data.id },
        data: {
          Tracks: { connect: toConnect },
        },
      })
      .catch((err: PrismaClientKnownRequestError) => log.error(`Known prisma err: ${err}`));
  }

  disconnecttOneOrManyTracks(tracks: Track | Track[]) {
    const isArray = Array.isArray(tracks);
    const toDisconnect = isArray
      ? tracks.map((track) => {
          return { id: track.data.id };
        })
      : [{ id: tracks.data.id }];

    const amount = isArray ? tracks.length : 1;
    log.info(
      `Disconnecting [${amount}] track(s) from playlist [ID: ${this.data.id}]`
    );

    prisma.playlists
      .update({
        where: { id: this.data.id },
        data: {
          Tracks: { disconnect: toDisconnect },
        },
      })
      .catch((err: PrismaClientKnownRequestError) => log.error(`Known prisma err: ${err}`));
  }
}


export const savePlaylistAndTracks = async (
  playlistData: zodPlaylist,
  tracksData: zodTrack[]
) => {
  const playlist = await savePlaylist(playlistData);  
  const tracks = await batchSaveTrack(tracksData);

  // connect playlist to tracks
  playlist.connectOneOrManyTracks(tracks);
  return playlist;
};

const savePlaylist = async (playlistData: zodPlaylist) => {
  const playlistEntry = await prisma.playlists.upsert({
    where: { spotifyId: playlistData.id },
    create: {
      spotifyId: playlistData.id,
      name: playlistData.name,
      image: playlistData.images[0]?.url,
      expectedLength: playlistData.total_tracks?.valueOf(),
    },
    update: {},
  });
  log.info(`Saved new Playlist: ${playlistData.id}`)
  return new Playlist(playlistEntry);
}