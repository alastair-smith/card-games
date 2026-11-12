'use client';

import { useId } from 'react';
import GameSettings from '~/app/yaniv/_components/game-settings';
import { HowToDialog } from '~/app/yaniv/_components/how-to';
import GameLayout from '~/components/layout/game-layout';
import InvitePlayers from '~/components/lobby/invite-players';
import LobbyPlayers from '~/components/lobby/lobby-players';
import StartGameButton from '~/components/lobby/start-game-button';
import { Card } from '~/components/ui/card';
import { Label } from '~/components/ui/label';
import { Switch } from '~/components/ui/switch';
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

function LobbyFooter({
  players,
  isReady,
  onReadyChange,
  onStartGame,
}: {
  players: Player[];
  isReady: boolean;
  onReadyChange: (isReady: boolean) => void;
  onStartGame: () => void;
}) {
  const readySwitchId = useId();

  return (
    <Card
      variant='panel'
      className='sticky bottom-0 z-10 flex items-center justify-between gap-3 p-3 shadow-lg'
    >
      <div className='flex items-center gap-2'>
        <Label htmlFor={readySwitchId}>Ready</Label>
        <Switch
          id={readySwitchId}
          checked={isReady}
          onCheckedChange={onReadyChange}
        />
      </div>
      <StartGameButton
        players={players}
        minPlayers={MIN_PLAYERS}
        onStartGame={onStartGame}
      />
    </Card>
  );
}

export default function LobbyView({
  code,
  players,
  settings,
  user,
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

  return (
    <GameLayout gameType={GameType.YANIV} className='gap-3 pb-3'>
      {/* Positioned so sr-only text scrolls with main rather than stretching the page */}
      <div className='relative grid w-full grid-cols-1 gap-3 lg:grid-cols-2'>
        <h1 className='sr-only'>Yaniv Lobby</h1>
        <div className='flex flex-col gap-3'>
          <InvitePlayers code={code} className='w-full' />
          <LobbyPlayers
            className='flex-1'
            players={players}
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
        <Card
          variant='panel'
          className='flex items-center justify-between gap-3 p-4 lg:col-span-2'
        >
          <h2 className='text-xl font-semibold'>New to Yaniv?</h2>
          <HowToDialog />
        </Card>
      </div>
      <LobbyFooter
        players={players}
        isReady={user.isReady}
        onReadyChange={handleReadyChange}
        onStartGame={handleStartGame}
      />
    </GameLayout>
  );
}
