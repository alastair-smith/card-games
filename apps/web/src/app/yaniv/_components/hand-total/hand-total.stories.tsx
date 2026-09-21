import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { PLAYER_COLOR_OPTIONS } from '~/utils/player-color';
import HandTotal from '.';

const meta = {
  title: 'Yaniv / Hand Total',
  component: HandTotal,
  args: {
    color: 'cyan',
    handTotal: 37,
    isFiftyScoreHalved: false,
    totalScore: 28,
  },
  argTypes: {
    color: {
      control: 'select',
      options: PLAYER_COLOR_OPTIONS.map((option) => option.key),
    },
  },
} satisfies Meta<typeof HandTotal>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const AllColours: Story = {
  parameters: { controls: { disable: true } },
  render: (args) => (
    <div className='grid grid-cols-2 gap-4'>
      {PLAYER_COLOR_OPTIONS.map(({ key, name }) => (
        <div key={key} className='flex flex-col gap-1'>
          <span className='text-dark-text text-sm font-semibold'>{name}</span>
          <HandTotal {...args} color={key} />
        </div>
      ))}
    </div>
  ),
};
