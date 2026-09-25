import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { buildClientPlayer, buildRoundScore } from '~/test-utils/yaniv';
import type { PlayerName, UserId } from '~/types/entities';
import type { RoundScore } from '~/types/games/yaniv';
import GameOver from '.';

const rounds = (...points: number[]) =>
  points.map((point) => buildRoundScore({ original: point }));

const player = (
  id: string,
  name: string,
  score: number,
  roundScores: RoundScore[],
  isWinner: boolean,
) => ({
  ...buildClientPlayer({
    id: id as UserId,
    name: name as PlayerName,
    score,
    roundScores,
  }),
  isWinner,
});

const alice = player('1', 'Alice', 20, rounds(0, 3, 0, 5, 0, 12), true);
const bob = player('2', 'Bob', 30, rounds(8, 0, 6, 9, 7, 0), false);
const charlie = player('3', 'Charlie', 40, rounds(12, 9, 0, 7, 4, 8), false);
const david = player(
  '4',
  'David',
  30,
  [
    ...rounds(15, 11),
    buildRoundScore({ original: 24, isScoreHalved: true }),
    ...rounds(3, 0, 2),
  ],
  false,
);
const eve = player('5', 'Eve', 97, rounds(20, 14, 9, 25, 18, 11), false);
const frank = player('6', 'Frank', 107, rounds(25, 19, 22, 16, 13, 12), false);

const tiedWinner = (id: string, name: string) =>
  player(id, name, 20, rounds(8, 0, 6, 0, 6, 0), true);

const meta = {
  title: 'Yaniv / Game Over',
  component: GameOver,
  parameters: { isFullScreen: true },
  args: {
    userId: '2' as UserId,
    players: [alice, bob, charlie, david, eve, frank],
  },
} satisfies Meta<typeof GameOver>;

export default meta;

type Story = StoryObj<typeof meta>;

export const OneWinner: Story = {};

export const TwoWinners: Story = {
  args: {
    players: [alice, tiedWinner('2', 'Bob'), charlie, david, eve, frank],
  },
};

export const FiveWinners: Story = {
  args: {
    players: [
      alice,
      tiedWinner('2', 'Bob'),
      tiedWinner('3', 'Charlie'),
      tiedWinner('4', 'David'),
      tiedWinner('5', 'Eve'),
      frank,
    ],
  },
};

export const UserWins: Story = {
  args: { userId: '1' as UserId },
};
