import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { buildClientPlayer, buildRoundScore } from '~/test-utils/yaniv';
import {
  MAX_NAME_LENGTH,
  type PlayerName,
  type UserId,
} from '~/types/entities';
import { RoundSummary } from '.';

const meta = {
  title: 'Yaniv / Round Summary',
  component: RoundSummary,
  args: {
    userId: '2' as UserId,
    isRoundOver: true,
    players: [
      buildClientPlayer({
        id: '1' as UserId,
        name: 'Kevin' as PlayerName,
        score: 9,
        roundScores: [
          buildRoundScore({ original: 9 }),
          buildRoundScore({ original: 5, adjusted: 0 }),
          buildRoundScore({ original: 3, adjusted: 0 }),
        ],
      }),
      buildClientPlayer({
        id: '2' as UserId,
        name: Array.from({ length: MAX_NAME_LENGTH }, () => 'W').join(
          '',
        ) as PlayerName,
        score: 33,
        roundScores: [
          buildRoundScore({ original: 38 }),
          buildRoundScore({ original: 12, halvedBy: 25 }),
          buildRoundScore({ original: 8 }),
        ],
      }),
      buildClientPlayer({
        id: '3' as UserId,
        name: 'Paul' as PlayerName,
        score: 25,
        roundScores: [
          buildRoundScore({ original: 11 }),
          buildRoundScore({ original: 7, adjusted: 25 }),
          buildRoundScore({ original: 14, halvedBy: 25 }),
        ],
      }),
      buildClientPlayer({
        id: '4' as UserId,
        name: 'Viola' as PlayerName,
        score: 16,
        roundScores: [
          buildRoundScore({ original: 6 }),
          buildRoundScore({ original: 4 }),
          buildRoundScore({ original: 6 }),
        ],
      }),
      buildClientPlayer({
        id: '5' as UserId,
        name: 'Duncan' as PlayerName,
        score: 23,
        roundScores: [
          buildRoundScore({ original: 2, adjusted: 0 }),
          buildRoundScore({ original: 13 }),
          buildRoundScore({ original: 10 }),
        ],
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

/** The scores so far, in the Scores tab mid-round. */
export const MidRound: Story = {
  args: { isRoundOver: false },
};

export const BeforeFirstRound: Story = {
  args: {
    isRoundOver: false,
    players: [
      buildClientPlayer({ id: '1' as UserId, name: 'Kevin' as PlayerName }),
      buildClientPlayer({ id: '2' as UserId, name: 'Paul' as PlayerName }),
    ],
  },
};

export const TiedRound: Story = {
  args: {
    players: [
      buildClientPlayer({
        id: '1' as UserId,
        name: 'Kevin' as PlayerName,
        score: 4,
        roundScores: [
          buildRoundScore({ original: 4 }),
          buildRoundScore({ original: 3, adjusted: 0 }),
        ],
      }),
      buildClientPlayer({
        id: '2' as UserId,
        name: 'Viola' as PlayerName,
        score: 11,
        roundScores: [
          buildRoundScore({ original: 11 }),
          buildRoundScore({ original: 3, adjusted: 0 }),
        ],
      }),
      buildClientPlayer({
        id: '3' as UserId,
        name: 'Paul' as PlayerName,
        score: 12,
        roundScores: [
          buildRoundScore({ original: 0 }),
          buildRoundScore({ original: 12 }),
        ],
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
        roundScores: [buildRoundScore({ original: 4, adjusted: 0 })],
      }),
      buildClientPlayer({
        id: '2' as UserId,
        name: 'Paul' as PlayerName,
        score: 17,
        roundScores: [buildRoundScore({ original: 17 })],
      }),
    ],
  },
};
