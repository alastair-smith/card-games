import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from 'storybook/test';
import { buildPlayer } from '~/test-utils/lobby';
import {
  MAX_NAME_LENGTH,
  type PlayerName,
  type UserId,
} from '~/types/entities';
import LobbyPlayers from './lobby-players';

const longName = 'W'.repeat(MAX_NAME_LENGTH) as PlayerName;

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
  title: 'Lobby / Player Tags',
  component: LobbyPlayers,
  args: {
    className: 'max-w-xl',
    players: [frank],
    minPlayers: 2,
    maxPlayers: 5,
    onLeave: fn(),
    onKick: fn(),
    onMakeHost: fn(),
  },
} satisfies Meta<typeof LobbyPlayers>;

export default meta;

type Story = StoryObj<typeof meta>;

export const HostOnTheirOwn: Story = {};

export const SomeReady: Story = {
  args: {
    players: [{ ...frank, isReady: true }, { ...roz, isReady: true }, niles],
  },
};

/** The host has a menu for everyone else. */
export const HostMenu: Story = {
  args: { players: [frank, roz, niles] },
};

/** Players other than the host only have a menu for themselves, to leave. */
export const NotHost: Story = {
  args: {
    players: [
      { ...frank, isUser: false },
      { ...roz, isUser: true, isReady: true },
      niles,
    ],
  },
};

export const FullWithLongestNames: Story = {
  args: {
    players: [
      { ...frank, name: longName, isReady: true },
      { ...roz, name: longName, isReady: true },
      { ...niles, name: longName },
      buildPlayer({
        id: 'user-4' as UserId,
        name: longName,
        color: 'amber',
        isReady: true,
      }),
      buildPlayer({ id: 'user-5' as UserId, name: longName, color: 'plum' }),
    ],
  },
};
