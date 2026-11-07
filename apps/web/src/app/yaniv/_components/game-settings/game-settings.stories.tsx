import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useArgs } from 'storybook/preview-api';
import { fn } from 'storybook/test';
import {
  DEALER_SETTINGS,
  DEFAULT_DEALER,
  DEFAULT_HAND_SIZE,
  type DealerSetting,
  HAND_SIZE_SETTINGS,
  type HandSizeSetting,
  WINNER_CHOOSES_HAND_SIZE,
} from '~/types/games/yaniv';
import GameSettings from '.';

const meta = {
  title: 'Yaniv / Game Settings',
  component: GameSettings,
  args: {
    className: 'm-4 w-100 max-w-full',
    handSize: DEFAULT_HAND_SIZE,
    dealer: DEFAULT_DEALER,
    isHost: true,
    onHandSizeChange: fn(),
    onDealerChange: fn(),
  },
  argTypes: {
    handSize: { control: 'inline-radio', options: HAND_SIZE_SETTINGS },
    dealer: { control: 'inline-radio', options: DEALER_SETTINGS },
  },
} satisfies Meta<typeof GameSettings>;

export default meta;

type Story = StoryObj<typeof meta>;

// The host picks the settings the game is played with.
export const Host: Story = {
  render: function Render({ onHandSizeChange, onDealerChange, ...args }) {
    const [, updateArgs] = useArgs<{
      handSize: HandSizeSetting;
      dealer: DealerSetting;
    }>();

    return (
      <GameSettings
        {...args}
        onHandSizeChange={(value) => {
          updateArgs({ handSize: value });
          onHandSizeChange(value);
        }}
        onDealerChange={(value) => {
          updateArgs({ dealer: value });
          onDealerChange(value);
        }}
      />
    );
  },
};

// Everyone else sees the host's choice, but cannot change it.
export const Player: Story = {
  args: { handSize: 7, isHost: false },
};

// Each round's winner chooses how many cards are dealt in the next round.
export const WinnerChooses: Story = {
  args: { handSize: WINNER_CHOOSES_HAND_SIZE },
};

// The winner of each hand deals the next round and goes first.
export const HandWinnerDeals: Story = {
  args: { dealer: 'hand-winner' },
};
