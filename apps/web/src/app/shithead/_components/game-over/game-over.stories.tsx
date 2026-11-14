import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, within } from 'storybook/test';
import { buildClientFinishedPlayer } from '~/test-utils/shithead';
import type { PlayerName, UserId } from '~/types/entities';
import type { FinishingPosition } from '~/types/games/shithead';
import type { PlayerColor } from '~/utils/player-color';
import GameOver from '.';

const player = (
  id: string,
  name: string,
  color: PlayerColor,
  finishingPosition: FinishingPosition,
  isUser = false,
) =>
  buildClientFinishedPlayer({
    id: id as UserId,
    name: name as PlayerName,
    color,
    finishingPosition,
    isUser,
  });

const meta = {
  title: 'Shithead / Game Over',
  component: GameOver,
  parameters: { isFullScreen: true },
  args: {
    // Seat order, so the screen has to sort by finishing position
    players: [
      player('1', 'Al', 'red', 3, true),
      player('2', 'Kevin', 'cyan', 1),
      player('3', 'Paul', 'purple', 4),
      player('4', 'Viola', 'green', 2),
    ],
  },
} satisfies Meta<typeof GameOver>;

export default meta;

type Story = StoryObj<typeof meta>;

export const SomeoneElseWins: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByRole('heading', { name: 'Kevin wins!' }),
    ).toBeVisible();
  },
};

export const YouWin: Story = {
  args: {
    players: [
      player('1', 'Al', 'red', 1, true),
      player('2', 'Kevin', 'cyan', 3),
      player('3', 'Paul', 'purple', 4),
      player('4', 'Viola', 'green', 2),
    ],
  },
};

export const TwoPlayers: Story = {
  args: {
    players: [
      player('1', 'Al', 'red', 2, true),
      player('2', 'Kevin', 'cyan', 1),
    ],
  },
};

/** The worst case for overlaps: 5 players with the longest names. */
export const FivePlayersLongestNames: Story = {
  args: {
    players: [
      player('1', 'WWWWWWWWWWWW', 'red', 5, true),
      player('2', 'MMMMMMMMMMMM', 'cyan', 1),
      player('3', 'Christophers', 'purple', 3),
      player('4', 'WWWWWWWWWWWW', 'green', 2),
      player('5', 'MMMMMMMMMMMM', 'plum', 4),
    ],
  },
};
