import { z } from 'zod';
import { protectedProcedure } from '~/server/api/trpc';
import { createGame as createHighCardGame } from '~/server/state/game/high-card/create-game';
import { createGame as createYanivGame } from '~/server/state/game/yaniv/create-game';
import { GameType } from '~/types/game';

export const create = protectedProcedure
  .input(
    z.object({
      gameType: z.enum(GameType),
    }),
  )
  .mutation(async ({ ctx: { userId }, input: { gameType } }) => {
    switch (gameType) {
      case GameType.HIGH_CARD: {
        const { code } = await createHighCardGame({ host: userId });
        return { code };
      }
      case GameType.YANIV: {
        const { code } = await createYanivGame({ host: userId });
        return { code };
      }
      default:
        throw new Error(`Unsupported game type: ${gameType}`);
    }
  });
