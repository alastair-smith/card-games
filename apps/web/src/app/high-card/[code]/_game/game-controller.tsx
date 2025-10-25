'use client';

import { api } from '~/trpc/react';
import type { GameCode } from '~/types/game';
import type { GameState } from '~/types/games/high-card';
import HighCardGameView from './game-view';

export default function HighCardGameController({
  code,
  state,
}: {
  code: GameCode;
  state: GameState;
}) {
  const pickupCardMutation = api.highCard.pickupCard.useMutation();

  return (
    <HighCardGameView
      state={state}
      pickupCard={() => {
        pickupCardMutation.mutate({ code });
      }}
    />
  );
}
