import { useEffect } from "react";
import { api } from "~/utils/api";
import { type ValidUrl } from "./useCheckUrl";
import Image from "next/image";
import { useSavePlaylist } from "./useSavePlaylist";
import Link from "next/link";
import Spinner from "~/components/placeholders/spinner";
import InputError from "../inputError";
import Button from "~/components/button";

export const useFetchPlaylistPreview = (
  validUrl: ValidUrl,
  spotifyAccessToken: string
) => {
  const { mutate, data, reset, isError, isLoading } =
    api.spotify.fetchPlaylistPreview.useMutation();
  const { savePlaylist, isSaving, isSaved, playlistDBID } = useSavePlaylist(
    validUrl,
    spotifyAccessToken
  );

  useEffect(() => {
    reset();
    if (validUrl && spotifyAccessToken !== "undefined") {
      mutate({ url: validUrl, spotifyAccessToken });
    }
  }, [validUrl, spotifyAccessToken, mutate, reset]);

  const playlistPreview = (
    <div className="mt-2">
      {!!data && (
        <div className=" mt-2 flex gap-2 rounded-md border-2 border-green-400 bg-green-200 p-2">
          {data.images[0] && (
            <Image
              src={data.images[0]?.url}
              width={120}
              height={120}
              alt="Playlist Image"
            />
          )}
          <div className="flex w-full flex-col">
            <span className="">{data.name}</span>
            <div className="mt-auto flex gap-4">
              <div className="ml-auto text-sm">
                {!!data.alreadyExists && !isSaved && (
                  <Link href={`/playlist/${data.alreadyExists}`}>
                    Go to Playlist
                  </Link>
                )}
              </div>
              {!isSaved ? (
                <Button
                  onclick={savePlaylist}
                  loadingState={isSaving}
                  message={`${!data.alreadyExists ? "Save" : "Update"}`}
                />
              ) : (
                <Link href={`/playlist/${playlistDBID}`}>Go to Playlist</Link>
              )}
            </div>
          </div>
        </div>
      )}
      {isLoading && <Spinner />}
      {isError && (
        <InputError conditon={isError} message="Playlist Not Found" />
      )}
    </div>
  );

  return { playlistPreview, notFound: isError };
};
