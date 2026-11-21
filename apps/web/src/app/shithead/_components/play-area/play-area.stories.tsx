import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
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
    discardSize: 4,
    visibleDiscardCards: [{ suit: Suit.HEARTS, rank: Rank.EIGHT }],
  },
} satisfies Meta<typeof PlayArea>;

export default meta;

type Story = StoryObj<typeof meta>;

export const OneCardShowing: Story = {};

export const EmptyDiscardPile: Story = {
  args: { discardSize: 0, visibleDiscardCards: [] },
};

export const OneCardInEachPile: Story = {
  args: { deckSize: 1, discardSize: 1 },
};

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
  args: { discardSize: 7, visibleDiscardCards: longestVisiblePile },
};

export const EmptyDeck: Story = { args: { deckSize: 0 } };

/** On the player's turn, clicking the pile picks it up. */
export const PickingUp: Story = {
  args: {
    discardSize: 7,
    visibleDiscardCards: longestVisiblePile,
    onDiscardPileClick: fn(),
  },
  play: async ({ args, canvasElement }) => {
    await userEvent.click(
      within(canvasElement).getByRole('button', {
        name: 'Pick up the discard pile',
      }),
    );
    await expect(args.onDiscardPileClick).toHaveBeenCalledOnce();
  },
};
