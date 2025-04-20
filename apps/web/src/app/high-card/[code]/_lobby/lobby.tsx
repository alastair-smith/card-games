'use client';

import { GameCode, GameType } from "@/types/game";
import { Players } from "../../../_components/lobby/players";
import { HowToSection } from "../_about/how-to";

type Lobby = {};

export default function Lobby({ lobby, code }: { lobby: Lobby, code: GameCode }) {
  return (
    <div className="flex w-full flex-wrap gap-6">
      <h1 className="sr-only">High Card Lobby</h1>
      <GameInfo code={code} />
      <HowToSection />
      <LobbyPlayers />
    </div>
  )
}
