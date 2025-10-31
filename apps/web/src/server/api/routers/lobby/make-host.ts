import { z } from 'zod';
import { protectedProcedure } from '~/server/api/trpc';
import { makeHost as makeHostState } from '~/server/state/game/high-card/make-host';
import { userIdSchema } from '~/types/entities';
import { gameCodeSchema } from '~/types/game';

export const makeHost = protectedProcedure
  .input(
    z.object({
      code: gameCodeSchema,
      playerId: userIdSchema,
    }),
  )
  .mutation(async ({ input: { code, playerId }, ctx: { userId } }) => {
    await makeHostState({
      gameCode: code,
      target: playerId,
      actor: userId,
    });
  });
