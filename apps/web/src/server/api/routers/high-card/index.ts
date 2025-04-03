import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { createGame } from "@/server/state/game/high-card";

export const lobbyRouter = createTRPCRouter({
  create: protectedProcedure
    .mutation(async ({ ctx: { userId } }) => {
      const { code } = await createGame({ host: userId });

      return { code };
    }),
});
