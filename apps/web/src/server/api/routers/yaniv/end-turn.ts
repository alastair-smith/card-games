import { z } from 'zod';
import { protectedProcedure } from '~/server/api/trpc';
import { endTurn } from '~/server/state/game/yaniv/end-turn';
import { gameCodeSchema } from '~/types/game';

export const endTurnMutation = protectedProcedure
  .input(z.object({ code: gameCodeSchema }))
  .mutation(async ({ input, ctx: { userId } }) => {
    await endTurn(input.code, userId);
  });
