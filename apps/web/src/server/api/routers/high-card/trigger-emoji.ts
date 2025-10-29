import { z } from 'zod';
import { protectedProcedure } from '~/server/api/trpc';
import { triggerEmojiState } from '~/server/state/game/high-card/trigger-emoji';
import { gameCodeSchema, reactionEmojis } from '~/types/game';

export const triggerEmoji = protectedProcedure
  .input(
    z.object({
      code: gameCodeSchema,
      emoji: z.enum(reactionEmojis),
    }),
  )
  .mutation(async ({ input, ctx }) => {
    await triggerEmojiState(input.code, input.emoji, ctx.userId);
  });
