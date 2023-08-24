import { URL } from "next/dist/compiled/@edge-runtime/primitives/url";
import { useCallback, useEffect, useState } from "react";
import { zodURL } from "~/server/api/routers/zod/validators";

export type ValidUrl = zodURL | undefined | false;

export const useCheckUrl = (inputValue: string) => {  
  const [validUrl, setValidUrl] = useState(undefined as ValidUrl);  

  // setters
  const notValid = (): void => {
    return setValidUrl(false);
  };
  const resetUrl = (): void => {
    return setValidUrl(undefined);  };  

  // main fun
  const checkUrl = useCallback((input: string): void => {
    if (input.length < 10) return // dont change anything if input is less then 10 chars long    
    const url = tryNewUrl(input);   
     
    if (!url) return notValid();
    if (spotifyUrl(url)) return setValidUrl(url);
    // ...other platforms

    return notValid();
  }, [])

  // checkUrl when "validUrl" state is changed
  useEffect(() => {
    checkUrl(inputValue)
  }, [inputValue, checkUrl])  

  return { validUrl, resetUrl };
};


const tryNewUrl = (input: string): zodURL | false => {
  try {
    const url = new URL(input)
    return zodURL.parse(url)
  } catch (error) {
    return false;
  }
};

const spotifyUrl = (spotifyUrl: zodURL): boolean => {
  if (!spotifyUrl.hostname.includes("spotify.com")) return false;
  const path = spotifyUrl.pathname.split("/")
  path.shift() // remove first (empty) element from array
  if (path.length < 2) return false;

  if (!path[0]?.includes("playlist") && !path[0]?.includes("album")) return false;
  return true;
};