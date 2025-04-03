'use client';

import { GameCode, GameType } from "@/types/game";
import { GameInfo } from "./game-info";
import { Players } from "./players";

type LobbyProps = {
  type: GameType,
  code: GameCode
}

export default function Lobby({ type, code }: LobbyProps) {
  return (
    <div className="flex w-full flex-wrap gap-6">
      <h1 className="sr-only">Lobby</h1>
      <GameInfo className="flex-1" code={code} />
      <Players className="flex-1" code={code} />
    </div>
  )
}
