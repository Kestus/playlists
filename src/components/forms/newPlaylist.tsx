import { type ChangeEvent, useState } from "react";
import useCheckUrl from "./hooks/useCheckUrl";
import useFetchPlaylistPreview from "./hooks/useFetchPlaylistPreview";
import InputError from "../inputError";

// https://open.spotify.com/playlist/30zZTU35EaRXm0iOZm9rN7

const NewPlaylistForm = () => {
  const [inputValue, setInputValue] = useState("");
  const { validUrl, resetUrl } = useCheckUrl(inputValue);
  const { playlistPreview, notFound } = useFetchPlaylistPreview(validUrl);
  // const {} = useSavePlaylist(spotifyAccessToken)

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
    resetUrl();
  };

  return (
    <div>
      <form className="flex w-2/3 flex-col md:w-96">
        <input
          onChange={handleChange}
          className={`
        w-full border-2 transition-colors duration-500 ease-in-out 
        ${validUrl === false ? "border-red-500 text-red-500" : ""}
        ${notFound ? "border-red-500 text-red-500" : ""}
        ${!!validUrl ? "border-green-500 text-green-500" : ""}
        `}
          value={inputValue}
        />
      </form>
      <span>{playlistPreview && `${playlistPreview.name}`}</span>
      <InputError conditon={notFound} message="Playlist Not Found" />
    </div>
  );
};

export default NewPlaylistForm;
