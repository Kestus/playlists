import type { Playlists } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";


const PlaylistItemContainer = (params: { data: Playlists; count?: number }) => {
  const data = params.data;
  const count = params.count;
  return (
    <div className="container flex gap-2 p-2 outline">
      <Image src={data.image} width={96} height={96} alt="Album picture" />
      <div className="flex flex-col">
        <Link href={`playlist/${data.id}`}>{data.name}</Link>
        <span>Expected length: {data.expectedTracks}</span>
        {count && <span>Actual length: {count}</span>}
      </div>
    </div>
  );
};

export default PlaylistItemContainer;
