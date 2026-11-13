import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from 'storybook/test';
import { Card } from '~/components/ui/card';
import { buildPlayer } from '~/test-utils/lobby';
import type { PlayerName, UserId } from '~/types/entities';
import ReadyBar from './ready-bar';

const frank = buildPlayer({
  name: 'Frank' as PlayerName,
  isUser: true,
  isHost: true,
});
const roz = buildPlayer({
  id: 'user-2' as UserId,
  name: 'Roz' as PlayerName,
  color: 'rose',
});
const niles = buildPlayer({
  id: 'user-3' as UserId,
  name: 'Niles' as PlayerName,
  color: 'lime',
});

const meta = {
  title: 'Lobby / Ready Bar',
  component: ReadyBar,
  decorators: [
    (Story) => (
      <Card variant='panel' className='not-prose p-3'>
        <Story />
      </Card>
    ),
  ],
  args: {
    players: [frank],
    minPlayers: 2,
    name: 'Frank',
    color: 'cyan',
    isReady: false,
    onNameChange: fn(),
    onColorChange: fn(),
    onReadyChange: fn(),
    onStartGame: fn(),
  },
} satisfies Meta<typeof ReadyBar>;

export default meta;

type Story = StoryObj<typeof meta>;

export const NeedsMorePlayers: Story = {};

export const WaitingForPlayers: Story = {
  args: {
    players: [{ ...frank, isReady: true }, { ...roz, isReady: true }, niles],
    isReady: true,
  },
};

export const HostCanStart: Story = {
  args: {
    players: [
      { ...frank, isReady: true },
      { ...roz, isReady: true },
      { ...niles, isReady: true },
    ],
    isReady: true,
  },
};

export const AwaitingHost: Story = {
  args: {
    players: [
      { ...frank, isUser: false, isReady: true },
      { ...roz, isUser: true, isReady: true },
      { ...niles, isReady: true },
    ],
    name: 'Roz',
    color: 'rose',
    isReady: true,
  },
};
