import { z } from 'zod';
import { protectedProcedure } from '~/server/api/trpc';
import { updateSettings } from '~/server/state/game/yaniv/update-settings';
import { gameCodeSchema } from '~/types/game';
import { handSizeSchema } from '~/types/games/yaniv';

export const updateSettingsMutation = protectedProcedure
  .input(z.object({ code: gameCodeSchema, handSize: handSizeSchema }))
  .mutation(async ({ input: { code, handSize }, ctx: { userId } }) => {
    await updateSettings({ code, userId, settings: { handSize } });
  });
