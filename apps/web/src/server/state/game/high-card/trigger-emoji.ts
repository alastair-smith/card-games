import { TRPCError } from '@trpc/server';
import { getLobbyPlayers } from '~/server/data/lobby';
import { publishEmoji } from '~/server/events/emoji';
import type { UserId } from '~/types/entities';
import type { GameCode, ReactionEmoji } from '~/types/game';

export const triggerEmojiState = async (
  code: GameCode,
  emoji: ReactionEmoji,
  userId: UserId,
) => {
  const lobby = await getLobbyPlayers({ code });

  if (!lobby || !lobby.players.some((p) => p.id === userId)) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'You are not in this game.',
    });
  }

  publishEmoji(code, {
    emoji,
    targetPlayerId: userId,
    id: Date.now(),
  });
};
