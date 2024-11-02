import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";

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
