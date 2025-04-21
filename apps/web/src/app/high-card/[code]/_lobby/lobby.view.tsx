'use client';

import { GameCode, GameType } from "@/types/game";
import { HowToSection } from "../_about/how-to";
import InvitePlayers from "@/components/lobby/invite-players";
import Players, { Player } from "@/components/lobby/players.view";
import { UserId } from "@/types/entities";

const MIN_PLAYERS = 2;
const MAX_PLAYERS = 10;

export default function Lobby({
  code,
  ...playerProps
}: {
  code: GameCode;
  players: Player[];
  user: {
    isReady: boolean;
    name: string;
    nameError: string;
  };
  handleNameChange: () => void;
  handleReadyChange: () => void;
  handleStartGame: () => void;
  handleLeave: (userId: UserId) => void;
  handleKick: (userId: UserId) => void;
  handleMakeHost: (userId: UserId) => void;
}) {
  return (
    <div className="flex w-full flex-col flex-wrap gap-6">
      <h1 className="sr-only">High Card Lobby</h1>
      <InvitePlayers code={code} />
      <HowToSection />
      <Players minPlayers={MIN_PLAYERS} maxPlayers={MAX_PLAYERS} {...playerProps} />
    </div>
  )
}
