import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import type { ComponentProps } from 'react';
import { PlayingCard } from '~/components/ui/playing-card';
import { RANKS, Suit } from '~/types/cards';
import {
  PlayAreaPlayerName,
  PlayAreaPlayerZone,
  PlayAreaRoot,
  SharedZone,
} from '.';

type PlayAreaStoryProps = ComponentProps<typeof PlayAreaRoot> & {
  zoneCount: number;
};

const RenderZones = ({ zoneCount }: Pick<PlayAreaStoryProps, 'zoneCount'>) => {
  const players = Array.from({ length: zoneCount }, (_, i) => {
    return {
      name: `Player ${i + 1}`,
      // biome-ignore lint/style/noNonNullAssertion: rank will always exist
      card: { suit: Suit.SPADES, rank: RANKS[i % (RANKS.length - 1)]! },
    };
  });
  return (
    <div className='w-full h-[70vh] flex justify-center items-center'>
      <PlayAreaRoot className='h-full w-full'>
        <SharedZone>
          <div className='w-full h-full bg-red'>hello world</div>
        </SharedZone>

        {players.map((player) => (
          <PlayAreaPlayerZone key={player.name}>
            <PlayingCard
              card={player.name === 'Player 3' ? null : player.card}
              highlighted={player.name === 'Player 3'}
              className='text-2xl'
            />
            <PlayAreaPlayerName>{player.name}</PlayAreaPlayerName>
          </PlayAreaPlayerZone>
        ))}
      </PlayAreaRoot>
    </div>
  );
};

const meta: Meta<PlayAreaStoryProps> = {
  title: 'Layout / Play Area',
  component: PlayAreaRoot,
  args: {
    zoneCount: 10,
  },
  argTypes: {
    zoneCount: { control: { type: 'range', min: 2, max: 10, step: 1 } },
  },
  render: (args) => <RenderZones {...args} />,
};

export default meta;

type Story = StoryObj<PlayAreaStoryProps>;

export const PlayArea10: Story = { args: { zoneCount: 10 } };

export const PlayArea9: Story = { args: { zoneCount: 9 } };

export const PlayArea8: Story = { args: { zoneCount: 8 } };

export const PlayArea7: Story = { args: { zoneCount: 7 } };

export const PlayArea6: Story = { args: { zoneCount: 6 } };

export const PlayArea5: Story = { args: { zoneCount: 5 } };

export const PlayArea4: Story = { args: { zoneCount: 4 } };

export const PlayArea3: Story = { args: { zoneCount: 3 } };

export const PlayArea2: Story = { args: { zoneCount: 2 } };
