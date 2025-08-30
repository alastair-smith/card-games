'use client';

import type { GameState } from '~/server/state/game/high-card';
import { api } from '~/trpc/react';
import type { GameCode } from '~/types/game';
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
