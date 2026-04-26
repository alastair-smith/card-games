import type { EmojiReactionId, UserId } from '~/types/entities';
import type { GameCode, ReactionEmoji, SystemEmoji } from '~/types/game';
import emitter from './emitter';

export const getEmojiChannel = (code: GameCode): `emoji:${GameCode}` =>
  `emoji:${code}`;

export const publishEmoji = (
  code: GameCode,
  payload: {
    emoji: ReactionEmoji | SystemEmoji;
    targetPlayerId: UserId;
    id: EmojiReactionId;
  },
) => {
  emitter.emit(getEmojiChannel(code), payload);
};
