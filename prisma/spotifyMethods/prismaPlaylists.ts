import { zodPlaylist, zodTrack } from "~/server/api/routers/zod/validators";
import { prisma } from "~/server/db";
import { Playlist } from "~/server/models/playlist";
import { batchSaveTrack } from "./prismaTracks";
import { log } from "next-axiom";

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
      expectedTracks: playlistData.total_tracks?.valueOf(),
    },
    update: {},
  });
  log.info(`Saved new Playlist: ${playlistData.id}`)
  return new Playlist(playlistEntry);
}