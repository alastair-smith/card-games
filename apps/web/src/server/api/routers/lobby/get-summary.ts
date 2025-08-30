import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { getLobbySummary } from '~/server/data/lobby';
import { DataServiceError, DataServiceErrorCode } from '~/server/data/redis';
import { gameCodeSchema } from '~/types/game';
import { protectedProcedure } from '../../trpc';

export const getSummary = protectedProcedure
  .input(
    z.object({
      code: gameCodeSchema,
    }),
  )
  .query(async ({ input }) => {
    try {
      const data = await getLobbySummary({ code: input.code });

      return {
        code: data.code,
        type: data.type,
      };
    } catch (error: unknown) {
      if (
        error instanceof DataServiceError &&
        error.code === DataServiceErrorCode.NOT_FOUND
      ) {
        throw new TRPCError({
          message: 'Lobby not found',
          code: 'NOT_FOUND',
          cause: error,
        });
      } else {
        throw error;
      }
    }
  });
