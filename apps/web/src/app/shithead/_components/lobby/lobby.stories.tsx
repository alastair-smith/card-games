import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from 'storybook/test';
import { buildPlayer } from '~/test-utils/lobby';
import {
  MAX_NAME_LENGTH,
  type PlayerName,
  type UserId,
} from '~/types/entities';
import type { GameCode } from '~/types/game';
import ShitheadLobbyView from './lobby.view';

const longName = 'W'.repeat(MAX_NAME_LENGTH) as PlayerName;

const host = buildPlayer({
  name: 'Frank' as PlayerName,
  isUser: true,
  isHost: true,
});

const meta = {
  title: 'Shithead / Lobby',
  component: ShitheadLobbyView,
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
    user: { isReady: false, name: 'Frank', nameError: '', color: 'cyan' },
    onNameChange: fn(),
    onReadyChange: fn(),
    onColorChange: fn(),
    onStartGame: fn(),
    onLeave: fn(),
    onKick: fn(),
    onMakeHost: fn(),
  },
} satisfies Meta<typeof ShitheadLobbyView>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Host: Story = {};

/** Someone else hosts, so Start waits for them. */
export const NotHost: Story = {
  args: {
    players: [
      { ...host, isUser: false, isReady: true },
      buildPlayer({
        id: 'user-2' as UserId,
        name: 'Roz' as PlayerName,
        color: 'rose',
        isUser: true,
      }),
    ],
    user: { isReady: false, name: 'Roz', nameError: '', color: 'rose' },
  },
};

/** The tallest the lobby gets: every seat taken, each name at its longest. */
export const FullWithLongestNames: Story = {
  args: {
    players: [
      { ...host, name: longName, isReady: true },
      ...(['rose', 'lime', 'amber', 'plum'] as const).map((color, index) =>
        buildPlayer({
          id: `user-${index + 2}` as UserId,
          name: longName,
          color,
          isReady: true,
        }),
      ),
    ],
    user: { isReady: true, name: longName, nameError: '', color: 'cyan' },
  },
};
