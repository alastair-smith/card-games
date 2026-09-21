import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import type { ComponentProps } from 'react';
import { PlayingCard } from '~/components/ui/playing-card';
import { Rank, Suit } from '~/types/cards';
import { PlayingCardStack } from '.';

type PlayingCardStackStoryProps = ComponentProps<typeof PlayingCardStack> & {
  cardCount: number;
};

const meta: Meta<PlayingCardStackStoryProps> = {
  title: 'Components / Playing Card Stack',
  component: PlayingCardStack,
  args: {
    cardCount: 1,
  },
  argTypes: {
    cardCount: { control: { type: 'range', min: 0, max: 8, step: 1 } },
  },
  render: ({ cardCount, ...args }) => (
    <PlayingCardStack {...args}>
      {Array.from({ length: cardCount }, (_, index) => (
        <PlayingCard
          // biome-ignore lint/suspicious/noArrayIndexKey: identical cards in a stack
          key={index}
          card={{ suit: Suit.SPADES, rank: Rank.TEN }}
        />
      ))}
    </PlayingCardStack>
  ),
};

export default meta;

type Story = StoryObj<PlayingCardStackStoryProps>;

export const EmptyStack: Story = { args: { cardCount: 0 } };

export const OneCardStack: Story = { args: { cardCount: 1 } };

export const TwoCardStack: Story = { args: { cardCount: 2 } };

export const ThreeCardStack: Story = { args: { cardCount: 3 } };

export const FourCardStack: Story = { args: { cardCount: 4 } };

export const FiveCardStack: Story = { args: { cardCount: 5 } };

export const SixCardStack: Story = { args: { cardCount: 6 } };

export const SevenCardStack: Story = { args: { cardCount: 7 } };

export const EightCardStack: Story = { args: { cardCount: 8 } };
