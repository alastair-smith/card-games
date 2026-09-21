import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from 'storybook/test';
import type { PlayerName, UserId } from '~/types/entities';
import type { GameCode } from '~/types/game';
import Lobby from './lobby.view';

const meta = {
  title: 'High Card / Lobby',
  component: Lobby,
  parameters: { isFullScreen: true },
  args: {
    code: '123456' as GameCode,
    players: [
      {
        id: '1' as UserId,
        name: 'Frank' as PlayerName,
        color: 'cyan',
        isReady: false,
        isUser: true,
        isHost: true,
      },
    ],
    user: {
      isReady: false,
      name: 'Frank',
      nameError: '',
    },
    handleNameChange: fn(),
    handleReadyChange: fn(),
    handleStartGame: fn(),
    handleKick: fn(),
    handleLeave: fn(),
    handleMakeHost: fn(),
  },
} satisfies Meta<typeof Lobby>;

export default meta;

type Story = StoryObj<typeof meta>;

export const HighCardLobby: Story = {};
