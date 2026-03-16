'use client';

import { useEffect, useRef, useState } from 'react';
import { PlayingCard } from '~/components/ui/playing-card';
import {
  PlayingCardDeck,
  PlayingCardDiscardPile,
  PlayingCardStack,
} from '~/components/ui/playing-card-stacks';
import type { PlayingCardValue } from '~/types/cards';
import type { YanivPlayingCard } from '~/types/games/yaniv';
import { cn } from '~/utils/cn';

type PlayAreaProps = {
  className?: string;
  discardCard: PlayingCardValue | null;
  playedCards: PlayingCardValue[];
  onDiscardClick?: () => void;
  onDeckClick?: () => void;
  isHighlighted?: boolean;
  drawnCard?: YanivPlayingCard;
  canAutoPlay?: boolean;
  onAutoPlayDrawnCard?: () => void;
};

export default function PlayArea({
  className,
  discardCard,
  playedCards,
  onDiscardClick,
  onDeckClick,
  isHighlighted,
  drawnCard,
  canAutoPlay,
  onAutoPlayDrawnCard,
}: PlayAreaProps) {
  const [displayedCard, setDisplayedCard] = useState<YanivPlayingCard | null>(
    null,
  );
  const [exitClassName, setExitClassName] = useState('');
  const [dismissed, setDismissed] = useState(false);
  const exitingRef = useRef(false);

  useEffect(() => {
    if (drawnCard) {
      if (exitingRef.current) return;
      setDismissed(false);
      setDisplayedCard(null);
      setExitClassName('');
      const t = setTimeout(() => setDisplayedCard(drawnCard), 50);
      return () => clearTimeout(t);
    } else if (!exitingRef.current) {
      setDisplayedCard(null);
      setExitClassName('');
    }
  }, [drawnCard]);

  const handleDrawnCardClick = () => {
    if (!displayedCard) return;
    if (canAutoPlay && onAutoPlayDrawnCard) {
      exitingRef.current = true;
      setExitClassName('opacity-0 transition-opacity duration-300');
      onAutoPlayDrawnCard();
      setTimeout(() => {
        exitingRef.current = false;
        setDisplayedCard(null);
        setExitClassName('');
      }, 400);
    } else {
      exitingRef.current = true;
      setExitClassName('translate-y-32 opacity-0 transition-all duration-500');
      setTimeout(() => {
        exitingRef.current = false;
        setDismissed(true);
        setDisplayedCard(null);
        setExitClassName('');
      }, 600);
    }
  };

  const showOverlay = !!drawnCard && !dismissed;

  return (
    <div
      className={cn(
        'flex flex-col gap-3 justify-center items-center',
        className,
      )}
    >
      <div
        className={cn(
          'flex gap-3 items-center rounded-lg p-2',
          isHighlighted ? 'animate-pulse-bg' : '',
        )}
      >
        <PlayingCardDeck
          onClick={showOverlay ? undefined : onDeckClick}
          drawnCardDisplay={showOverlay ? displayedCard : undefined}
          onDrawnCardClick={handleDrawnCardClick}
          drawnCardClassName={exitClassName}
        />
        <PlayingCardDiscardPile>
          {discardCard && (
            <PlayingCard card={discardCard} onClick={onDiscardClick} />
          )}
        </PlayingCardDiscardPile>
      </div>

      <PlayingCardStack>
        {playedCards?.map((card) => (
          <PlayingCard key={`${card.suit}-${card.rank}`} card={card} border />
        ))}
      </PlayingCardStack>
    </div>
  );
}
