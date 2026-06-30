import type { CSSProperties } from 'react';
import {
  PLAYING_CARD_PROPORTIONS,
  PlayingCard,
} from '~/components/ui/playing-card';
import { HAND_SIZE, type YanivPlayingCard } from '~/types/games/yaniv';
import { cn } from '~/utils/cn';
import { type PlayerColor, playerColorHighlight } from '~/utils/player-color';
import { sortYanivHand } from '~/utils/yaniv/sort';
import HandTotal from '../hand-total';

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

      <HandTotal
        color={color}
        handTotal={handTotal}
        isFiftyScoreHalved={isFiftyScoreHalved}
        totalScore={totalScore}
      />
    </div>
  );
}
