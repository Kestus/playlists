import { api } from "~/utils/api";
import Spinner from "./spinner";
import { type ChangeEvent, useEffect, useRef, useState } from "react";
import { Transition } from "@headlessui/react";

// https://open.spotify.com/playlist/30zZTU35EaRXm0iOZm9rN7

const NewPlaylistForm = () => {
  const {
    mutate: checkUrl,
    data: urlIsValid,
    isSuccess: checkUrlSuccess,
  } = api.forms.spotifyUrlHandler.useMutation();
  const {
    mutate: fetchPlaylistPreview,
    data: playlist,
    isLoading: loadingPlaylistPreview,
    reset: resetPlaylistPreview,
  } = api.spotify.fetchPlaylistPreview.useMutation();
  const { data: spotifyAccessToken, isSuccess: tokenIsLoaded } =
    api.spotify.getAccessToken.useQuery();

  const [inputIsDisabled, setInputIsDisabled] = useState(false);
  const [inputValue, setInputValue] = useState("");

  // select element form input field
  const inputFieldRef = useRef<HTMLInputElement>(null);
  const inputField = inputFieldRef.current;

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const element = event.target;
    setInputValue(element.value);
  };

  // TODO
  // 46:6  Warning: React Hook useEffect has missing dependencies: 'checkUrl', 'inputField?.classList', and 'resetPlaylistPreview'. Either include them or remove the dependency array.  react-hooks/exhaustive-deps
  // 56:6  Warning: React Hook useEffect has missing dependencies: 'fetchPlaylistPreview', 'inputField?.classList', 'inputValue', 'spotifyAccessToken', 'tokenIsLoaded', and 'urlIsValid'. Either
  // include them or remove the dependency array.  react-hooks/exhaustive-deps
  
  // check url
  useEffect(() => {
    if (inputValue.length < 10) return;
    const timeOut = setTimeout(() => {
      inputField?.classList.remove("border-red-500");
      resetPlaylistPreview();
      checkUrl({ url: inputValue });
    }, 1000);
    return () => {
      clearTimeout(timeOut);
    };
  }, [inputValue]);

  // paint the border red if url is is not valid
  useEffect(() => {
    if (typeof urlIsValid !== "boolean") return;
    if (!urlIsValid) {
      inputField?.classList.add("border-red-500");
    } else if (tokenIsLoaded) {
      fetchPlaylistPreview({ url: inputValue, spotifyAccessToken });
    }
  }, [checkUrlSuccess]);

  // disable input while playlist preview is loading
  useEffect(() => {
    if (loadingPlaylistPreview) {
      setInputIsDisabled(true);
    } else {
      setInputIsDisabled(false);
    }
  }, [loadingPlaylistPreview]);

  return (
    <div className="flex w-1/3 flex-col  ">
      <form className="w-full">
        <input
          onChange={handleChange}
          className="w-full border-2 transition-colors duration-500 ease-in-out"
          id="playlist"
          type="text"
          placeholder="Playlist URL"
          disabled={inputIsDisabled}
          value={inputValue}
          ref={inputFieldRef}
        />
      </form>
      {loadingPlaylistPreview && <Spinner />}
      {/* {playlist && <PlaylistItemContainer data={playlist} />} */}
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
