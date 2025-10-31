import { z } from 'zod';
import { protectedProcedure } from '~/server/api/trpc';
import { removePlayer } from '~/server/state/game/high-card/remove-player';
import { userIdSchema } from '~/types/entities';
import { gameCodeSchema } from '~/types/game';

export const kickPlayer = protectedProcedure
  .input(
    z.object({
      code: gameCodeSchema,
      playerId: userIdSchema,
    }),
  )
  .mutation(async ({ input: { code, playerId }, ctx: { userId } }) => {
    await removePlayer({
      gameCode: code,
      actor: userId,
      target: playerId,
    });
  });
