import {
  PlayerTag,
  PlayerTagCardCount,
  type PlayerTagEmojiReaction,
  PlayerTagName,
  PlayerTagReaction,
  PlayerTagUserIcon,
} from '~/components/player-tag';
import type { PlayerName } from '~/types/entities';
import type { FinishingPosition, TableCardSlot } from '~/types/games/shithead';
import { cn } from '~/utils/cn';
import type { PlayerColor } from '~/utils/player-color';
import { FINISHING_POSITIONS } from '~/utils/shithead/finishing-positions';
import { TableCards } from '../table-cards';

type PlayerAreaProps = {
  className?: string | undefined;
  name: PlayerName;
  color: PlayerColor;
  cardCount: number;
  isUser: boolean;
  isPlayersTurn: boolean;
  emojiReaction?: PlayerTagEmojiReaction | undefined;
  tableCards: TableCardSlot[];
  finishingPosition: FinishingPosition | null;
};

/** A player's tag above their cards on the table, or where they finished. */
export function PlayerArea({
  className,
  name,
  color,
  cardCount,
  isUser,
  isPlayersTurn,
  emojiReaction,
  tableCards,
  finishingPosition,
}: PlayerAreaProps) {
  const isFinished = finishingPosition !== null;

  return (
    <div className={cn('flex w-fit flex-col items-center gap-2', className)}>
      <PlayerTag color={color} isPlayersTurn={isPlayersTurn}>
        {isUser && <PlayerTagUserIcon />}
        <PlayerTagName>{name}</PlayerTagName>
        <PlayerTagCardCount cardCount={isFinished ? null : cardCount} />
        <PlayerTagReaction emojiReaction={emojiReaction} />
      </PlayerTag>
      {isPlayersTurn && <span className='sr-only'>, their turn</span>}
      <div className='relative'>
        <TableCards slots={tableCards} />
        {isFinished && <FinishedBadge position={finishingPosition} />}
      </div>
    </div>
  );
}

function FinishedBadge({ position }: { position: FinishingPosition }) {
  const { label, medal } = FINISHING_POSITIONS[position];

  return (
    <div className='absolute inset-0 flex flex-col items-center justify-center font-black text-white text-outline-black'>
      {medal && (
        <span aria-hidden='true' className='text-3xl sm:text-5xl'>
          {medal}
        </span>
      )}
      <span className='text-xl sm:text-3xl'>
        <span className='sr-only'>Finished </span>
        {label}
      </span>
    </div>
  );
}
