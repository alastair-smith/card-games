'use client';

import { type CSSProperties, useEffect, useRef, useState } from 'react';
import { PlayingCard } from '~/components/ui/playing-card';
import {
  PlayingCardDeck,
  PlayingCardDiscardPile,
  PlayingCardStack,
} from '~/components/ui/playing-card-stacks';
import type { PlayingCardValue } from '~/types/cards';
import type { YanivPlayingCard } from '~/types/games/yaniv';
import { cn } from '~/utils/cn';
import { type PlayerColor, playerColorHighlight } from '~/utils/player-color';

type PlayAreaProps = {
  className?: string;
  color: PlayerColor;
  discardCard: PlayingCardValue | null;
  playedCards: PlayingCardValue[];
  onDiscardClick?: (() => void) | undefined;
  onDeckClick?: (() => void) | undefined;
  isActive?: boolean;
  drawnCard?: YanivPlayingCard | undefined;
  canAutoPlay?: boolean | undefined;
  onAutoPlayDrawnCard?: (() => void) | undefined;
  onDrawnCardDismissed?: () => void;
};

export default function PlayArea({
  className,
  color,
  discardCard,
  playedCards,
  onDiscardClick,
  onDeckClick,
  isActive,
  drawnCard,
  canAutoPlay,
  onAutoPlayDrawnCard,
  onDrawnCardDismissed,
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
        onDrawnCardDismissed?.();
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
        style={
          { '--color-highlight': playerColorHighlight(color) } as CSSProperties
        }
        className={cn(
          'flex gap-3 items-center rounded-lg p-2',
          isActive ? 'animate-pulse-bg' : '',
        )}
      >
        <PlayingCardDeck
          onClick={isActive && !showOverlay ? onDeckClick : undefined}
          drawnCardDisplay={showOverlay ? displayedCard : undefined}
          onDrawnCardClick={handleDrawnCardClick}
          drawnCardClassName={exitClassName}
          ariaLabel='Draw from deck'
          topCardHighlighted={canAutoPlay}
        />
        <PlayingCardDiscardPile>
          {discardCard && (
            <PlayingCard
              card={discardCard}
              onClick={isActive ? onDiscardClick : undefined}
            />
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
