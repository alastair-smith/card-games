'use client';

import { useId } from 'react';
import GameSettings from '~/app/yaniv/_components/game-settings';
import { HowToDialog } from '~/app/yaniv/_components/how-to';
import GameLayout from '~/components/layout/game-layout';
import InvitePlayers from '~/components/lobby/invite-players';
import Players from '~/components/lobby/players.view';
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
    <Card className='sticky bottom-0 z-10 flex items-center justify-between gap-3 p-3 shadow-lg'>
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
  settings,
  handleSettingChange,
  handleStartGame,
  handleReadyChange,
  ...playerProps
}: LobbyProps) {
  const isHost = playerProps.players.some(
    ({ isHost: isPlayerHost, isUser }) => isPlayerHost && isUser,
  );

  return (
    <GameLayout
      gameType={GameType.YANIV}
      className='gap-3 pb-3'
      actions={<HowToDialog />}
    >
      {/* Positioned so sr-only text scrolls with main rather than stretching the page */}
      <div className='relative grid w-full grid-cols-1 gap-3 lg:grid-cols-2'>
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
        <GameSettings
          className='w-full'
          settings={settings}
          isHost={isHost}
          onSettingChange={handleSettingChange}
        />
      </div>
      <LobbyFooter
        players={playerProps.players}
        isReady={playerProps.user.isReady}
        onReadyChange={handleReadyChange}
        onStartGame={handleStartGame}
      />
    </GameLayout>
  );
}
