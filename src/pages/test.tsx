import { type NextPage } from "next";
import Navbar from "~/components/navbar";
import Loading from "~/components/placeholders/loading";
import { api } from "~/utils/api";

const Test: NextPage = () => {
  // const { data: token, isLoading } = api.spotify.getAccessToken.useQuery();
  // const { mutate: fetchPlaylist, data: playlist } =
  //   api.spotify.getPlaylist.useMutation();

  // if (isLoading || !token) return <Loading />;
  // const album = "https://open.spotify.com/album/4M2Mf4pmARKGVT9MLCe3HA"
  // const bigPlaylist = "https://open.spotify.com/playlist/7anUioMjAs7XmGF5NDCl1I";
  const smolPlaylist = "https://open.spotify.com/playlist/30zZTU35EaRXm0iOZm9rN7";
  const { data: token } = api.spotify.getAccessToken.useQuery();
  const { mutate: getPlaylist, data: playlist } =
    api.spotify.fetchPlaylist.useMutation();

  if (!token) {
    return <Loading />;
  }

  // const fetch = () => {
  //   fetchPlaylist({ url: URL, spotifyAccessToken: token });
  // };
  // const mapObject = (data: object) => {
  //   data.
  // }

  return (
    <section>
      <Navbar />
      <div className="flex flex-col items-center gap-10 pt-40">
        <button
          onClick={() => getPlaylist({ url: smolPlaylist, spotifyAccessToken: token })}
          className="rounded-full bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700"
        >
          yep
        </button>
        <br />
        {playlist && (
          <span className="text rounded-md border-4 border-emerald-400 bg-indigo-200 p-10 text-lg text-slate-700">
            {playlist.data.name} : Length {}
          </span>
        )}
      </div>
    </section>
  );
};
export default Test;

/*
 *  Prefetch data through SSGHelper
 *
 */

// import { createServerSideHelpers } from "@trpc/react-query/server";
// import { appRouter } from "~/server/api/root";
// import superjson from "superjson";
// import { createInnerTRPCContext } from "~/server/api/trpc";

// export const getStaticProps: GetStaticProps = async (context) => {
//   const ssg = createServerSideHelpers({
//     router: appRouter,
//     ctx: await createInnerTRPCContext(),
//     transformer: superjson,
//   });

//   return {
//     props: {},
//   };
// };
