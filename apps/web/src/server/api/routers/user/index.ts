import { playerNameSchema } from "@/app/api/auth/login/schema";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { ee } from "@/server/events/emitter";
import { z } from "zod";

export const userRouter = createTRPCRouter({
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

  update: protectedProcedure
    .input(
      z.object({
        name: playerNameSchema,
      }),
    )
    .mutation(async (opts) => {
      const user = await opts.ctx.db.user.update({
        where: {
          id: opts.ctx.userId,
        },
        data: opts.input,
        select: {
          id: true,
          name: true,
        },
      });

       // TODO update name in all games?

      ee.emit('add', `name change ${opts.input.name}`);

      return user;
    }),
});
