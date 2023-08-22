import { useEffect } from "react";
import { api } from "~/utils/api";
import { type ValidUrl } from "./useCheckUrl";

const useFetchPlaylistPreview = (validUrl: ValidUrl) => {
  const { data: spotifyAccessToken } = api.spotify.getAccessToken.useQuery();
  const { mutate, data, reset, isError } =
    api.spotify.fetchPlaylistPreview.useMutation();

  useEffect(() => {
    reset()
    if (validUrl && spotifyAccessToken) {
      mutate({ url: validUrl, spotifyAccessToken });
    }
  }, [validUrl, spotifyAccessToken, mutate, reset])

  return { playlistPreview: data, notFound: isError }
};

export default useFetchPlaylistPreview;
