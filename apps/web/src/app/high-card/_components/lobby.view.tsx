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
    <GameLayout
      gameType={GameType.HIGH_CARD}
      className='flex flex-col justify-center pb-8'
    >
      <div className='grid w-full grid-cols-[repeat(auto-fit,minmax(20rem,1fr))] gap-3'>
        <h1 className='sr-only'>High Card Lobby</h1>
        <InvitePlayers code={code} className='w-full' />
        <Players
          className='row-span-2'
          minPlayers={MIN_PLAYERS}
          maxPlayers={MAX_PLAYERS}
          {...playerProps}
        />
        <HowToSection className='w-full' />
      </div>
    </GameLayout>
  );
}
