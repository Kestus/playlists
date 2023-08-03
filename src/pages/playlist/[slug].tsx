import type { Playlists, Tracks } from "@prisma/client";
import type {
  GetStaticPropsContext,
  InferGetStaticPropsType,
  NextPage,
} from "next";
import Head from "next/head";
import Navbar from "~/components/navbar";
import { prisma } from "~/server/db";

type PageProps = InferGetStaticPropsType<typeof getStaticProps>;
const Page: NextPage<PageProps> = (params) => {
  const playlist = JSON.parse(params.playlist) as Playlists;
  const tracks = JSON.parse(params.tracks) as Tracks[];

  return (
    <section>
      <Head>
        <title>{playlist.id}</title>
      </Head>
      <Navbar />
      <main>
        <div>{playlist.name}</div>
        <ul>
          {tracks.map((track) => {
            return (
              <li key={track.id}>
                <span>{track.name}</span>
              </li>
            );
          })}
        </ul>
      </main>
    </section>
  );
};
export default Page;

export const getStaticProps = async (ctx: GetStaticPropsContext) => {
  const playlistId = ctx.params?.slug;
  if (typeof playlistId !== "string") throw new Error("no slug");

  const playlist = await prisma.playlists.findUnique({
    where: { id: playlistId },
    include: { Tracks: true },
  });

  if (!playlist) throw new Error("No playlist");

  return {
    props: {
      playlist: JSON.stringify(playlist),
      tracks: JSON.stringify(playlist.Tracks),
    },
  };
};

export const getStaticPaths = async () => {
  const playlists = await prisma.playlists.findMany({
    select: { id: true },
  });

  if (!playlists) {
    return {
      paths: [],
      fallback: false,
    };
  }

  const paths = playlists.map((playlist) => {
    return {
      params: { slug: playlist.id },
    };
  });

  return {
    paths: paths,
    fallback: false,
  };
};
