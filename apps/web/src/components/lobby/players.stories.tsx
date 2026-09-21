import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from 'storybook/test';
import {
  MAX_NAME_LENGTH,
  type PlayerName,
  type UserId,
} from '~/types/entities';
import Players, { type PlayersProps } from './players.view';

type Player = PlayersProps['players'][number];

const player = (
  id: string,
  name: string,
  {
    isReady = false,
    isUser = false,
    isHost = false,
  }: Partial<Pick<Player, 'isReady' | 'isUser' | 'isHost'>> = {},
): Player => ({
  id: id as UserId,
  name: name as PlayerName,
  color: 'cyan',
  isReady,
  isUser,
  isHost,
});

const longName = Array.from({ length: MAX_NAME_LENGTH })
  .map(() => 'W')
  .join('') as PlayerName;

const meta = {
  title: 'Lobby / Players',
  component: Players,
  args: {
    players: [player('1', 'Frank', { isUser: true, isHost: true })],
    minPlayers: 4,
    maxPlayers: 6,
    user: {
      isReady: false,
      name: 'Frank',
      nameError: '',
    },
    handleNameChange: fn(),
    handleReadyChange: fn(),
    handleColorChange: fn(),
    handleStartGame: fn(),
    handleKick: fn(),
    handleLeave: fn(),
    handleMakeHost: fn(),
  },
} satisfies Meta<typeof Players>;

export default meta;

type Story = StoryObj<typeof meta>;

export const MinPlayersNotMet: Story = {};

export const MinPlayersMet: Story = {
  args: {
    players: [
      player('1', 'Frank', { isHost: true }),
      player('2', 'Roz', { isUser: true }),
    ],
    minPlayers: 2,
    maxPlayers: 3,
    user: { isReady: false, name: 'Roz', nameError: '' },
  },
};

export const MaxPlayers: Story = {
  args: {
    players: [
      player('1', 'Frank', { isHost: true }),
      player('2', 'Roz', { isUser: true }),
      player('3', 'Niles'),
    ],
    minPlayers: 2,
    maxPlayers: 3,
    user: { isReady: false, name: 'Roz', nameError: '' },
  },
};

export const SomePlayersReady: Story = {
  args: {
    players: [
      player('1', 'Frank', { isReady: true, isUser: true, isHost: true }),
      player('2', 'Roz', { isReady: true }),
      player('3', 'Niles'),
    ],
    minPlayers: 2,
    maxPlayers: 3,
    user: { isReady: true, name: 'Frank', nameError: '' },
  },
};

export const AllPlayersReadyIsHost: Story = {
  args: {
    players: [
      player('1', 'Frank', { isReady: true, isUser: true, isHost: true }),
      player('2', 'Roz', { isReady: true }),
      player('3', 'Niles', { isReady: true }),
    ],
    minPlayers: 2,
    maxPlayers: 3,
    user: { isReady: true, name: 'Frank', nameError: '' },
  },
};

export const AllPlayersReadyIsNotHost: Story = {
  args: {
    players: [
      player('1', 'Frank', { isReady: true, isHost: true }),
      player('2', 'Roz', { isReady: true, isUser: true }),
      player('3', 'Niles', { isReady: true }),
    ],
    minPlayers: 2,
    maxPlayers: 3,
    user: { isReady: true, name: 'Roz', nameError: '' },
  },
};

export const AllPlayersReadyButNotEnough: Story = {
  args: {
    players: [
      player('1', 'Frank', { isReady: true, isUser: true, isHost: true }),
    ],
    minPlayers: 2,
    maxPlayers: 3,
    user: { isReady: true, name: 'Frank', nameError: '' },
  },
};

export const NameError: Story = {
  args: {
    players: [
      player('1', 'Frank', { isReady: true, isUser: true, isHost: true }),
    ],
    minPlayers: 2,
    maxPlayers: 3,
    user: { isReady: true, name: '', nameError: 'Min length not met' },
  },
};

export const LongPlayerNames: Story = {
  args: {
    players: [
      player('1', longName, { isReady: true, isUser: true, isHost: true }),
      player('2', longName, { isReady: true }),
      player('3', longName, { isReady: true }),
    ],
    minPlayers: 2,
    maxPlayers: 3,
    user: { isReady: true, name: longName, nameError: '' },
  },
};
