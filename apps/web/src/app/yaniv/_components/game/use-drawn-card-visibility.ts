import { useState } from 'react';
import type { YanivPlayingCard } from '~/types/games/yaniv';

export function useDrawnCardVisibility(
  drawnCard: YanivPlayingCard | undefined,
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

  function onOverlayDismissed() {
    if (drawnCard) setDismissedCard(drawnCard);
  }

  return { isShownInOverlay, onOverlayDismissed };
}
