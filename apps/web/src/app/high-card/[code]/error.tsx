'use client';

import GameLayout from '~/components/layout/game-layout';
import { GameType } from '~/types/game';

export default function ErrorPage() {
  return (
    <GameLayout gameType={GameType.HIGH_CARD}>
      <div>error</div>
    </GameLayout>
  );
}
