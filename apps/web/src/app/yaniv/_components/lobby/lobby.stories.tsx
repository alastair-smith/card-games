import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from 'storybook/test';
import {
  MAX_NAME_LENGTH,
  type PlayerName,
  type UserId,
} from '~/types/entities';
import type { GameCode, Player } from '~/types/game';
import { DEFAULT_SETTINGS } from '~/types/games/yaniv';
import LobbyView from './lobby.view';

const longName = 'W'.repeat(MAX_NAME_LENGTH) as PlayerName;

const host: Player = {
  id: 'user-1' as UserId,
  name: 'Frank' as PlayerName,
  color: 'cyan',
  isReady: false,
  isUser: true,
  isHost: true,
};

const meta = {
  title: 'Yaniv / Lobby',
  component: LobbyView,
  parameters: { isFullScreen: true },
  decorators: [
    (Story) => (
      <div className='not-prose'>
        <Story />
      </div>
    ),
  ],
  args: {
    code: 'ABCDEF' as GameCode,
    players: [host],
    settings: DEFAULT_SETTINGS,
    user: { isReady: false, name: 'Frank', nameError: '', color: 'cyan' },
    handleNameChange: fn(),
    handleReadyChange: fn(),
    handleColorChange: fn(),
    handleSettingChange: fn(),
    handleStartGame: fn(),
    handleLeave: fn(),
    handleKick: fn(),
    handleMakeHost: fn(),
  },
} satisfies Meta<typeof LobbyView>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Host: Story = {};

// The tallest the lobby gets: every seat taken, each name at its longest.
export const FullWithLongestNames: Story = {
  args: {
    players: [
      { ...host, name: longName, isReady: true },
      ...(['rose', 'lime', 'amber', 'plum'] as const).map(
        (color, index): Player => ({
          id: `user-${index + 2}` as UserId,
          name: longName,
          color,
          isReady: true,
          isUser: false,
          isHost: false,
        }),
      ),
    ],
    user: { isReady: true, name: longName, nameError: '', color: 'cyan' },
  },
};
