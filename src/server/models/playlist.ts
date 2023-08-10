import type { Albums, Playlists } from "@prisma/client";
import { prisma } from "../db";
import { type dbEntry } from "./interface/dbEntry";
import { Track } from "./track";
import { type Artist } from "./artist";
import { logPrismaKnownError } from "~/utils/logging";
import { log } from "next-axiom";
import type { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

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
      .catch((err: PrismaClientKnownRequestError) => logPrismaKnownError(err));
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
      .catch((err: PrismaClientKnownRequestError) => logPrismaKnownError(err));
  }
}
