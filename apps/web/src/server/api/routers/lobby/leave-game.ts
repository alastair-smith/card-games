import { z } from 'zod';
import { protectedProcedure } from '~/server/api/trpc';
import { removePlayer } from '~/server/state/game/high-card/remove-player';
import { gameCodeSchema } from '~/types/game';

export const leaveGame = protectedProcedure
  .input(
    z.object({
      code: gameCodeSchema,
    }),
  )
  .mutation(async ({ input: { code }, ctx: { userId } }) => {
    await removePlayer({
      gameCode: code,
      actor: userId,
      target: userId,
    });
  });
