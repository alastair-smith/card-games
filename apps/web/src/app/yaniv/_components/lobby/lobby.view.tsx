'use client';

import GameSettings from '~/app/yaniv/_components/game-settings';
import { HowTo } from '~/app/yaniv/_components/how-to';
import GameLayout from '~/components/layout/game-layout';
import InvitePlayers from '~/components/lobby/invite-players';
import Players from '~/components/lobby/players.view';
import { Card, CardContent, CardHeader } from '~/components/ui/card';
import type { UserId } from '~/types/entities';
import { type GameCode, GameType, type Player } from '~/types/game';
import { type HandSize, MAX_PLAYERS, MIN_PLAYERS } from '~/types/games/yaniv';
import type { PlayerColor } from '~/utils/player-color';

export type LobbyProps = {
  code: GameCode;
  players: Player[];
  handSize: HandSize;
  user: {
    isReady: boolean;
    name: string;
    nameError: string;
    color: PlayerColor;
  };
  handleNameChange: (name: string) => void;
  handleReadyChange: (readyStatus: boolean) => void;
  handleColorChange: (color: string) => void;
  handleHandSizeChange: (handSize: string) => void;
  handleStartGame: () => void;
  handleLeave: (userId: UserId) => void;
  handleKick: (userId: UserId) => void;
  handleMakeHost: (userId: UserId) => void;
};

export default function LobbyView({
  code,
  handSize,
  handleHandSizeChange,
  ...playerProps
}: LobbyProps) {
  const isHost = playerProps.players.some(
    ({ isHost: isPlayerHost, isUser }) => isPlayerHost && isUser,
  );

  return (
    <GameLayout
      gameType={GameType.YANIV}
      className='flex flex-col justify-center pb-8'
    >
      <div className='flex w-full flex-row flex-wrap justify-center gap-3'>
        <h1 className='sr-only'>Yaniv Lobby</h1>
        <div className='flex min-w-[20rem] flex-1 basis-120 flex-col gap-3'>
          <InvitePlayers code={code} className='w-full' />
          <Players
            className='flex-1'
            minPlayers={MIN_PLAYERS}
            maxPlayers={MAX_PLAYERS}
            {...playerProps}
          />
        </div>
        <div className='flex min-w-[20rem] flex-1 basis-120 flex-col gap-3'>
          <GameSettings
            className='w-full'
            handSize={handSize}
            isHost={isHost}
            onHandSizeChange={handleHandSizeChange}
          />
          <Card className='flex-1'>
            <CardHeader>
              <h2 className='text-xl font-semibold'>How to Play Yaniv</h2>
            </CardHeader>
            <CardContent>
              <HowTo />
            </CardContent>
          </Card>
        </div>
      </div>
    </GameLayout>
  );
}
