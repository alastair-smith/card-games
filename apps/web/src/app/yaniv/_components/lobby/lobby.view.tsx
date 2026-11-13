'use client';

import GameSettings from '~/app/yaniv/_components/game-settings';
import { YanivThumbnail } from '~/components/game-thumbnails/yaniv';
import GameLayout from '~/components/layout/game-layout';
import { PageFooter } from '~/components/layout/page';
import InvitePlayers from '~/components/lobby/invite-players';
import LobbyPlayers from '~/components/lobby/lobby-players';
import ReadyBar from '~/components/lobby/ready-bar';
import { Button } from '~/components/ui/button';
import { Card } from '~/components/ui/card';
import type { UserId } from '~/types/entities';
import {
  type GameCode,
  GameType,
  gameSummary,
  type Player,
} from '~/types/game';
import {
  MAX_PLAYERS,
  MIN_PLAYERS,
  type Settings,
  type SettingUpdate,
} from '~/types/games/yaniv';
import type { PlayerColor } from '~/utils/player-color';
import { HowToDialog } from '../how-to';

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
  players,
  settings,
  user,
  handleNameChange,
  handleColorChange,
  handleSettingChange,
  handleStartGame,
  handleReadyChange,
  handleLeave,
  handleKick,
  handleMakeHost,
}: LobbyProps) {
  const isHost = players.some(
    ({ isHost: isPlayerHost, isUser }) => isPlayerHost && isUser,
  );

  const readyBar = (
    <ReadyBar
      players={players}
      minPlayers={MIN_PLAYERS}
      name={user.name}
      color={user.color}
      isReady={user.isReady}
      onNameChange={handleNameChange}
      onColorChange={handleColorChange}
      onReadyChange={handleReadyChange}
      onStartGame={handleStartGame}
    />
  );

  return (
    <GameLayout
      gameType={GameType.YANIV}
      // Smaller screens keep it in view along the bottom; larger ones fit the
      // whole lobby, so it sits as a card under the others
      footer={<PageFooter className='lg:hidden'>{readyBar}</PageFooter>}
    >
      <div className='grid w-full grid-cols-1 gap-3 lg:grid-cols-2'>
        <div className='flex items-center gap-3 lg:col-span-2'>
          <YanivThumbnail className='shrink-0 text-[0.5rem]' />
          <div className='flex-1'>
            <h1 className='text-xl font-bold'>Yaniv lobby</h1>
            <p className='text-sm'>{gameSummary[GameType.YANIV]}</p>
          </div>
          <HowToDialog>
            <Button size='sm' variant='secondary' className='shrink-0'>
              Full rules
            </Button>
          </HowToDialog>
        </div>
        <div className='flex flex-col gap-3'>
          <InvitePlayers code={code} className='w-full' />
          <LobbyPlayers
            className='flex-1'
            players={players}
            minPlayers={MIN_PLAYERS}
            maxPlayers={MAX_PLAYERS}
            onLeave={handleLeave}
            onKick={handleKick}
            onMakeHost={handleMakeHost}
          />
        </div>
        <GameSettings
          className='w-full'
          settings={settings}
          isHost={isHost}
          onSettingChange={handleSettingChange}
        />
        <Card variant='panel' className='hidden p-3 lg:col-span-2 lg:block'>
          {readyBar}
        </Card>
      </div>
    </GameLayout>
  );
}
