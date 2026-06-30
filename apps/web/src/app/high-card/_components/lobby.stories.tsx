import { action } from '@ladle/react';
import type { PlayerName, UserId } from '~/types/entities';
import type { GameCode } from '~/types/game';
import Lobby, { type LobbyProps } from './lobby.view';

const handlers = {
  handleNameChange: action('handleNameChange'),
  handleReadyChange: action('handleReadyChange'),
  handleStartGame: action('handleStartGame'),
  handleKick: action('handleKick'),
  handleLeave: action('handleLeave'),
  handleMakeHost: action('handleMakeHost'),
} as const satisfies Partial<LobbyProps>;

export const HighCardLobby = () => {
  return (
    <Lobby
      code={'123456' as GameCode}
      players={[
        {
          id: '1' as UserId,
          name: 'Frank' as PlayerName,
          color: 'cyan',
          isReady: false,
          isUser: true,
          isHost: true,
        },
      ]}
      user={{
        isReady: false,
        name: 'Frank',
        nameError: '',
      }}
      {...handlers}
    />
  );
};
