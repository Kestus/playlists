import type { Playlists } from "@prisma/client";
import type { InferGetStaticPropsType, NextPage } from "next";
import Navbar from "~/components/navbar";
import PlaylistItemContainer from "~/components/playlistPreviewContainer";
import { getLatestPlaylists } from "~/server/api/routers/prisma/playlists";


type PageProps = InferGetStaticPropsType<typeof getStaticProps>;
const LatestPlaylists: NextPage<PageProps> = (props) => {
  const playlists = JSON.parse(props.playlists) as Playlists[];

  return (
    <section>
      <Navbar />
      <div className="flex flex-col items-center gap-10 pt-40">
        {!playlists && <div>No playlists yet</div>}
        {playlists && (
          <ul>
            {playlists.map((playlist, count) => (
              <li key={playlist.id}>
                <PlaylistItemContainer data={playlist} count={count} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
};

export default LatestPlaylists;


/*
 *  Prefetch data
 */
export const getStaticProps = async () => {
  const playlists = await getLatestPlaylists();

  return {
    props: {
      playlists: JSON.stringify(playlists),
    },
    revalidate: 20,
  };
};
