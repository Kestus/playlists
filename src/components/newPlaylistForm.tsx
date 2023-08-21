import { api } from "~/utils/api";
import Spinner from "./spinner";
import { type ChangeEvent, useEffect, useState, useCallback } from "react";
import { Transition } from "@headlessui/react";
import Image from "next/image";
import Link from "next/link";

// https://open.spotify.com/playlist/30zZTU35EaRXm0iOZm9rN7

const NewPlaylistForm = () => {
  const [inputValue, setInputValue] = useState("");
  const { validUrl, reset: resetUrlIsValid } = useCheckUrl(inputValue);
  // fetch spotify access token
  const { data: spotifyAccessToken } = api.spotify.getAccessToken.useQuery();
  // Playlist preview hook
  const {
    playlist,
    alreadyExists,
    isLoading: loadingPlaylistPreview,
    reset: resetPlaylistPreview,
    fetchPlaylistPreview,
    isError: playlistNotFound,
  } = useFetchPlaylistPreview(validUrl, spotifyAccessToken);
  // Save playlist hook
  const { savePlaylist, savingPlaylist, isSaved } = useSavePlaylist(
    validUrl,
    spotifyAccessToken
  );

  useEffect(fetchPlaylistPreview, [validUrl, fetchPlaylistPreview]);

  // check input url
  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
    resetUrlIsValid();
    resetPlaylistPreview();
  };

  return (
    <div className="flex w-2/3 flex-col md:w-96">
      <form>
        <input
          onChange={handleInputChange}
          className={`
          w-full border-2 transition-colors duration-500 ease-in-out 
          ${
            typeof validUrl === "boolean"
              ? validUrl && !playlistNotFound
                ? "border-green-500"
                : "border-red-500 text-red-500"
              : ""
          }
          `}
          id="playlist"
          type="text"
          placeholder="https://open.spotify.com/playlist/id"
          disabled={loadingPlaylistPreview}
          value={inputValue}
        />
      </form>
      {loadingPlaylistPreview && <Spinner />}
      <Transition
        show={!!playlist || !!playlistNotFound}
        enter="transition-opacity duration-500"
        enterFrom="opacity-0"
        enterTo="opacity-100"
        leave="transition-opacity duration-500"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
      >
        {playlist && (
          <div className=" mt-2 flex gap-2 rounded-md border-2 border-green-400 bg-green-200 p-2">
            {playlist.images[0] && (
              <Image
                src={playlist.images[0]?.url}
                width={120}
                height={120}
                alt="Playlist Image"
              />
            )}
            <div className="flex w-full flex-col">
              <span className="">{playlist.name}</span>
              <div className="mt-auto flex gap-4">
                <div className="ml-auto text-sm">
                  {!!alreadyExists && !isSaved && (
                    <>
                      <span>Already Exists</span>
                      <br />
                      <Link href={`/playlist/${alreadyExists}`}>
                        Go to Playlist
                      </Link>
                    </>
                  )}
                  {typeof isSaved === "string" && (
                    <>
                      <span>Saved</span>
                      <br />
                      <Link href={`/playlist/${isSaved}`}>Go to Playlist</Link>
                    </>
                  )}
                </div>
                <button
                  onClick={savePlaylist}
                  className={`
                      rounded
                      border-b-2
                      px-2
                      font-sans
                      font-semibold
                      text-slate-50
                      transition-colors
                      duration-500
                      ease-out
                      ${
                        !!savingPlaylist
                          ? `border-grey-800 
                          bg-grey-600
                          hover:bg-grey-500
                          cursor-wait
                        `
                          : `border-cyan-800 
                          bg-cyan-600
                          hover:bg-cyan-500
                          `
                      }
                    `}
                >
                  {!alreadyExists ? "Save" : "Update"}
                </button>
              </div>
            </div>
          </div>
        )}
        <Transition.Child
          enter="transition duration-100 ease-in"
          enterFrom="-translate-y-10 opacity-0"
          enterTo="translate-y-0 opacity-100"
          leave="transition duration-75 ease-out"
          leaveFrom="translate-y-0 opacity-100"
          leaveTo="-translate-y-10 opacity-0"
        >
          {playlistNotFound && (
            <div className="flex w-auto justify-center rounded-b-md border-b-2 border-l-2 border-r-2 border-red-500 bg-red-400">
              <span className="font-mono text-lg font-semibold text-slate-100 ">
                Playlist Not Found
              </span>
            </div>
          )}
        </Transition.Child>
      </Transition>
    </div>
  );
};
export default NewPlaylistForm;

const useCheckUrl = (inputValue: string) => {
  // tRPC mutation url check
  const {
    mutate: checkUrl,
    data: validUrl,
    reset: resetUrlIsValid,
  } = api.forms.spotifyUrlHandler.useMutation();

  // checkUrl after timeout, when unput value changes
  useEffect(() => {
    const timeOut = setTimeout(() => {
      if (inputValue.length < 10) return;
      checkUrl({ url: inputValue });
    }, 3000);
    return () => {
      clearTimeout(timeOut);
    };
  }, [inputValue, checkUrl]);

  return { validUrl, reset: resetUrlIsValid };
};

const useFetchPlaylistPreview = (
  validUrl: string | undefined,
  spotifyAccessToken: string | undefined
) => {
  // tRPC fetch playlist preview
  const {
    mutate: fetchPlaylistData,
    data,
    isLoading,
    reset,
    isError,
  } = api.spotify.fetchPlaylistPreview.useMutation();

  // make a mutate call if url is valid and token is loaded
  const fetchPlaylistPreview = useCallback(() => {
    if (spotifyAccessToken && validUrl) {
      fetchPlaylistData({ url: validUrl, spotifyAccessToken });
    }
  }, [validUrl, spotifyAccessToken, fetchPlaylistData]);

  return {
    playlist: data?.playlistData,
    alreadyExists: data?.alreadyExists,
    isLoading,
    reset,
    fetchPlaylistPreview,
    isError,
  };
};

const useSavePlaylist = (
  validUrl: string | undefined,
  spotifyAccessToken: string | undefined
) => {
  const { mutate, data, isSuccess, isLoading } =
    api.spotify.savePlaylist.useMutation();

  const savePlaylist = useCallback(() => {
    if (spotifyAccessToken && validUrl) {
      mutate({
        url: validUrl,
        spotifyAccessToken,
      });
    }
  }, [validUrl, spotifyAccessToken, mutate]);

  return {
    savePlaylist,
    isSaved: isSuccess ? data : false,
    savingPlaylist: isLoading,
  };
};
