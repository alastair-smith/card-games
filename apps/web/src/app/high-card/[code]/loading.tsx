'use client';

import GameLayout from '~/components/layout/game-layout';
import LoadingSpinner from '~/components/loading';
import { GameType } from '~/types/game';

export default function Loading() {
  return (
    <GameLayout gameType={GameType.HIGH_CARD}>
      <LoadingSpinner />
    </GameLayout>
  );
}
