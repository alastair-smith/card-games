import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useArgs } from 'storybook/preview-api';
import { fn } from 'storybook/test';
import { Range } from '.';

const meta = {
  title: 'UI Components / Range',
  component: Range,
  args: {
    label: 'Choose a range',
    min: 1,
    max: 10,
    range: [1, 5],
    onRangeChange: fn(),
  },
  render: function Render({ onRangeChange, ...args }) {
    const [, updateArgs] = useArgs<{ range: [number, number] }>();

    return (
      <Range
        {...args}
        onRangeChange={(range) => {
          updateArgs({ range });
          onRangeChange(range);
        }}
      />
    );
  },
} satisfies Meta<typeof Range>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Standard: Story = {};
