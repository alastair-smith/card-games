import { randomUUID } from 'node:crypto';
import { TRPCError } from '@trpc/server';
import { getLobby } from '~/server/data/lobby';
import { publishEmoji } from '~/server/events/emoji';
import type { EmojiReactionId, UserId } from '~/types/entities';
import type { GameCode, ReactionEmoji } from '~/types/game';

export const triggerEmojiState = async (
  code: GameCode,
  emoji: ReactionEmoji,
  userId: UserId,
) => {
  const lobby = await getLobby({ code });

  if (!lobby?.players.some(({ id }) => id === userId)) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'You are not in this game.',
    });
  }

  publishEmoji(code, {
    emoji,
    targetPlayerId: userId,
    id: randomUUID() as EmojiReactionId,
  });
};
