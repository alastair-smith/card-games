import type { CSSProperties } from 'react';
import {
  PLAYING_CARD_PROPORTIONS,
  PlayingCard,
} from '~/components/ui/playing-card';
import { HAND_SIZE, type YanivPlayingCard } from '~/types/games/yaniv';
import { cn } from '~/utils/cn';
import {
  type PlayerColor,
  playerColorHighlight,
  playerColorValue,
} from '~/utils/player-color';
import { sortYanivHand } from '~/utils/yaniv/sort';

type HandProps = {
  className?: string;
  color: PlayerColor;
  cards: (YanivPlayingCard & { selected?: boolean; hidden?: boolean })[];
  handTotal: number;
  isFiftyScoreHalved: boolean;
  totalScore: number;
  onCardClick?: (card: YanivPlayingCard & { selected?: boolean }) => void;
  isActive?: boolean;
};

export default function Hand({
  className,
  color,
  cards,
  handTotal,
  isFiftyScoreHalved,
  totalScore,
  onCardClick,
  isActive,
}: HandProps) {
  const scoreNote =
    !isFiftyScoreHalved && totalScore < 50
      ? { target: 50, away: 50 - totalScore }
      : { target: 100, away: 100 - totalScore };

  const sortedCards = sortYanivHand(cards.filter((card) => !card.hidden));

  return (
    <div className={cn('flex gap-2 justify-between items-start', className)}>
      <ol
        aria-label='Your hand'
        style={
          { '--color-highlight': playerColorHighlight(color) } as CSSProperties
        }
        className={cn(
          'flex flex-row flex-wrap gap-2 rounded-lg p-2 list-none',
          isActive ? 'animate-pulse-bg' : '',
        )}
      >
        {sortedCards.map((card) => (
          <li key={`${card.suit}-${card.rank}`} className='flex'>
            <PlayingCard
              card={card}
              highlighted={card.selected}
              onClick={onCardClick ? () => onCardClick(card) : undefined}
            />
          </li>
        ))}
        {Array.from({ length: HAND_SIZE - sortedCards.length }).map(
          (_, index) => (
            <li
              // biome-ignore lint/suspicious/noArrayIndexKey: invisible placeholders
              key={`placeholder-${index}`}
              className={cn(PLAYING_CARD_PROPORTIONS, 'invisible')}
              aria-hidden='true'
            />
          ),
        )}
      </ol>

      <div
        style={{ backgroundColor: playerColorValue(color) }}
        className='flex flex-col rounded p-2 h-fit text-white font-extrabold text-outline-black'
      >
        <div className='flex flex-col items-end'>
          <div>Hand total:</div>
          <output aria-label='Hand total' className='min-w-[2ch] text-2xl'>
            {handTotal}
          </output>
        </div>
        <div className='text-sm flex flex-col items-end'>
          <span>Total score:</span>
          <span>
            {Math.abs(scoreNote.away)}
            {scoreNote.away >= 0 ? ' away from ' : ' beyond '}
            {scoreNote.target}.
          </span>
        </div>
      </div>
    </div>
  );
}
