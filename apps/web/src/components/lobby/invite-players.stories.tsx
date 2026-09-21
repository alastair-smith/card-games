import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import type { GameCode } from '~/types/game';
import InvitePlayersComponent from './invite-players';

const meta = {
  title: 'Lobby / Invite Players',
  component: InvitePlayersComponent,
  args: {
    code: '123456' as GameCode,
  },
} satisfies Meta<typeof InvitePlayersComponent>;

export default meta;

type Story = StoryObj<typeof meta>;

export const InvitePlayers: Story = {};
