import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { MAX_NAME_LENGTH, type PlayerName } from '~/types/entities';
import { PLAYER_COLOR_OPTIONS } from '~/utils/player-color';
import Scorecard from '.';

const meta = {
  title: 'Yaniv / Scorecard',
  component: Scorecard,
  args: {
    color: 'cyan',
    cardCount: 7,
    isFiftyScoreHalved: false,
    isHundredScoreHalved: false,
    name: 'Kevin' as PlayerName,
    score: 0,
    isYanivCalled: false,
  },
  argTypes: {
    color: {
      control: 'select',
      options: PLAYER_COLOR_OPTIONS.map((option) => option.key),
    },
  },
} satisfies Meta<typeof Scorecard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Start: Story = {};

export const LongName: Story = {
  args: {
    name: Array.from({ length: MAX_NAME_LENGTH }, () => 'W').join(
      '',
    ) as PlayerName,
  },
};

export const FiftyScored: Story = { args: { isFiftyScoreHalved: true } };

export const HundredScored: Story = { args: { isHundredScoreHalved: true } };

export const HighScore: Story = { args: { score: 200 } };

export const NoCards: Story = { args: { cardCount: 0 } };

export const CurrentTurn: Story = { args: { isPlayersTurn: true } };

export const YanivCalled: Story = { args: { isYanivCalled: true } };

export const NullCards: Story = { args: { cardCount: null } };

export const ColorOptions: Story = {
  parameters: { controls: { disable: true } },
  render: (args) => (
    <div className='grid grid-cols-3 gap-4'>
      {PLAYER_COLOR_OPTIONS.map(({ key, name }) => (
        <div key={key} className='flex flex-col gap-1'>
          <span className='text-dark-text text-sm font-semibold'>{name}</span>
          <Scorecard {...args} color={key} />
        </div>
      ))}
    </div>
  ),
};
