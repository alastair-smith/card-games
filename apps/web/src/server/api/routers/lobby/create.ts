import { z } from "zod";
import { protectedProcedure } from "../../trpc";
import { GameType } from "@/types/game";
import { createGame } from "@/server/state/game/high-card";

export const create = protectedProcedure
  .input(z.object({
    gameType: z.nativeEnum(GameType),
  }))
  .mutation(async ({ ctx: { userId } }) => {
    const { code } = await createGame({ host: userId });

    return { code };
  });
