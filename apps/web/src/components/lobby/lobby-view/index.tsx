'use client';

import type { ReactNode } from 'react';
import GameLayout from '~/components/layout/game-layout';
import { PageFooter } from '~/components/layout/page';
import InvitePlayers from '~/components/lobby/invite-players';
import LobbyPlayers from '~/components/lobby/lobby-players';
import ReadyBar from '~/components/lobby/ready-bar';
import type { LobbyUser } from '~/components/lobby/use-lobby-player';
import { Card } from '~/components/ui/card';
import type { UserId } from '~/types/entities';
import {
  type GameCode,
  type GameType,
  gameDisplayName,
  gameSummary,
  type Player,
} from '~/types/game';

export type LobbyViewProps = {
  gameType: GameType;
  code: GameCode;
  players: Player[];
  minPlayers: number;
  maxPlayers: number;
  user: LobbyUser;
  actions?: ReactNode;
  /** The game's settings, beside the players on larger screens */
  children?: ReactNode;
  onNameChange: (name: string) => void;
  onColorChange: (color: string) => void;
  onReadyChange: (isReady: boolean) => void;
  onStartGame: () => void;
  onLeave: (userId: UserId) => void;
  onKick: (userId: UserId) => void;
  onMakeHost: (userId: UserId) => void;
};

export default function LobbyView({
  gameType,
  code,
  players,
  minPlayers,
  maxPlayers,
  user,
  actions,
  children,
  onNameChange,
  onColorChange,
  onReadyChange,
  onStartGame,
  onLeave,
  onKick,
  onMakeHost,
}: LobbyViewProps) {
  const readyBar = (
    <ReadyBar
      players={players}
      minPlayers={minPlayers}
      name={user.name}
      color={user.color}
      isReady={user.isReady}
      onNameChange={onNameChange}
      onColorChange={onColorChange}
      onReadyChange={onReadyChange}
      onStartGame={onStartGame}
    />
  );

  const invitePlayers = <InvitePlayers code={code} className='w-full' />;
  const lobbyPlayers = (
    <LobbyPlayers
      className='flex-1'
      players={players}
      minPlayers={minPlayers}
      maxPlayers={maxPlayers}
      onLeave={onLeave}
      onKick={onKick}
      onMakeHost={onMakeHost}
    />
  );

  return (
    <GameLayout
      gameType={gameType}
      actions={actions}
      // Smaller screens keep it in view along the bottom; larger ones fit the
      // whole lobby, so it sits as a card under the others
      footer={<PageFooter className='lg:hidden'>{readyBar}</PageFooter>}
    >
      <div className='grid w-full grid-cols-1 gap-3 lg:grid-cols-2 lg:pb-3'>
        <div className='lg:col-span-2'>
          <h1 className='text-xl font-bold'>
            {gameDisplayName[gameType]} lobby
          </h1>
          <p className='text-sm'>{gameSummary[gameType]}</p>
        </div>
        {children ? (
          <>
            <div className='flex flex-col gap-3'>
              {invitePlayers}
              {lobbyPlayers}
            </div>
            {children}
          </>
        ) : (
          <>
            {invitePlayers}
            {lobbyPlayers}
          </>
        )}
        <Card variant='panel' className='hidden p-3 lg:col-span-2 lg:block'>
          {readyBar}
        </Card>
      </div>
    </GameLayout>
  );
}
