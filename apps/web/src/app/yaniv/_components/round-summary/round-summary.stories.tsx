import type { Meta, StoryObj } from '@storybook/nextjs-vite';
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
    players: [
      {
        id: '1' as UserId,
        name: 'Kevin' as PlayerName,
        roundScore: { original: 0, adjusted: 0 },
      },
      {
        id: '2' as UserId,
        name: Array.from({ length: MAX_NAME_LENGTH }, () => 'W').join(
          '',
        ) as PlayerName,
        roundScore: { original: 8, adjusted: 8 },
      },
      {
        id: '3' as UserId,
        name: 'Paul' as PlayerName,
        roundScore: { original: 12, adjusted: 12 },
      },
      {
        id: '4' as UserId,
        name: 'Viola' as PlayerName,
        roundScore: { original: 20, adjusted: 20 },
      },
      {
        id: '5' as UserId,
        name: 'Sophie' as PlayerName,
        roundScore: { original: 20, adjusted: 20 },
      },
      {
        id: '6' as UserId,
        name: 'John' as PlayerName,
        roundScore: { original: 25, adjusted: 25 },
      },
    ],
  },
} satisfies Meta<typeof RoundSummary>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Standard: Story = {};
