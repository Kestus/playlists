import { Tracks } from "@prisma/client";
import { log } from "next-axiom";
import { zodArtist, zodTrack } from "~/server/api/routers/zod/validators";
import { prisma } from "~/server/db";
import { mapArtistConnectOrCreate } from "~/utils/prisma";

export class Track {
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
    return null;
  }
}


export const batchSaveTrack = async (tracksData: zodTrack[]) => {
  log.info(`Saving [${tracksData.length}] tracks...`);

  // Create new array of Promise<Tracks> (db entries)
  // save tracks to db and add entry to array
  const arrayOfPromises = new Array<Promise<Tracks>>();
  for (let i = 0; i < tracksData.length; i++) {
    const track = tracksData[i];
    if (!track) break;
    arrayOfPromises.push(asyncSaveTrack(track));
  }

  const arrayOfTracksData = await Promise.all(arrayOfPromises);
  const arrayOfTracks = arrayOfTracksData.map((data) => new Track(data)) 

  log.info(JSON.stringify(arrayOfTracks.map((track) => track.data.name), null, 4));

  return arrayOfTracks;
};

const asyncSaveTrack = async (trackData: zodTrack) => {
  const trackArtists = mapArtistConnectOrCreate(trackData.artists);
  const albumArtists = mapArtistConnectOrCreate(trackData.album.artists);

  const trackEntry = prisma.tracks.upsert({
    where: { spotifyId: trackData.id },
    create: {
      name: trackData.name,
      spotifyId: trackData.id,
      lengthSeconds: Math.floor(trackData.duration_ms / 1000),
      Album: {
        connectOrCreate: {
          where: { spotifyId: trackData.album.id },
          create: {
            name: trackData.album.name,
            spotifyId: trackData.album.id,
            image: trackData.album.images[0]?.url,
            Artists: { connectOrCreate: albumArtists },
          },
        },
      },
      Artists: { connectOrCreate: trackArtists },
    },
    update: {},
  });

  return trackEntry;
};

export const saveTrack = async (track: zodTrack) => {
  return new Track(await asyncSaveTrack(track));
};

