import { z } from 'zod';
import { protectedProcedure } from '~/server/api/trpc';
import { gameCodeSchema } from '~/types/game';

export const leaveGame = protectedProcedure
  .input(
    z.object({
      code: gameCodeSchema,
    }),
  )
  .mutation(() => {});
