'use client';

import GameSettings from '~/app/yaniv/_components/game-settings';
import { HowTo, HowToDialog } from '~/app/yaniv/_components/how-to';
import GameLayout from '~/components/layout/game-layout';
import InvitePlayers from '~/components/lobby/invite-players';
import Players from '~/components/lobby/players.view';
import { Card, CardContent, CardHeader } from '~/components/ui/card';
import type { UserId } from '~/types/entities';
import { type GameCode, GameType, type Player } from '~/types/game';
import {
  MAX_PLAYERS,
  MIN_PLAYERS,
  type Settings,
  type SettingUpdate,
} from '~/types/games/yaniv';
import type { PlayerColor } from '~/utils/player-color';

export type LobbyProps = {
  code: GameCode;
  players: Player[];
  settings: Settings;
  user: {
    isReady: boolean;
    name: string;
    nameError: string;
    color: PlayerColor;
  };
  handleNameChange: (name: string) => void;
  handleReadyChange: (readyStatus: boolean) => void;
  handleColorChange: (color: string) => void;
  handleSettingChange: (update: SettingUpdate) => void;
  handleStartGame: () => void;
  handleLeave: (userId: UserId) => void;
  handleKick: (userId: UserId) => void;
  handleMakeHost: (userId: UserId) => void;
};

export default function LobbyView({
  code,
  settings,
  handleSettingChange,
  ...playerProps
}: LobbyProps) {
  const isHost = playerProps.players.some(
    ({ isHost: isPlayerHost, isUser }) => isPlayerHost && isUser,
  );

  return (
    <GameLayout
      gameType={GameType.YANIV}
      className='pb-8 lg:pb-3'
      actions={
        // Smaller screens show the rules in the lobby instead
        <div className='hidden lg:block'>
          <HowToDialog />
        </div>
      }
    >
      <div className='grid w-full grid-cols-1 gap-3 lg:grid-cols-2 lg:items-start'>
        <h1 className='sr-only'>Yaniv Lobby</h1>
        <div className='flex flex-col gap-3'>
          <InvitePlayers code={code} className='w-full' />
          <Players
            className='flex-1'
            minPlayers={MIN_PLAYERS}
            maxPlayers={MAX_PLAYERS}
            {...playerProps}
          />
        </div>
        <div className='flex flex-col gap-3'>
          <GameSettings
            className='w-full'
            settings={settings}
            isHost={isHost}
            onSettingChange={handleSettingChange}
          />
          <Card className='lg:hidden'>
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
