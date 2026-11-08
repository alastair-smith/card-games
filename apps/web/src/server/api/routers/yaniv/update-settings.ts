import { protectedProcedure } from '~/server/api/trpc';
import { updateSettings } from '~/server/state/game/yaniv/update-settings';
import { updateSettingsInputSchema } from '~/types/games/yaniv';

export const updateSettingsMutation = protectedProcedure
  .input(updateSettingsInputSchema)
  .mutation(async ({ input: { code, settings }, ctx: { userId } }) => {
    await updateSettings({ code, userId, settings });
  });
