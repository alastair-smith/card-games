'use client';

import { useState } from "react";
import HighCardGameView from "./game-view";
import { GameCode } from "@/types/game";
import { api } from "@/trpc/react";
import { GameState } from "@/server/state/game/high-card";

export default function HighCardGameController({ code }: { code: GameCode }) {
  const [gameState, setGameState] = useState<GameState>();

  api.highCard.subscription.useSubscription({ code },
    { onData: (data) => { setGameState(data) } }
  );
  const pickupCardMutation = api.highCard.pickupCard.useMutation();

  const pickupCard = () => {
    pickupCardMutation.mutate({ code });
  };

  return (
    !!gameState
      ? <HighCardGameView state={gameState} pickupCard={pickupCard} />
      : <div>Loading</div>
  );
}