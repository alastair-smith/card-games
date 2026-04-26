import { useMemo, useState } from 'react';
import type { YanivPlayingCard } from '~/types/games/yaniv';

export function useDrawnCardVisibility(
  drawnCard: YanivPlayingCard | undefined,
  cards: YanivPlayingCard[],
) {
  const [dismissedCard, setDismissedCard] = useState<YanivPlayingCard | null>(
    null,
  );

  const isShownInOverlay =
    !!drawnCard &&
    !(
      dismissedCard?.rank === drawnCard.rank &&
      dismissedCard?.suit === drawnCard.suit
    );

  const visibleCards = useMemo(
    () =>
      isShownInOverlay && drawnCard
        ? cards.filter(
            (card) =>
              card.rank !== drawnCard.rank || card.suit !== drawnCard.suit,
          )
        : cards,
    [cards, drawnCard, isShownInOverlay],
  );

  function onOverlayDismissed() {
    if (drawnCard) setDismissedCard(drawnCard);
  }

  return { visibleCards, onOverlayDismissed };
}
