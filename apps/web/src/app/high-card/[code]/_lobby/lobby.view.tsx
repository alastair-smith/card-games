'use client';

import { HowToSection } from '~/app/high-card/[code]/_about/how-to';
import InvitePlayers from '~/components/lobby/invite-players';
import Players from '~/components/lobby/players.view';
import type { UserId } from '~/types/entities';
import type { GameCode, Player } from '~/types/game';
import { MAX_PLAYERS, MIN_PLAYERS } from '~/types/games/high-card';

export type LobbyProps = {
  code: GameCode;
  players: Player[];
  user: {
    isReady: boolean;
    name: string;
    nameError: string;
  };
  handleNameChange: (name: string) => void;
  handleReadyChange: (readyStatus: boolean) => void;
  handleStartGame: () => void;
  handleLeave: (userId: UserId) => void;
  handleKick: (userId: UserId) => void;
  handleMakeHost: (userId: UserId) => void;
};

export default function Lobby({ code, ...playerProps }: LobbyProps) {
  return (
    <div className='flex flex-row justify-center w-full items-center h-full'>
      <div className='w-full flex flex-row flex-wrap gap-3 justify-center max-w-[80rem]'>
        <h1 className='sr-only'>High Card Lobby</h1>
        <div className='flex flex-col gap-3 min-w-[20rem] flex-1 basis-[30rem]'>
          <InvitePlayers code={code} className='w-full' />
          <HowToSection className='flex-1 w-full' />
        </div>
        <Players
          className='flex-1 min-w-[20rem] basis-[30rem]'
          minPlayers={MIN_PLAYERS}
          maxPlayers={MAX_PLAYERS}
          {...playerProps}
        />
      </div>
    </div>
  );
}
