import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from 'storybook/test';
import { GameViewStage } from '~/types/games/yaniv';
import { TurnActions } from '.';

const meta = {
  title: 'Yaniv / Turn Actions',
  component: TurnActions,
  args: {
    stage: GameViewStage.PICKING_CARDS,
    isRunSelected: false,
    onEndTurnClick: fn(),
    onYanivClick: fn(),
    onPlayCards: fn(),
    onStartNewRoundClick: fn(),
  },
  argTypes: {
    stage: { control: 'select', options: Object.values(GameViewStage) },
  },
} satisfies Meta<typeof TurnActions>;

export default meta;

type Story = StoryObj<typeof meta>;

export const PlayCards: Story = {};

export const RunSelected: Story = { args: { isRunSelected: true } };

export const EndTurn: Story = {
  args: { stage: GameViewStage.END_TURN, handTotal: 7 },
};

export const EndTurnHandTotalHidden: Story = {
  args: { stage: GameViewStage.END_TURN },
};

export const EndOfRound: Story = {
  args: { stage: GameViewStage.END_OF_ROUND },
};
