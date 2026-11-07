import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useArgs } from 'storybook/preview-api';
import { fn } from 'storybook/test';
import {
  DEFAULT_SETTINGS,
  type Settings,
  WINNER_CHOOSES_HAND_SIZE,
} from '~/types/games/yaniv';
import GameSettings from '.';

const meta = {
  title: 'Yaniv / Game Settings',
  component: GameSettings,
  args: {
    className: 'm-4 w-100 max-w-full',
    settings: DEFAULT_SETTINGS,
    isHost: true,
    onSettingChange: fn(),
  },
} satisfies Meta<typeof GameSettings>;

export default meta;

type Story = StoryObj<typeof meta>;

// The host picks the settings the game is played with.
export const Host: Story = {
  render: function Render({ onSettingChange, ...args }) {
    const [, updateArgs] = useArgs<{ settings: Settings }>();

    return (
      <GameSettings
        {...args}
        onSettingChange={(update) => {
          updateArgs({ settings: { ...args.settings, ...update } });
          onSettingChange(update);
        }}
      />
    );
  },
};

// Everyone else sees the host's choice, but cannot change it.
export const Player: Story = {
  args: { settings: { ...DEFAULT_SETTINGS, handSize: 7 }, isHost: false },
};

// Each round's winner chooses how many cards are dealt in the next round.
export const WinnerChooses: Story = {
  args: {
    settings: { ...DEFAULT_SETTINGS, handSize: WINNER_CHOOSES_HAND_SIZE },
  },
};

// The winner of each hand deals the next round and goes first.
export const HandWinnerDeals: Story = {
  args: { settings: { ...DEFAULT_SETTINGS, dealer: 'hand-winner' } },
};
