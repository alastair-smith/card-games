import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useArgs } from 'storybook/preview-api';
import { expect, fn, userEvent, within } from 'storybook/test';
import {
  DEFAULT_HAND_SIZE,
  DEFAULT_HAND_SIZE_RANGE,
  HAND_SIZE_SETTINGS,
  type HandSizeRange,
  type HandSizeSetting,
  RANDOM_HAND_SIZE,
  WINNER_CHOOSES_HAND_SIZE,
} from '~/types/games/yaniv';
import GameSettings from '.';

const meta = {
  title: 'Yaniv / Game Settings',
  component: GameSettings,
  args: {
    className: 'm-4 w-100 max-w-full',
    handSize: DEFAULT_HAND_SIZE,
    handSizeRange: DEFAULT_HAND_SIZE_RANGE,
    isHost: true,
    onHandSizeChange: fn(),
    onHandSizeRangeChange: fn(),
  },
  argTypes: {
    handSize: { control: 'inline-radio', options: HAND_SIZE_SETTINGS },
  },
  render: function Render({
    onHandSizeChange,
    onHandSizeRangeChange,
    ...args
  }) {
    const [, updateArgs] = useArgs<{
      handSize: HandSizeSetting;
      handSizeRange: HandSizeRange;
    }>();

    return (
      <GameSettings
        {...args}
        onHandSizeChange={(value) => {
          updateArgs({ handSize: value });
          onHandSizeChange(value);
        }}
        onHandSizeRangeChange={(value) => {
          updateArgs({ handSizeRange: value });
          onHandSizeRangeChange(value);
        }}
      />
    );
  },
} satisfies Meta<typeof GameSettings>;

export default meta;

type Story = StoryObj<typeof meta>;

// The host picks the settings the game is played with.
export const Host: Story = {};

// Everyone else sees the host's choice, but cannot change it.
export const Player: Story = {
  args: { handSize: 7, isHost: false },
};

// The winner of each hand picks how many cards the next round deals.
export const WinnerChooses: Story = {
  args: { handSize: WINNER_CHOOSES_HAND_SIZE },
};

// Each hand deals a random number of cards from the range the host sets.
export const Random: Story = {
  args: { handSize: RANDOM_HAND_SIZE },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole('button', { name: 'Increase Min' }));

    await expect(args.onHandSizeRangeChange).toHaveBeenCalledWith({
      min: 2,
      max: 7,
    });
  },
};

// Everyone else sees the host's range, but cannot change it.
export const RandomPlayer: Story = {
  args: { handSize: RANDOM_HAND_SIZE, isHost: false },
};
