import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Rank, type StandardPlayingCard, Suit } from '~/types/cards';
import { PlayArea } from '.';

// A Jack, a 5, a Jack, a 5, a Jack, a 5 and a 5, played in that order
const longestVisiblePile: StandardPlayingCard[] = [
  { suit: Suit.CLUBS, rank: Rank.FIVE },
  { suit: Suit.SPADES, rank: Rank.FIVE },
  { suit: Suit.HEARTS, rank: Rank.JACK },
  { suit: Suit.DIAMONDS, rank: Rank.FIVE },
  { suit: Suit.SPADES, rank: Rank.JACK },
  { suit: Suit.HEARTS, rank: Rank.FIVE },
  { suit: Suit.CLUBS, rank: Rank.JACK },
];

const meta = {
  title: 'Shithead / Play Area',
  component: PlayArea,
  args: {
    deckSize: 30,
    visibleDiscardCards: [{ suit: Suit.HEARTS, rank: Rank.EIGHT }],
  },
} satisfies Meta<typeof PlayArea>;

export default meta;

type Story = StoryObj<typeof meta>;

export const OneCardShowing: Story = {};

export const EmptyDiscardPile: Story = { args: { visibleDiscardCards: [] } };

export const FiveOnTop: Story = {
  args: {
    visibleDiscardCards: [
      { suit: Suit.DIAMONDS, rank: Rank.FIVE },
      { suit: Suit.HEARTS, rank: Rank.EIGHT },
    ],
  },
};

export const RunOnTop: Story = {
  args: {
    visibleDiscardCards: [
      { suit: Suit.CLUBS, rank: Rank.QUEEN },
      { suit: Suit.SPADES, rank: Rank.QUEEN },
      { suit: Suit.HEARTS, rank: Rank.QUEEN },
    ],
  },
};

/** The most cards the pile can show. */
export const LongestPile: Story = {
  args: { visibleDiscardCards: longestVisiblePile },
};

export const EmptyDeck: Story = { args: { deckSize: 0 } };
