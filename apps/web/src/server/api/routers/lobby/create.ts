import { z } from 'zod';
import { protectedProcedure } from '~/server/api/trpc';
import { createGame } from '~/server/state/game/high-card';
import { GameType } from '~/types/game';

export const create = protectedProcedure
  .input(
    z.object({
      gameType: z.nativeEnum(GameType),
    }),
  )
  .mutation(async ({ ctx: { userId } }) => {
    const { code } = await createGame({ host: userId });

    return { code };
  });
