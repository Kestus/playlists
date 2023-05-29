import { trackDataToClass } from "~/models/track";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const testRouter = createTRPCRouter({
  fun: publicProcedure.query(async ({ ctx }) => {
    // const data = await ctx.prisma.tracks.findFirst();
    // if (data === null) {
    //     return
    // }

    // const track = trackDataToClass(data)
    // console.log(track.name)
    // console.log(track.getName())

    // return

  //   const data = await ctx.prisma.playlists.findFirst();
  //   console.log("_____________");
  //   console.log(data?.id);

  //   let updatePlaylist = await ctx.prisma.playlists.update({
  //     where: {
  //       id: data?.id,
  //     },
  //     data: {
  //       tracks: {
  //         set: [],
  //       },
  //     },
  //   });

  }),
});
