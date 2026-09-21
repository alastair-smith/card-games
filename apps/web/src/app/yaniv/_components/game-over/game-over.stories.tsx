import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import type { PlayerName, UserId } from '~/types/entities';
import GameOver from '.';

type Player = React.ComponentProps<typeof GameOver>['players'][number];

const player = (
  id: string,
  name: string,
  score: number,
  isWinner: boolean,
): Player => ({
  id: id as UserId,
  name: name as PlayerName,
  score,
  isWinner,
});

const meta = {
  title: 'Yaniv / Game Over',
  component: GameOver,
  args: {
    userId: '2' as UserId,
    players: [
      player('1', 'Alice', 20, true),
      player('2', 'Bob', 30, false),
      player('3', 'Charlie', 40, false),
      player('4', 'David', 50, false),
      player('5', 'Eve', 100, false),
      player('6', 'Frank', 200, false),
    ],
  },
} satisfies Meta<typeof GameOver>;

export default meta;

type Story = StoryObj<typeof meta>;

export const OneWinner: Story = {};

export const TwoWinners: Story = {
  args: {
    players: [
      player('1', 'Alice', 20, true),
      player('2', 'Bob', 20, true),
      player('3', 'Charlie', 40, false),
      player('4', 'David', 50, false),
      player('5', 'Eve', 100, false),
      player('6', 'Frank', 200, false),
    ],
  },
};

export const FiveWinners: Story = {
  args: {
    players: [
      player('1', 'Alice', 20, true),
      player('2', 'Bob', 20, true),
      player('3', 'Charlie', 20, true),
      player('4', 'David', 20, true),
      player('5', 'Eve', 20, true),
      player('6', 'Frank', 200, false),
    ],
  },
};

export const UserWins: Story = {
  args: { userId: '1' as UserId },
};
