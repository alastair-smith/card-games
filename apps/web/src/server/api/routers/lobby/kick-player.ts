import { z } from 'zod';
import { protectedProcedure } from '~/server/api/trpc';
import { userIdSchema } from '~/types/entities';
import { gameCodeSchema } from '~/types/game';

export const kickPlayer = protectedProcedure
  .input(
    z.object({
      code: gameCodeSchema,
      playerId: userIdSchema,
    }),
  )
  .mutation(() => {});
