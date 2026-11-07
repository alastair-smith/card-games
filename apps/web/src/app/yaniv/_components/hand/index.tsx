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
  isHandHidden: boolean;
  onCardClick?: ((card: HandCard) => void) | undefined;
  onVisibilityToggle: () => void;
};

/**
 * Your cards and where you stand. Smaller screens show it in its own tab,
 * which keeps it private; larger screens show it under the table, with a
 * button to turn the cards face down.
 */
export function Hand({
  className,
  color,
  cards,
  handTotal,
  isFiftyScoreHalved,
  totalScore,
  isActive,
  isHandHidden,
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
          isHandTotalHidden={isHandHidden}
          totalScore={totalScore}
          isFiftyScoreHalved={isFiftyScoreHalved}
        />
        <ToggleVisibilityButton
          className='hidden lg:flex'
          isHandHidden={isHandHidden}
          onClick={onVisibilityToggle}
        />
      </div>
      <ol
        aria-label='Your hand'
        // A step up from the play area's cards on smaller screens, where the
        // hand has its own tab to fill; the same as the play area from md up.
        // Smaller on the narrowest screens so a 10-card hand fits, and holds
        // a card's height before the deal
        className='m-0 flex min-h-[5.65em] list-none flex-wrap justify-center gap-1 p-0 pt-[0.4em] text-base min-[360px]:gap-2 min-[360px]:text-lg md:text-2xl'
      >
        {sortedCards.map((card) => (
          <li key={`${card.suit}-${card.rank}`} className='flex'>
            <PlayingCard
              card={isHandHidden ? null : card}
              highlighted={card.selected && !isHandHidden}
              onClick={
                onCardClick && !isHandHidden
                  ? () => onCardClick(card)
                  : undefined
              }
            />
          </li>
        ))}
      </ol>
    </div>
  );
}
