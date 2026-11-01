import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { MiniCard } from '.';

const meta = {
  title: 'UI Components / Mini Card',
  component: MiniCard,
  args: {
    children: '10',
    isHighlighted: false,
  },
} satisfies Meta<typeof MiniCard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Standard: Story = {};

export const Highlighted: Story = { args: { isHighlighted: true } };

// One and two digits take the same width
export const OneToTen: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className='flex gap-1'>
      {Array.from({ length: 10 }, (_, index) => index + 1).map((value) => (
        <MiniCard key={value} isHighlighted={value >= 2 && value <= 5}>
          {value}
        </MiniCard>
      ))}
    </div>
  ),
};
