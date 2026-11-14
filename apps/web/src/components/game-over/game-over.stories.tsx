import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { GameType } from '~/types/game';
import { GameOver } from '.';

const meta = {
  title: 'Game Over',
  component: GameOver,
  parameters: { isFullScreen: true },
  args: {
    gameType: GameType.SHITHEAD,
    title: 'Kevin wins!',
    isUserWinner: false,
    loserEmoji: '💩',
    shareText: '🥇 Kevin\n🥈 Al',
    children: <p className='text-center'>The game's leaderboard goes here</p>,
  },
} satisfies Meta<typeof GameOver>;

export default meta;

type Story = StoryObj<typeof meta>;

export const SomeoneElseWins: Story = {};

export const YouWin: Story = {
  args: { title: 'You win!', isUserWinner: true },
};
