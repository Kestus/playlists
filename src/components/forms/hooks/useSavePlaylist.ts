import { api } from "~/utils/api";
import { type ValidUrl } from "./useCheckUrl";

export const useSavePlaylist = (url: ValidUrl, spotifyAccessToken: string) => {
  const { mutate, isLoading, isSuccess, data } =
    api.spotify.savePlaylist.useMutation();

  const savePlaylist = () => {
    if (url && spotifyAccessToken !== "undefined") {
      mutate({ url, spotifyAccessToken });
    }
  };

  return {
    savePlaylist,
    isSaving: isLoading,
    isSaved: isSuccess,
    playlistDBID: data as string,
  };
};
