import type {
  GetServerSideProps,
  InferGetServerSidePropsType,
  NextPage,
} from "next";
import { log } from "next-axiom";
import { api } from "~/utils/api";
import ErrorPage from "~/components/errorPage";
import Loading from "~/components/placeholders/loading";
import Navbar from "~/components/navbar";

const LatestPlaylists: NextPage<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = () => {
  const {
    data: playlists,
    isLoading,
    error,
  } = api.prismaPlaylists.getLatest.useQuery();

  if (isLoading) return <Loading />;
  if (error) {
    log.error(error.message);
    return <ErrorPage code={error.data?.httpStatus} />;
  }

  return (
    <section>
      <Navbar />
      <div className="flex flex-col items-center gap-10 pt-40">
        {playlists?.map((playlist, count) => (
          <section key={playlist.id}>
            <PlaylistPreviewContainer data={playlist} count={count} />
          </section>
        ))}
      </div>
    </section>
  );
};

export default LatestPlaylists;

/*
 *  Prefetch data through SSGHelper
 */

import { createServerSideHelpers } from "@trpc/react-query/server";
import superjson from "superjson";
import { appRouter } from "~/server/api/root";
import { createInnerTRPCContext } from "~/server/api/trpc";
import PlaylistPreviewContainer from "~/components/playlistPreviewContainer";

export const getServerSideProps: GetServerSideProps = async () => {
  const ssg = createServerSideHelpers({
    router: appRouter,
    ctx: createInnerTRPCContext(),
    transformer: superjson,
  });

  await ssg.prismaPlaylists.getLatest.prefetch();

  return {
    props: {
      trpcState: ssg.dehydrate(),
    },
  };
};
