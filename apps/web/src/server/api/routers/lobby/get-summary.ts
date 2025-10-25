import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { protectedProcedure } from '~/server/api/trpc';
import { getLobbySummary } from '~/server/data/lobby';
import { gameCodeSchema } from '~/types/game';

export const getSummary = protectedProcedure
  .input(
    z.object({
      code: gameCodeSchema,
    }),
  )
  .query(async ({ input }) => {
    const data = await getLobbySummary({ code: input.code });

    if (!data) {
      throw new TRPCError({
        message: 'Lobby not found',
        code: 'NOT_FOUND',
      });
    }

    return {
      code: data.code,
      type: data.type,
    };
  });
