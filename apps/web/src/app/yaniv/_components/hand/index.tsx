import { PlayingCard } from '~/components/ui/playing-card';
import type { PlayingCardValue } from '~/types/cards';
import { sumYanivHand } from '~/utils/cards';
import { cn } from '~/utils/cn';

type HandProps = {
  className?: string;
  cards: (PlayingCardValue & { selected?: boolean })[];
  isFiftyScoreHalved: boolean;
  isHundredScoreHalved: boolean;
  totalScore: number;
  onCardClick?: (card: PlayingCardValue & { selected?: boolean }) => void;
  isHighlighted?: boolean;
};

export default function Hand({
  className,
  cards,
  isFiftyScoreHalved,
  isHundredScoreHalved,
  totalScore,
  onCardClick,
  isHighlighted,
}: HandProps) {
  const scoreNote =
    !isFiftyScoreHalved && totalScore < 50
      ? { target: 50, away: 50 - totalScore }
      : !isHundredScoreHalved && totalScore < 100
        ? { target: 100, away: 100 - totalScore }
        : { target: 200, away: 200 - totalScore };

  const handTotal = sumYanivHand(cards);

  return (
    <div className={cn('flex gap-2 justify-between items-start', className)}>
      <div
        className={cn(
          'flex flex-row flex-wrap gap-2 rounded-lg p-2',
          isHighlighted ? 'animate-pulse-bg' : '',
        )}
      >
        {cards.map((card) => (
          <PlayingCard
            key={`${card.suit}-${card.rank}`}
            card={card}
            highlighted={card.selected}
            onClick={onCardClick ? () => onCardClick(card) : undefined}
          />
        ))}
      </div>

      <div className='flex flex-col bg-alt-background rounded p-2 h-fit'>
        <div className='flex flex-col items-center'>
          <div>Hand total:</div>
          <div className='min-w-[2ch] text-2xl font-semibold'>{handTotal}</div>
        </div>
        <div className='text-sm'>
          Your total score is{' '}
          <span className='font-semibold'>{scoreNote.away}</span> away from{' '}
          <span className='font-semibold'>{scoreNote.target}.</span>
        </div>
      </div>
    </div>
  );
}
