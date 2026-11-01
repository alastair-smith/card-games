import { z } from 'zod';
import { protectedProcedure } from '~/server/api/trpc';
import { pickupCard } from '~/server/state/game/yaniv/pickup-card';
import { gameCodeSchema } from '~/types/game';
import { drawSourceSchema } from '~/types/games/yaniv';

export const pickupCardMutation = protectedProcedure
  .input(z.object({ code: gameCodeSchema, source: drawSourceSchema }))
  .mutation(async ({ input, ctx: { userId } }) => {
    await pickupCard(input.code, userId, input.source);
  });
