import { Tracks } from "@prisma/client";
import { zodArtist, zodTrack } from "~/server/api/routers/zod/validators";
import { prisma } from "~/server/db";
import { Track } from "~/server/models/track";
import { mapArtistConnectOrCreate } from "~/utils/prisma";

// TODO:
// save track
// if playlisttype is "album"
//    connect to album
// if playlisttype is "playlist"
//    for each track
//      create album if doesen't exists already
//      connect to album

export const batchSaveTrack = async (tracksData: zodTrack[]) => {
  const arrayOfPromises = new Array<Promise<Tracks>>();
  for (let track of tracksData) {
    arrayOfPromises.push(asyncSaveTrack(track));
  }

  const arrayOfTracks = new Array<Track>();
  // for (let promise of arrayOfPromises) {
  //   const trackClass = new Track(await promise)
  //   arrayOfTracks.push(trackClass)
  // }

  for (let i = arrayOfPromises.length; i > 0; i--) {
    const resolvedPromise = await Promise.race(arrayOfPromises);
    const trackClass = new Track(resolvedPromise);
    arrayOfTracks.push(trackClass);
  }
  return arrayOfTracks;
};

const asyncSaveTrack = async (track: zodTrack) => {
  const trackArtists = mapArtistConnectOrCreate(track.artists);
  const albumArtists = mapArtistConnectOrCreate(track.album.artists);

  const trackEntry = prisma.tracks.upsert({
    where: { spotifyId: track.id },
    create: {
      name: track.name,
      spotifyId: track.id,
      lengthSeconds: Math.floor(track.duration_ms / 1000),
      Album: {
        connectOrCreate: {
          where: { spotifyId: track.album.id },
          create: {
            name: track.album.name,
            spotifyId: track.album.id,
            image: track.album.images[0]?.url,
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
