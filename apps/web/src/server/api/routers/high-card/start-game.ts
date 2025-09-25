import { z } from 'zod';
import { protectedProcedure } from '~/server/api/trpc';
import { startGame } from '~/server/state/game/high-card/start-game';
import { gameCodeSchema } from '~/types/game';

export const startGameMutation = protectedProcedure
  .input(
    z.object({
      code: gameCodeSchema,
    }),
  )
  .mutation(async ({ input, ctx: { userId } }) => {
    const data = await startGame(input.code, userId);

    return data;
  });
