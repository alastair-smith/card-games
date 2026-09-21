import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useArgs } from 'storybook/preview-api';
import { fn } from 'storybook/test';
import {
  DEFAULT_HAND_SIZE,
  type HandSize,
  handSizeSchema,
} from '~/types/games/yaniv';
import GameSettings from '.';

const meta = {
  title: 'Yaniv / Game Settings',
  component: GameSettings,
  args: {
    className: 'm-4 w-100 max-w-full',
    handSize: DEFAULT_HAND_SIZE,
    isHost: true,
    onHandSizeChange: fn(),
  },
  argTypes: {
    handSize: { control: 'inline-radio', options: [5, 7] },
  },
} satisfies Meta<typeof GameSettings>;

export default meta;

type Story = StoryObj<typeof meta>;

// The host picks the settings the game is played with.
export const Host: Story = {
  render: function Render({ onHandSizeChange, ...args }) {
    const [, updateArgs] = useArgs<{ handSize: HandSize }>();

    return (
      <GameSettings
        {...args}
        onHandSizeChange={(value) => {
          updateArgs({ handSize: handSizeSchema.parse(Number(value)) });
          onHandSizeChange(value);
        }}
      />
    );
  },
};

// Everyone else sees the host's choice, but cannot change it.
export const Player: Story = {
  args: { handSize: 7, isHost: false },
};
