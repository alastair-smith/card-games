'use client';

import { HowTo } from '~/app/yaniv/_components/how-to';
import GameLayout from '~/components/layout/game-layout';
import InvitePlayers from '~/components/lobby/invite-players';
import Players from '~/components/lobby/players.view';
import { Card, CardContent, CardHeader } from '~/components/ui/card';
import type { UserId } from '~/types/entities';
import { type GameCode, GameType, type Player } from '~/types/game';
import { MAX_PLAYERS, MIN_PLAYERS } from '~/types/games/yaniv';

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

export default function LobbyView({ code, ...playerProps }: LobbyProps) {
  return (
    <GameLayout
      gameType={GameType.YANIV}
      className='flex flex-col justify-center pb-8'
    >
      <div className='grid w-full grid-cols-[repeat(auto-fit,minmax(20rem,1fr))] gap-3'>
        <h1 className='sr-only'>Yaniv Lobby</h1>
        <InvitePlayers code={code} className='w-full' />
        <Players
          className='row-span-2'
          minPlayers={MIN_PLAYERS}
          maxPlayers={MAX_PLAYERS}
          {...playerProps}
        />
        <Card className='w-full'>
          <CardHeader>
            <h2 className='text-xl font-semibold'>How to play Yaniv</h2>
          </CardHeader>
          <CardContent>
            <HowTo />
          </CardContent>
        </Card>
      </div>
    </GameLayout>
  );
}
