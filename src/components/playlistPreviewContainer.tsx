import { Playlists } from "@prisma/client";
import Image from "next/image";

// TODO: rename "expectedTracks" to "expectedLength"

const PlaylistPreviewContainer = (params: {
  data: Playlists;
  count: number;
}) => {
  const data = params.data;
  const count = params.count;
  return (
    <div className="container flex gap-2 p-2 outline">
      <Image src={data.image} width={96} height={96} alt="Album picture" />
      <div className="flex flex-col">
        <span>{data.name}</span>
        <span>Expected length: {data.expectedTracks}</span>
        <span>Actual length: {count}</span>
      </div>
    </div>
  );
};

export default PlaylistPreviewContainer;
