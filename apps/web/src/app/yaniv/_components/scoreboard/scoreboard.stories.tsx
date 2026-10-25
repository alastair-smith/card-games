import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect } from 'storybook/test';
import { Card, CardContent } from '~/components/ui/card';
import { buildClientPlayer, buildRoundScore } from '~/test-utils/yaniv';
import {
  MAX_NAME_LENGTH,
  type PlayerName,
  type UserId,
} from '~/types/entities';
import { Scoreboard } from '.';

const longGamePlayers = [
  buildClientPlayer({
    id: '1' as UserId,
    name: 'Kevin' as PlayerName,
    score: 72,
    roundScores: Array.from({ length: 14 }, (_, index) =>
      index % 3 === 0
        ? buildRoundScore({ original: 2, adjusted: 0 })
        : buildRoundScore({ original: 8 }),
    ),
  }),
  buildClientPlayer({
    id: '2' as UserId,
    name: 'Paul' as PlayerName,
    score: 98,
    roundScores: Array.from({ length: 14 }, (_, index) =>
      buildRoundScore({ original: index % 2 === 0 ? 9 : 5 }),
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
        roundScores: [
          buildRoundScore({ original: 9 }),
          buildRoundScore({ original: 5, adjusted: 0 }),
          buildRoundScore({ original: 12, adjusted: 0 }),
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
        score: 13,
        roundScores: [
          buildRoundScore({ original: 2, adjusted: 0 }),
          buildRoundScore({ original: 13 }),
          buildRoundScore({ original: 0 }),
        ],
      }),
    ],
  },
} satisfies Meta<typeof Scoreboard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Standard: Story = {};

export const InPanelCard: Story = {
  decorators: [
    (Story) => (
      <Card variant='panel' className='w-full max-w-xl'>
        <CardContent className='pt-4'>
          <Story />
        </CardContent>
      </Card>
    ),
  ],
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
      canvas.getByRole('button', { name: /hide earlier rounds/i }),
    ).toHaveAttribute('aria-expanded', 'true');
  },
};
