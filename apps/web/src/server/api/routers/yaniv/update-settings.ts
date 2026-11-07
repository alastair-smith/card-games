import { z } from 'zod';
import { protectedProcedure } from '~/server/api/trpc';
import { updateSettings } from '~/server/state/game/yaniv/update-settings';
import { gameCodeSchema } from '~/types/game';
import { settingUpdateSchema } from '~/types/games/yaniv';

export const updateSettingsMutation = protectedProcedure
  .input(z.object({ code: gameCodeSchema, settings: settingUpdateSchema }))
  .mutation(async ({ input: { code, settings }, ctx: { userId } }) => {
    await updateSettings({ code, userId, settings });
  });
