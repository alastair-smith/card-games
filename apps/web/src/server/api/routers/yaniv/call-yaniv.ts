import { z } from 'zod';
import { protectedProcedure } from '~/server/api/trpc';
import { callYaniv } from '~/server/state/game/yaniv/call-yaniv';
import { gameCodeSchema } from '~/types/game';

export const callYanivMutation = protectedProcedure
  .input(z.object({ code: gameCodeSchema }))
  .mutation(async ({ input, ctx: { userId } }) => {
    await callYaniv(input.code, userId);
  });
