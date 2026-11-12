import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, screen, userEvent, within } from 'storybook/test';
import HowToCard from './how-to-card';

const meta = {
  title: 'Lobby / How To Play',
  component: HowToCard,
  args: { className: 'max-w-xl' },
} satisfies Meta<typeof HowToCard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const HowToPlay: Story = {};

export const RulesOpen: Story = {
  play: async ({ canvasElement }) => {
    await userEvent.click(
      within(canvasElement).getByRole('button', { name: 'How to play' }),
    );

    await expect(
      screen.getByRole('dialog', { name: 'How to play Yaniv' }),
    ).toBeInTheDocument();
  },
};
