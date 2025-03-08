import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";

export const lobbyRouter = createTRPCRouter({
  create: protectedProcedure
    .mutation(async ({ ctx: { state, userId } }) => {
      const { code } = await state.game.highCard.createGame({ host: userId });

      return { code };
    }),
});
