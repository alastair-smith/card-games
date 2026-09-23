import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect } from 'storybook/test';
import { buildClientPlayer } from '~/test-utils/yaniv';
import {
  MAX_NAME_LENGTH,
  type PlayerName,
  type UserId,
} from '~/types/entities';
import { Scoreboard } from '.';

const roundScore = (
  original: number,
  adjusted = original,
  isScoreHalved = false,
) => ({ original, adjusted, isScoreHalved });

const longGamePlayers = [
  buildClientPlayer({
    id: '1' as UserId,
    name: 'Kevin' as PlayerName,
    score: 72,
    roundScores: Array.from({ length: 14 }, (_, index) =>
      roundScore(index % 3 === 0 ? 2 : 8, index % 3 === 0 ? 0 : 8),
    ),
  }),
  buildClientPlayer({
    id: '2' as UserId,
    name: 'Paul' as PlayerName,
    score: 98,
    roundScores: Array.from({ length: 14 }, (_, index) =>
      roundScore(index % 2 === 0 ? 9 : 5),
    ),
  }),
];

const meta = {
  title: 'Yaniv / Scoreboard',
  component: Scoreboard,
  args: {
    className: 'text-dark-text',
    userId: '2' as UserId,
    players: [
      buildClientPlayer({
        id: '1' as UserId,
        name: 'Kevin' as PlayerName,
        score: 9,
        roundScores: [roundScore(9), roundScore(5, 0), roundScore(12, 0)],
      }),
      buildClientPlayer({
        id: '2' as UserId,
        name: Array.from({ length: MAX_NAME_LENGTH }, () => 'W').join(
          '',
        ) as PlayerName,
        score: 33,
        roundScores: [roundScore(38), roundScore(12, 12, true), roundScore(8)],
      }),
      buildClientPlayer({
        id: '3' as UserId,
        name: 'Paul' as PlayerName,
        score: 25,
        roundScores: [
          roundScore(11),
          roundScore(7, 25),
          roundScore(14, 14, true),
        ],
      }),
      buildClientPlayer({
        id: '4' as UserId,
        name: 'Viola' as PlayerName,
        score: 16,
        roundScores: [roundScore(6), roundScore(4), roundScore(6)],
      }),
      buildClientPlayer({
        id: '5' as UserId,
        name: 'Duncan' as PlayerName,
        score: 13,
        roundScores: [roundScore(2, 0), roundScore(13), roundScore(0, 0)],
      }),
    ],
  },
} satisfies Meta<typeof Scoreboard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Standard: Story = {};

export const FirstRound: Story = {
  args: {
    players: [
      buildClientPlayer({
        id: '1' as UserId,
        name: 'Kevin' as PlayerName,
        score: 0,
        roundScores: [roundScore(4, 0)],
      }),
      buildClientPlayer({
        id: '2' as UserId,
        name: 'Paul' as PlayerName,
        score: 17,
        roundScores: [roundScore(17)],
      }),
    ],
  },
};

export const LongGame: Story = {
  args: { players: longGamePlayers },
};

export const LongGameAllRoundsShown: Story = {
  args: { players: longGamePlayers },
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(
      canvas.getByRole('button', { name: /show all rounds/i }),
    );
    await expect(
      canvas.getByRole('columnheader', { name: 'Round 1' }),
    ).toBeInTheDocument();
  },
};
