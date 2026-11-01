import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useArgs } from 'storybook/preview-api';
import { fn } from 'storybook/test';
import { SpinButton } from '.';

const meta = {
  title: 'UI Components / Spin Button',
  component: SpinButton,
  args: {
    label: 'Min',
    value: 5,
    min: 1,
    max: 10,
    onValueChange: fn(),
  },
  render: function Render({ onValueChange, ...args }) {
    const [, updateArgs] = useArgs<{ value: number }>();

    return (
      <SpinButton
        {...args}
        onValueChange={(value) => {
          updateArgs({ value });
          onValueChange(value);
        }}
      />
    );
  },
} satisfies Meta<typeof SpinButton>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Standard: Story = {};

export const AtMinimum: Story = { args: { value: 1 } };

export const AtMaximum: Story = { args: { value: 10 } };
