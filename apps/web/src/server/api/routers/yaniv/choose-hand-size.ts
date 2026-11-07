import { z } from 'zod';
import { protectedProcedure } from '~/server/api/trpc';
import { chooseHandSize } from '~/server/state/game/yaniv/choose-hand-size';
import { gameCodeSchema } from '~/types/game';
import { handSizeSchema } from '~/types/games/yaniv';

export const chooseHandSizeMutation = protectedProcedure
  .input(z.object({ code: gameCodeSchema, handSize: handSizeSchema }))
  .mutation(async ({ input: { code, handSize }, ctx: { userId } }) => {
    await chooseHandSize(code, userId, handSize);
  });
