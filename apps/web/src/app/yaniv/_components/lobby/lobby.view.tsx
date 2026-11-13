'use client';

import GameSettings from '~/app/yaniv/_components/game-settings';
import { HowToDialog } from '~/app/yaniv/_components/how-to';
import LobbyView, {
  type GameLobbyViewProps,
} from '~/components/lobby/lobby-view';
import { GameType } from '~/types/game';
import {
  MAX_PLAYERS,
  MIN_PLAYERS,
  type Settings,
  type SettingUpdate,
} from '~/types/games/yaniv';

export type YanivLobbyViewProps = GameLobbyViewProps & {
  settings: Settings;
  onSettingChange: (update: SettingUpdate) => void;
};

export default function YanivLobbyView({
  settings,
  onSettingChange,
  ...lobbyProps
}: YanivLobbyViewProps) {
  const isHost = lobbyProps.players.some(
    ({ isHost: isPlayerHost, isUser }) => isPlayerHost && isUser,
  );

  return (
    <LobbyView
      gameType={GameType.YANIV}
      minPlayers={MIN_PLAYERS}
      maxPlayers={MAX_PLAYERS}
      actions={<HowToDialog />}
      {...lobbyProps}
    >
      <GameSettings
        className='w-full'
        settings={settings}
        isHost={isHost}
        onSettingChange={onSettingChange}
      />
    </LobbyView>
  );
}
