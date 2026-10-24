import type { CSSProperties } from 'react';
import {
  PLAYING_CARD_PROPORTIONS,
  PlayingCard,
} from '~/components/ui/playing-card';
import type { HandSize, YanivPlayingCard } from '~/types/games/yaniv';
import { cn } from '~/utils/cn';
import { type PlayerColor, playerColorHighlight } from '~/utils/player-color';
import { sortYanivHand } from '~/utils/yaniv/sort';
import HandTotal from '../hand-total';

type HandProps = {
  className?: string;
  color: PlayerColor;
  cards: (YanivPlayingCard & { selected?: boolean; hidden?: boolean })[];
  /** Cards dealt at the start of a round, used to reserve space in the hand. */
  handSize: HandSize;
  handTotal: number;
  isFiftyScoreHalved: boolean;
  totalScore: number;
  onCardClick?:
    | ((card: YanivPlayingCard & { selected?: boolean }) => void)
    | undefined;
  isActive?: boolean;
};

export default function Hand({
  className,
  color,
  cards,
  handSize,
  handTotal,
  isFiftyScoreHalved,
  totalScore,
  onCardClick,
  isActive,
}: HandProps) {
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
        {Array.from({ length: Math.max(handSize - sortedCards.length, 0) }).map(
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

      <HandTotal
        color={color}
        handTotal={handTotal}
        isFiftyScoreHalved={isFiftyScoreHalved}
        totalScore={totalScore}
      />
    </div>
  );
}
