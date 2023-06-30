import { zodPlaylist, zodTrack } from "~/server/api/routers/zod/validators";
import { prisma } from "~/server/db";
import { Playlist } from "~/server/models/playlist";
import { batchSaveTrack } from "./prismaTracks";

export const savePlaylistAndTracks = async (
  playlistData: zodPlaylist,
  tracksData?: zodTrack[]
) => {
  const playlistEntry = await prisma.playlists.upsert({
    where: { spotifyId: playlistData.id },
    create: {
      spotifyId: playlistData.id,
      name: playlistData.name,
      image: playlistData.images.pop()?.url,
    },
    update: {},
  });
  const playlist = new Playlist(playlistEntry);

  if (!tracksData) {
    return playlist;
  }

  const tracks = await batchSaveTrack(tracksData);
  const arrayOfId = tracks.map((track) => track.getId());
  // connect playlist to tracks
  playlist.addManyTracks(tracks);

  return playlist;
};
