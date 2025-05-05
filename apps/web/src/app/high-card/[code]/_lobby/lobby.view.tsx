'use client';

import { GameCode, GameType, Player } from "@/types/game";
import { HowToSection } from "../_about/how-to";
import InvitePlayers from "@/components/lobby/invite-players";
import Players from "@/components/lobby/players.view";
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
    <div className='flex flex-row justify-center w-full items-center min-h-full'>
      <div className="w-full flex flex-row flex-wrap gap-3 justify-center max-w-[80rem]">
        <h1 className="sr-only">High Card Lobby</h1>
        <div className='flex flex-col gap-3 min-w-[20rem] flex-1 basis-[30rem]'>
          <InvitePlayers code={code} className="w-full" />
          <HowToSection className='flex-1 w-full' />
        </div>
        <Players className='flex-1 min-w-[20rem] basis-[30rem]' minPlayers={MIN_PLAYERS} maxPlayers={MAX_PLAYERS} {...playerProps} />
      </div>
    </div>
  )
}
