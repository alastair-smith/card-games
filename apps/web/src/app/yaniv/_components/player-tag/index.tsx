import {
  PlayerTag as BasePlayerTag,
  PlayerTagCardCount,
  PlayerTagName,
  PlayerTagReaction,
  PlayerTagUserIcon,
} from '~/components/player-tag';
import type { EmojiReactionId, PlayerName } from '~/types/entities';
import type { PlayerColor } from '~/utils/player-color';

type PlayerTagProps = {
  name: PlayerName;
  color: PlayerColor;
  cardCount: number;
  isUser: boolean;
  isPlayersTurn: boolean;
  isYanivCalled: boolean;
  emojiReaction?: { emoji: string; id: EmojiReactionId } | undefined;
};

/** A player's tag, with a sticker once they've called Yaniv. */
export function PlayerTag({
  name,
  color,
  cardCount,
  isUser,
  isPlayersTurn,
  isYanivCalled,
  emojiReaction,
}: PlayerTagProps) {
  return (
    <BasePlayerTag color={color} isPlayersTurn={isPlayersTurn}>
      {isUser && <PlayerTagUserIcon />}
      <PlayerTagName>{name}</PlayerTagName>
      <PlayerTagCardCount count={cardCount} />
      {isYanivCalled && (
        <>
          <span
            aria-hidden='true'
            // Above the turn brackets of the tag next to it
            className='absolute -top-3 -right-4 z-10 rotate-12 rounded-sm border-2 border-black bg-true-white px-1 text-xs font-black uppercase text-slate'
          >
            Yaniv!
          </span>
          <span className='sr-only'>, has called Yaniv</span>
        </>
      )}
      <PlayerTagReaction reaction={emojiReaction} />
    </BasePlayerTag>
  );
}
