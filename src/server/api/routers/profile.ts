import { clerkClient } from "@clerk/nextjs";
import { type User } from "@clerk/nextjs/server";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const profileRouter = createTRPCRouter({
  getUserByUsername: publicProcedure
    .input(z.object({ username: z.string() }))
    .query(async ({ input }) => {
      const res = await clerkClient.users.getUserList({
        username: [input.username.toLowerCase()],
      });
      console.log(input.username)
      const userData = res[0];

      if (!res || userData == undefined) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "User not found",
        });
      }

      return filterUserData(userData);
    }),
});

function filterUserData(user: User) {
  return {
    id: user.id,
    username: (user.username === null) ? "" : user.username,
    profileImageUrl: user.profileImageUrl,
  };
}
