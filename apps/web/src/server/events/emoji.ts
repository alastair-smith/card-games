import type { UserId } from '~/types/entities';
import type { GameCode, ReactionEmoji } from '~/types/game';
import emitter from './emitter';

export const getEmojiChannel = (code: GameCode): `emoji:${GameCode}` =>
  `emoji:${code}`;

export const publishEmoji = (
  code: GameCode,
  payload: { emoji: ReactionEmoji; targetPlayerId: UserId; id: number },
) => {
  emitter.emit(getEmojiChannel(code), payload);
};
