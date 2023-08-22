import { zodPlaylist, zodTrack } from "~/server/api/routers/zod/validators";
import { prisma } from "~/server/db";
import { batchSaveTrack } from "./tracks";
import { mapArtistConnectOrCreate } from "~/utils/prisma";
import { log } from "next-axiom";
import { Playlist } from "./playlists";

export const saveAlbumAndTracks = async (
  albumData: zodPlaylist,
  tracksData: zodTrack[]
) => {
  const playlist = await saveAlbum(albumData);
  const tracks = await batchSaveTrack(tracksData);
  // connect playlist to tracks
  playlist.connectOneOrManyTracks(tracks);

  return playlist;
};

export const saveAlbum = async (albumData: zodPlaylist) => {
  const albumArtists = albumData.artists
    ? mapArtistConnectOrCreate(albumData.artists)
    : [];
  const playlistEntry = await prisma.albums.upsert({
    where: { spotifyId: albumData.id },
    create: {
      spotifyId: albumData.id,
      name: albumData.name,
      image: albumData.images[0]?.url,
      Artists: { connectOrCreate: albumArtists },
    },
    update: {},
  });
  log.info(`Saved new Album: ${albumData.id}`)
  return new Playlist(playlistEntry);
};
