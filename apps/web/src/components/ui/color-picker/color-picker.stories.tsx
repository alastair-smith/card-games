import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useArgs } from 'storybook/preview-api';
import { fn } from 'storybook/test';
import { PLAYER_COLOR_OPTIONS } from '~/utils/player-color';
import { ColorPicker } from '.';

const FIRST_COLOR = PLAYER_COLOR_OPTIONS[0]?.key;

const meta = {
  title: 'UI Components / Color Picker',
  component: ColorPicker,
  args: {
    colors: PLAYER_COLOR_OPTIONS,
    value: FIRST_COLOR,
    label: 'Change colour',
    onColorSelect: fn(),
  },
  argTypes: {
    value: {
      control: 'select',
      options: PLAYER_COLOR_OPTIONS.map((option) => option.key),
    },
  },
  // The picker is a swatch button showing the current colour; open it to reveal
  // the colour popover. Selection is written back to the args so the swatch
  // updates and stays in sync with the controls panel.
  render: function Render({ onColorSelect, ...args }) {
    const [, updateArgs] = useArgs<{ value: string }>();

    return (
      <ColorPicker
        {...args}
        onColorSelect={(selected) => {
          updateArgs({ value: selected });
          onColorSelect(selected);
        }}
      />
    );
  },
} satisfies Meta<typeof ColorPicker>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

// Colours taken by other players are shown disabled in the popover.
export const WithTakenColours: Story = {
  args: { disabledColors: ['cyan', 'green', 'indigo'] },
};
