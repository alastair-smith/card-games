import { z } from 'zod';
import { protectedProcedure } from '~/server/api/trpc';
import { createGame } from '~/server/state/game/high-card/create-game';
import { GameType } from '~/types/game';

export const create = protectedProcedure
  .input(
    z.object({
      gameType: z.enum(GameType),
    }),
  )
  .mutation(async ({ ctx: { userId }, input: { gameType } }) => {
    if (gameType !== GameType.HIGH_CARD) {
      throw new Error('Invalid game type');
    }
    const { code } = await createGame({ host: userId });

    return { code };
  });
