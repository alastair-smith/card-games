import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { buildClientPlayer } from '~/test-utils/yaniv';
import {
  MAX_NAME_LENGTH,
  type PlayerName,
  type UserId,
} from '~/types/entities';
import { RoundSummary } from '.';

const roundScore = (
  original: number,
  adjusted = original,
  isScoreHalved = false,
) => ({ original, adjusted, isScoreHalved });

const meta = {
  title: 'Yaniv / Round Summary',
  component: RoundSummary,
  args: {
    userId: '2' as UserId,
    players: [
      buildClientPlayer({
        id: '1' as UserId,
        name: 'Kevin' as PlayerName,
        score: 9,
        roundScores: [roundScore(9), roundScore(5, 0), roundScore(3, 0)],
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
        score: 23,
        roundScores: [roundScore(2, 0), roundScore(13), roundScore(10)],
      }),
    ],
  },
} satisfies Meta<typeof RoundSummary>;

export default meta;

type Story = StoryObj<typeof meta>;

export const OtherPlayerWon: Story = {};

export const UserWon: Story = {
  args: { userId: '1' as UserId },
};

export const TiedRound: Story = {
  args: {
    players: [
      buildClientPlayer({
        id: '1' as UserId,
        name: 'Kevin' as PlayerName,
        score: 4,
        roundScores: [roundScore(4), roundScore(3, 0)],
      }),
      buildClientPlayer({
        id: '2' as UserId,
        name: 'Viola' as PlayerName,
        score: 11,
        roundScores: [roundScore(11), roundScore(3, 0)],
      }),
      buildClientPlayer({
        id: '3' as UserId,
        name: 'Paul' as PlayerName,
        score: 12,
        roundScores: [roundScore(0), roundScore(12)],
      }),
    ],
  },
};

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
