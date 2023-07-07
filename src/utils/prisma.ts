import { type zodArtist } from "~/server/api/routers/zod/validators";

export const mapArtistConnectOrCreate = (artists: zodArtist[]) => {
  return artists.map((artist) => {
    return {
      where: { spotifyId: artist.id },
      create: {
        name: artist.name,
        spotifyId: artist.id,
        image: artist.images?.[0]?.url,
      },
    };
  }); 
}