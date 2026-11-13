import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, screen, userEvent, within } from 'storybook/test';
import type { GameCode } from '~/types/game';
import InvitePlayersComponent from './invite-players';

const meta = {
  title: 'Lobby / Invite Players',
  component: InvitePlayersComponent,
  args: {
    code: '123456' as GameCode,
    className: 'max-w-xl',
  },
} satisfies Meta<typeof InvitePlayersComponent>;

export default meta;

type Story = StoryObj<typeof meta>;

export const InvitePlayers: Story = {};

export const LargerQrCode: Story = {
  play: async ({ canvasElement }) => {
    await userEvent.click(
      within(canvasElement).getByRole('button', {
        name: 'Show a larger QR code',
      }),
    );

    await expect(
      screen.getByRole('dialog', { name: 'Scan to join' }),
    ).toBeInTheDocument();
  },
};
