import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "../../trpc";
import { generateRandomToken, getTokenExpiryDate } from "@/server/auth";

export const authRouter = createTRPCRouter({
  get: protectedProcedure.query(async (opts) => {
    const user = await opts.ctx.db.user.findUniqueOrThrow({
      where: {
        id: opts.ctx.userId,
      },
      select: {
        id: true,
        name: true,
      },
    });

    return user;
  }),
});
