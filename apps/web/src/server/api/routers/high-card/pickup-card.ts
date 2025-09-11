import { z } from 'zod';
import { protectedProcedure } from '~/server/api/trpc';
import { gameCodeSchema } from '~/types/game';

export const pickupCard = protectedProcedure
  .input(
    z.object({
      code: gameCodeSchema,
    }),
  )
  .mutation(() => {
    return;
  });
