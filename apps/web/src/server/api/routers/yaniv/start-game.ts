import { z } from 'zod';
import { protectedProcedure } from '~/server/api/trpc';
import { startGame } from '~/server/state/game/yaniv/start-game';
import { gameCodeSchema } from '~/types/game';

export const startGameMutation = protectedProcedure
  .input(z.object({ code: gameCodeSchema }))
  .mutation(async ({ input, ctx: { userId } }) => {
    await startGame(input.code, userId);
  });
