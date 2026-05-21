'use client';

import { useEffect } from 'react';
import GameLayout from '~/components/layout/game-layout';
import { recordClientError } from '~/telemetry/errors';
import { GameType } from '~/types/game';

export default function ErrorPage({
  error,
}: {
  error: Error & { digest?: string };
}) {
  useEffect(() => {
    recordClientError(error, 'error.boundary');
  }, [error]);

  return (
    <GameLayout gameType={GameType.HIGH_CARD}>
      <div>error</div>
    </GameLayout>
  );
}
