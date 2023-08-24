import { type ChangeEvent, useState } from "react";
import { api } from "~/utils/api";
import { useCheckUrl, useFetchPlaylistPreview } from "./hooks";

// https://open.spotify.com/playlist/30zZTU35EaRXm0iOZm9rN7

const NewPlaylistForm = () => {
  const { data: spotifyAccessToken } = api.spotify.getAccessToken.useQuery();
  const [inputValue, setInputValue] = useState("");
  const { validUrl, resetUrl } = useCheckUrl(inputValue);
  const { playlistPreview, notFound } = useFetchPlaylistPreview(
    validUrl,
    spotifyAccessToken as string
  );

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
        ${validUrl === false || notFound ? "border-red-500 text-red-500" : ""}
        ${!!validUrl ? "border-green-500 text-green-500" : ""}
        `}
          value={inputValue}
        />
      </form>
      {playlistPreview}
    </div>
  );
};

export default NewPlaylistForm;
