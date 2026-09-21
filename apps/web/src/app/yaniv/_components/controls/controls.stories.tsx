import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from 'storybook/test';
import type { PlayerName } from '~/types/entities';
import { GameViewStage } from '~/types/games/yaniv';
import Controls from '.';

const meta = {
  title: 'Yaniv / Controls',
  component: Controls,
  args: {
    onEmojiClick: fn(),
    onEndTurnClick: fn(),
    onYanivClick: fn(),
    onPlayCards: fn(),
    stage: GameViewStage.WAITING_FOR_PLAYER,
  },
  argTypes: {
    stage: { control: 'select', options: Object.values(GameViewStage) },
  },
} satisfies Meta<typeof Controls>;

export default meta;

type Story = StoryObj<typeof meta>;

export const WaitForPlayers: Story = {
  args: { playerTakingTurn: 'Kevin' as PlayerName },
};

export const PickCards: Story = {
  args: { stage: GameViewStage.PICKING_CARDS },
};

export const EndTurn: Story = { args: { stage: GameViewStage.END_TURN } };

export const EndOfRound: Story = {
  args: { stage: GameViewStage.END_OF_ROUND },
};
