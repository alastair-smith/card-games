import type { CSSProperties } from 'react';
import { PlayingCard } from '~/components/ui/playing-card';
import type { YanivPlayingCard } from '~/types/games/yaniv';
import { cn } from '~/utils/cn';
import { type PlayerColor, playerColorHighlight } from '~/utils/player-color';
import { sortYanivHand } from '~/utils/yaniv/sort';
import { HandSummary } from '../hand-summary';
import { ToggleVisibilityButton } from '../toggle-visibility-button';

type HandCard = YanivPlayingCard & { selected?: boolean; hidden?: boolean };

type HandProps = {
  className?: string;
  color: PlayerColor;
  cards: HandCard[];
  handTotal: number;
  isFiftyScoreHalved: boolean;
  totalScore: number;
  isActive: boolean;
  isFaceDown: boolean;
  onCardClick?: ((card: HandCard) => void) | undefined;
  onVisibilityToggle: () => void;
};

/**
 * Your cards and where you stand. Phones show it in its own tab, which keeps
 * it private; larger screens show it under the table, with a button to turn
 * the cards face down.
 */
export function Hand({
  className,
  color,
  cards,
  handTotal,
  isFiftyScoreHalved,
  totalScore,
  isActive,
  isFaceDown,
  onCardClick,
  onVisibilityToggle,
}: HandProps) {
  const sortedCards = sortYanivHand(cards.filter((card) => !card.hidden));

  return (
    <div
      style={
        { '--color-highlight': playerColorHighlight(color) } as CSSProperties
      }
      className={cn(
        'flex flex-col gap-2 rounded-lg border-2 border-white/30 bg-black/20 p-2',
        isActive && 'animate-pulse-bg',
        className,
      )}
    >
      <div className='flex items-center justify-between gap-2'>
        <HandSummary
          className='flex-1'
          handTotal={handTotal}
          isHandTotalHidden={isFaceDown}
          totalScore={totalScore}
          isFiftyScoreHalved={isFiftyScoreHalved}
        />
        <ToggleVisibilityButton
          className='hidden lg:flex'
          isFaceDown={isFaceDown}
          onClick={onVisibilityToggle}
        />
      </div>
      <ol
        aria-label='Your hand'
        // A step up from the play area's cards on phones, where the hand has
        // its own tab to fill; the same as the play area from md up
        className='m-0 flex list-none flex-wrap justify-center gap-2 p-0 pt-[0.4em] text-lg md:text-2xl'
      >
        {sortedCards.map((card) => (
          <li key={`${card.suit}-${card.rank}`} className='flex'>
            <PlayingCard
              card={isFaceDown ? null : card}
              highlighted={card.selected && !isFaceDown}
              onClick={
                onCardClick && !isFaceDown ? () => onCardClick(card) : undefined
              }
            />
          </li>
        ))}
      </ol>
    </div>
  );
}
