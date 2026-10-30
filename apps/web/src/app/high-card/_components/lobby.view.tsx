'use client';

import { HowToSection } from '~/app/high-card/_components/how-to';
import GameLayout from '~/components/layout/game-layout';
import InvitePlayers from '~/components/lobby/invite-players';
import Players from '~/components/lobby/players.view';
import type { UserId } from '~/types/entities';
import { type GameCode, GameType, type Player } from '~/types/game';
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
    <GameLayout gameType={GameType.HIGH_CARD} className='pb-8'>
      <div className='flex w-full flex-row flex-wrap justify-center gap-3'>
        <h1 className='sr-only'>High Card Lobby</h1>
        <div className='flex min-w-[20rem] flex-1 basis-120 flex-col gap-3'>
          <InvitePlayers code={code} className='w-full' />
          <HowToSection className='flex-1 w-full' />
        </div>
        <Players
          className='min-w-[20rem] flex-1 basis-120'
          minPlayers={MIN_PLAYERS}
          maxPlayers={MAX_PLAYERS}
          {...playerProps}
        />
      </div>
    </GameLayout>
  );
}
