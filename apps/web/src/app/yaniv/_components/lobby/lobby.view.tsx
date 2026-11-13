'use client';

import GameSettings from '~/app/yaniv/_components/game-settings';
import GameLayout from '~/components/layout/game-layout';
import InvitePlayers from '~/components/lobby/invite-players';
import LobbyPlayers from '~/components/lobby/lobby-players';
import ReadyBar from '~/components/lobby/ready-bar';
import type { UserId } from '~/types/entities';
import { type GameCode, GameType, type Player } from '~/types/game';
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

  return (
    <GameLayout
      gameType={GameType.YANIV}
      actions={<HowToDialog />}
      footer={
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
      }
    >
      {/* Positioned so sr-only text scrolls with main rather than stretching the page */}
      <div className='relative grid w-full grid-cols-1 gap-3 lg:grid-cols-2'>
        <h1 className='sr-only'>Yaniv Lobby</h1>
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
      </div>
    </GameLayout>
  );
}
