import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from 'storybook/test';
import { Rank, Suit } from '~/types/cards';
import { PLAYER_COLOR_OPTIONS } from '~/utils/player-color';
import PlayArea from '.';

const meta = {
  title: 'Yaniv / Play Area',
  component: PlayArea,
  args: {
    color: 'cyan',
    playedCards: [
      { suit: Suit.HEARTS, rank: Rank.SEVEN },
      { suit: Suit.DIAMONDS, rank: Rank.SEVEN },
      { suit: Suit.SPADES, rank: Rank.SEVEN },
    ],
    discardCard: { suit: Suit.CLUBS, rank: Rank.FOUR },
    onDiscardClick: fn(),
    onDeckClick: fn(),
  },
  argTypes: {
    color: {
      control: 'select',
      options: PLAYER_COLOR_OPTIONS.map((option) => option.key),
    },
  },
} satisfies Meta<typeof PlayArea>;

export default meta;

type Story = StoryObj<typeof meta>;

export const AllAreasFull: Story = {};

export const NoDiscard: Story = { args: { discardCard: null } };

export const NoPlayed: Story = { args: { playedCards: [] } };

export const NoCards: Story = {
  args: { discardCard: null, playedCards: [] },
};

export const PlayedMaxCards: Story = {
  args: {
    playedCards: [
      { suit: Suit.SPADES, rank: Rank.TWO },
      { suit: Suit.SPADES, rank: Rank.THREE },
      { suit: Suit.SPADES, rank: Rank.FOUR },
      { suit: Suit.SPADES, rank: Rank.FIVE },
      { suit: Suit.SPADES, rank: Rank.SIX },
      { suit: Suit.SPADES, rank: Rank.SEVEN },
      { suit: Suit.SPADES, rank: Rank.EIGHT },
    ],
  },
};
