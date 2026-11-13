import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from 'storybook/test';
import { Card, CardContent, CardHeader } from '~/components/ui/card';
import { buildPlayer } from '~/test-utils/lobby';
import type { PlayerName } from '~/types/entities';
import { type GameCode, GameType } from '~/types/game';
import LobbyView from '.';

const meta = {
  title: 'Lobby / Lobby View',
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
    gameType: GameType.SHITHEAD,
    code: 'ABCDEF' as GameCode,
    players: [
      buildPlayer({ name: 'Frank' as PlayerName, isUser: true, isHost: true }),
    ],
    minPlayers: 2,
    maxPlayers: 5,
    user: { isReady: false, name: 'Frank', nameError: '', color: 'cyan' },
    onNameChange: fn(),
    onReadyChange: fn(),
    onColorChange: fn(),
    onStartGame: fn(),
    onLeave: fn(),
    onKick: fn(),
    onMakeHost: fn(),
  },
} satisfies Meta<typeof LobbyView>;

export default meta;

type Story = StoryObj<typeof meta>;

export const WithoutSettings: Story = {};

/** A game's settings sit beside the players on larger screens. */
export const WithSettings: Story = {
  args: {
    children: (
      <Card variant='panel'>
        <CardHeader>
          <h2 className='text-xl font-semibold'>Settings</h2>
        </CardHeader>
        <CardContent>The game's settings go here.</CardContent>
      </Card>
    ),
  },
};
