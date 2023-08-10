import { api } from "~/utils/api";
import Spinner from "./spinner";
import { type ChangeEvent, useEffect, useState } from "react";
import { Transition } from "@headlessui/react";


// https://open.spotify.com/playlist/30zZTU35EaRXm0iOZm9rN7

const NewPlaylistForm = () => {
  const [inputValue, setInputValue] = useState("");
  const { urlIsValid, reset: resetUrlIsValid } = useCheckUrl(inputValue);
  const {
    playlist,
    isLoading: loadingPlaylistPreview,
    reset: resetPlaylistPreview,
    fetchPlaylistPreview
  } = useFetchPlaylistPreview(inputValue, urlIsValid);
  useEffect(fetchPlaylistPreview, [urlIsValid, fetchPlaylistPreview])

  // check input url
  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
    resetUrlIsValid();
    resetPlaylistPreview();
  };  

  return (
    <div className="flex w-1/3 flex-col  ">
      <form className="w-full">
        <input
          onChange={handleInputChange}
          className={`
          w-full border-2 transition-colors duration-500 ease-in-out 
          ${
            typeof urlIsValid === "boolean"
              ? urlIsValid
                ? "border-green-500"
                : "border-red-500"
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
        show={!!playlist}
        enter="transition-opacity duration-500"
        enterFrom="opacity-0"
        enterTo="opacity-100"
        leave="transition-opacity duration-500"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
      >
        {playlist && <span>{playlist.name}</span>}
      </Transition>
    </div>
  );
};

export default NewPlaylistForm;

const useCheckUrl = (inputValue: string) => {
  const {
    mutate: checkUrl,
    data: urlIsValid,
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

  return { urlIsValid, reset: resetUrlIsValid };
};


const useFetchPlaylistPreview = (
  url: string,
  urlIsValid: boolean | undefined
) => {
  const { data: spotifyAccessToken, isSuccess: tokenIsLoaded } =
    api.spotify.getAccessToken.useQuery();

  const { mutate, data: playlist, isLoading, reset } =
    api.spotify.fetchPlaylistPreview.useMutation();

  const fetchPlaylistPreview = () => {
    if (tokenIsLoaded && urlIsValid) {
      mutate({url, spotifyAccessToken})
    }
  }
  return { playlist, isLoading, reset, fetchPlaylistPreview };
};
