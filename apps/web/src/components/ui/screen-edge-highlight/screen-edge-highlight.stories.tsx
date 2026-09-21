import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { PLAYER_COLORS } from '~/utils/player-color';
import { ScreenEdgeHighlight } from '.';

const meta = {
  title: 'Components / Screen Edge Highlight',
  component: ScreenEdgeHighlight,
  argTypes: {
    color: {
      control: 'select',
      options: Object.keys(PLAYER_COLORS),
    },
  },
  decorators: [
    (Story) => (
      <div className='bg-main-background text-dark-text flex min-h-screen items-center justify-center'>
        <p className='text-lg'>The screen edges are highlighted.</p>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ScreenEdgeHighlight>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const PlayerColor: Story = { args: { color: 'cyan' } };
