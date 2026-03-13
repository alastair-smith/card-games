import { z } from 'zod';
import { protectedProcedure } from '~/server/api/trpc';
import { startNewRound } from '~/server/state/game/yaniv/start-new-round';
import { gameCodeSchema } from '~/types/game';

export const startNewRoundMutation = protectedProcedure
  .input(z.object({ code: gameCodeSchema }))
  .mutation(async ({ input, ctx: { userId } }) => {
    await startNewRound(input.code, userId);
  });
