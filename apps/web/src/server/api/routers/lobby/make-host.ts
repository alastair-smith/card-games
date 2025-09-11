import { z } from 'zod';
import { protectedProcedure } from '~/server/api/trpc';
import { userIdSchema } from '~/types/entities';
import { gameCodeSchema } from '~/types/game';

export const makeHost = protectedProcedure
  .input(
    z.object({
      code: gameCodeSchema,
      playerId: userIdSchema,
    }),
  )
  .mutation(() => {});
