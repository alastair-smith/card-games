import { action } from '@ladle/react';
import {
  MAX_NAME_LENGTH,
  type PlayerName,
  type UserId,
} from '~/types/entities';
import Players, { type PlayersProps } from './players.view';

const handlers = {
  handleNameChange: action('handleNameChange'),
  handleReadyChange: action('handleReadyChange'),
  handleColorChange: action('handleColorChange'),
  handleStartGame: action('handleStartGame'),
  handleKick: action('handleKick'),
  handleLeave: action('handleLeave'),
  handleMakeHost: action('handleMakeHost'),
} as const satisfies Partial<PlayersProps>;

export const MinPlayersNotMet = () => (
  <Players
    players={[
      {
        id: '1' as UserId,
        name: 'Frank' as PlayerName,
        color: 'hsl(210 70% 48%)',
        isReady: false,
        isUser: true,
        isHost: true,
      },
    ]}
    minPlayers={4}
    maxPlayers={6}
    user={{
      isReady: false,
      name: 'Frank',
      nameError: '',
    }}
    {...handlers}
  />
);

export const MinPlayersMet = () => (
  <Players
    players={[
      {
        id: '1' as UserId,
        name: 'Frank' as PlayerName,
        color: 'hsl(210 70% 48%)',
        isReady: false,
        isUser: false,
        isHost: true,
      },
      {
        id: '2' as UserId,
        name: 'Roz' as PlayerName,
        color: 'hsl(210 70% 48%)',
        isReady: false,
        isUser: true,
        isHost: false,
      },
    ]}
    minPlayers={2}
    maxPlayers={3}
    user={{
      isReady: false,
      name: 'Roz',
      nameError: '',
    }}
    {...handlers}
  />
);

export const MaxPlayers = () => (
  <Players
    players={[
      {
        id: '1' as UserId,
        name: 'Frank' as PlayerName,
        color: 'hsl(210 70% 48%)',
        isReady: false,
        isUser: false,
        isHost: true,
      },
      {
        id: '2' as UserId,
        name: 'Roz' as PlayerName,
        color: 'hsl(210 70% 48%)',
        isReady: false,
        isUser: true,
        isHost: false,
      },
      {
        id: '3' as UserId,
        name: 'Niles' as PlayerName,
        color: 'hsl(210 70% 48%)',
        isReady: false,
        isUser: false,
        isHost: false,
      },
    ]}
    minPlayers={2}
    maxPlayers={3}
    user={{
      isReady: false,
      name: 'Roz',
      nameError: '',
    }}
    {...handlers}
  />
);

export const SomePlayersReady = () => (
  <Players
    players={[
      {
        id: '1' as UserId,
        name: 'Frank' as PlayerName,
        color: 'hsl(210 70% 48%)',
        isReady: true,
        isUser: true,
        isHost: true,
      },
      {
        id: '2' as UserId,
        name: 'Roz' as PlayerName,
        color: 'hsl(210 70% 48%)',
        isReady: true,
        isUser: false,
        isHost: false,
      },
      {
        id: '3' as UserId,
        name: 'Niles' as PlayerName,
        color: 'hsl(210 70% 48%)',
        isReady: false,
        isUser: false,
        isHost: false,
      },
    ]}
    minPlayers={2}
    maxPlayers={3}
    user={{
      isReady: true,
      name: 'Frank',
      nameError: '',
    }}
    {...handlers}
  />
);

export const AllPlayersReadyIsHost = () => (
  <Players
    players={[
      {
        id: '1' as UserId,
        name: 'Frank' as PlayerName,
        color: 'hsl(210 70% 48%)',
        isReady: true,
        isUser: true,
        isHost: true,
      },
      {
        id: '2' as UserId,
        name: 'Roz' as PlayerName,
        color: 'hsl(210 70% 48%)',
        isReady: true,
        isUser: false,
        isHost: false,
      },
      {
        id: '3' as UserId,
        name: 'Niles' as PlayerName,
        color: 'hsl(210 70% 48%)',
        isReady: true,
        isUser: false,
        isHost: false,
      },
    ]}
    minPlayers={2}
    maxPlayers={3}
    user={{
      isReady: true,
      name: 'Frank',
      nameError: '',
    }}
    {...handlers}
  />
);

export const AllPlayersReadyIsNotHost = () => (
  <Players
    players={[
      {
        id: '1' as UserId,
        name: 'Frank' as PlayerName,
        color: 'hsl(210 70% 48%)',
        isReady: true,
        isUser: false,
        isHost: true,
      },
      {
        id: '2' as UserId,
        name: 'Roz' as PlayerName,
        color: 'hsl(210 70% 48%)',
        isReady: true,
        isUser: true,
        isHost: false,
      },
      {
        id: '3' as UserId,
        name: 'Niles' as PlayerName,
        color: 'hsl(210 70% 48%)',
        isReady: true,
        isUser: false,
        isHost: false,
      },
    ]}
    minPlayers={2}
    maxPlayers={3}
    user={{
      isReady: true,
      name: 'Roz',
      nameError: '',
    }}
    {...handlers}
  />
);

export const AllPlayersReadyButNotEnough = () => (
  <Players
    players={[
      {
        id: '1' as UserId,
        name: 'Frank' as PlayerName,
        color: 'hsl(210 70% 48%)',
        isReady: true,
        isUser: true,
        isHost: true,
      },
    ]}
    minPlayers={2}
    maxPlayers={3}
    user={{
      isReady: true,
      name: 'Frank',
      nameError: '',
    }}
    {...handlers}
  />
);

export const NameError = () => (
  <Players
    players={[
      {
        id: '1' as UserId,
        name: 'Frank' as PlayerName,
        color: 'hsl(210 70% 48%)',
        isReady: true,
        isUser: true,
        isHost: true,
      },
    ]}
    minPlayers={2}
    maxPlayers={3}
    user={{
      isReady: true,
      name: '',
      nameError: 'Min length not met',
    }}
    {...handlers}
  />
);

const longName = Array.from({ length: MAX_NAME_LENGTH })
  .map(() => 'W')
  .join('') as PlayerName;

export const LongPlayerNames = () => (
  <Players
    players={[
      {
        id: '1' as UserId,
        name: longName,
        color: 'hsl(210 70% 48%)',
        isReady: true,
        isUser: true,
        isHost: true,
      },
      {
        id: '2' as UserId,
        name: longName,
        color: 'hsl(210 70% 48%)',
        isReady: true,
        isUser: false,
        isHost: false,
      },
      {
        id: '3' as UserId,
        name: longName,
        color: 'hsl(210 70% 48%)',
        isReady: true,
        isUser: false,
        isHost: false,
      },
    ]}
    minPlayers={2}
    maxPlayers={3}
    user={{
      isReady: true,
      name: longName,
      nameError: '',
    }}
    {...handlers}
  />
);
