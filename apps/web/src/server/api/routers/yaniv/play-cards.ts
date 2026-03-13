import { z } from 'zod';
import { protectedProcedure } from '~/server/api/trpc';
import { playCards } from '~/server/state/game/yaniv/play-cards';
import { gameCodeSchema } from '~/types/game';
import { yanivPlayingCardSchema } from '~/types/games/yaniv';

export const playCardsMutation = protectedProcedure
  .input(
    z.object({ code: gameCodeSchema, cards: z.array(yanivPlayingCardSchema) }),
  )
  .mutation(async ({ input, ctx: { userId } }) => {
    await playCards(input.code, userId, input.cards);
  });
