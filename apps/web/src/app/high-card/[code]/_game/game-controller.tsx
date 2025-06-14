'use client';

import HighCardGameView from "./game-view";
import { GameCode } from "@/types/game";
import { api } from "@/trpc/react";
import { GameState } from "@/server/state/game/high-card";

export default function HighCardGameController({ code, state }: { code: GameCode, state: GameState }) {
  const pickupCardMutation = api.highCard.pickupCard.useMutation();

  return <HighCardGameView
    state={state}
    pickupCard={() => { pickupCardMutation.mutate({ code }); }}
  />
}