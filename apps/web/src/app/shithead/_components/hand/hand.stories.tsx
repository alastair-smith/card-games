import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useState } from 'react';
import { expect, fn, userEvent, within } from 'storybook/test';
import { buildTableCards } from '~/test-utils/shithead';
import {
  RANKS,
  Rank,
  type StandardPlayingCard,
  Suit,
  standardDeck,
} from '~/types/cards';
import { GameStage, type TableCardSlot } from '~/types/games/shithead';
import { isSameCard } from '~/utils/cards';
import { PLAYER_COLOR_OPTIONS } from '~/utils/player-color';
import { Hand } from '.';

const HAND: StandardPlayingCard[] = [
  { suit: Suit.CLUBS, rank: Rank.FOUR },
  { suit: Suit.HEARTS, rank: Rank.NINE },
  { suit: Suit.SPADES, rank: Rank.QUEEN },
];

const FACE_DOWN_ONLY: TableCardSlot[] = buildTableCards().map((slot) => ({
  ...slot,
  faceUpCard: null,
}));

// Everything but two cards, after picking up a long pile
const BIGGEST_HAND = standardDeck.slice(2);

const RANKS_ABOVE_SIX = RANKS.filter((rank) => rank > Rank.SIX);

const meta = {
  title: 'Shithead / Hand',
  component: Hand,
  // Fills the hand's tab, as in the game
  decorators: [
    (Story) => (
      <div className='flex h-[80vh] flex-col'>
        <Story />
      </div>
    ),
  ],
  args: {
    className: 'flex-1',
    color: 'cyan',
    gameStage: GameStage.IN_PROGRESS,
    cards: HAND,
    tableCards: buildTableCards(),
    isSwapConfirmed: true,
    isPlayersTurn: true,
    playableRanks: RANKS_ABOVE_SIX,
    onSwapCards: fn(),
    onConfirmSwap: fn(),
    onPlayCards: fn(),
    onPickUpPile: fn(),
  },
  argTypes: {
    color: {
      control: 'select',
      options: PLAYER_COLOR_OPTIONS.map((option) => option.key),
    },
  },
} satisfies Meta<typeof Hand>;

export default meta;

type Story = StoryObj<typeof meta>;

/** The 4 can't go on the pile, so only the 9 and Queen can be chosen. */
export const YourTurn: Story = {
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(
      canvas.getByRole('button', { name: 'Queen of Spades' }),
    );
    await userEvent.click(canvas.getByRole('button', { name: 'Play Cards' }));
    await expect(args.onPlayCards).toHaveBeenCalledWith({
      source: 'hand',
      cards: [{ suit: Suit.SPADES, rank: Rank.QUEEN }],
    });
  },
};

export const OtherPlayersTurn: Story = { args: { isPlayersTurn: false } };

export const NothingToPlay: Story = { args: { playableRanks: [] } };

export const MagicCards: Story = {
  args: {
    cards: [
      { suit: Suit.CLUBS, rank: Rank.TWO },
      { suit: Suit.HEARTS, rank: Rank.FIVE },
      { suit: Suit.SPADES, rank: Rank.SEVEN },
      { suit: Suit.DIAMONDS, rank: Rank.TEN },
      { suit: Suit.HEARTS, rank: Rank.JACK },
    ],
  },
};

/** The worst case, scrolling under the buttons: most of the deck after picking up. */
export const BiggestHand: Story = { args: { cards: BIGGEST_HAND } };

export const Swapping: Story = {
  args: { gameStage: GameStage.SWAPPING, isSwapConfirmed: false },
  // Swaps locally, as the server would
  render: function Render({
    cards: initialCards,
    tableCards: initialTableCards,
    onSwapCards,
    ...args
  }) {
    const [cards, setCards] = useState(initialCards);
    const [tableCards, setTableCards] = useState(initialTableCards);

    return (
      <Hand
        {...args}
        cards={cards}
        tableCards={tableCards}
        onSwapCards={(swap) => {
          setCards((previous) =>
            previous.map((card) =>
              isSameCard(card, swap.handCard) ? swap.faceUpCard : card,
            ),
          );
          setTableCards((previous) =>
            previous.map((slot) =>
              isSameCard(slot.faceUpCard, swap.faceUpCard)
                ? { ...slot, faceUpCard: swap.handCard }
                : slot,
            ),
          );
          onSwapCards(swap);
        }}
      />
    );
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(
      canvas.getByRole('button', { name: 'Four of Clubs' }),
    );
    await userEvent.click(
      canvas.getByRole('button', { name: 'Ten of Diamonds' }),
    );
    await expect(args.onSwapCards).toHaveBeenCalledOnce();
    await expect(
      canvas.getByRole('button', { name: 'Four of Clubs' }),
    ).toBeInTheDocument();
  },
};

export const SwapConfirmed: Story = {
  args: { gameStage: GameStage.SWAPPING, isSwapConfirmed: true },
};

export const FaceUpCards: Story = { args: { cards: [] } };

/** None can go on the pile, so any can be chosen to pick up with it. */
export const FaceUpCardsNothingToPlay: Story = {
  args: { cards: [], playableRanks: [Rank.ACE] },
};

export const FaceDownCards: Story = {
  args: { cards: [], tableCards: FACE_DOWN_ONLY },
};

export const OutOfCards: Story = {
  args: {
    cards: [],
    tableCards: FACE_DOWN_ONLY.map((slot) => ({
      ...slot,
      hasFaceDownCard: false,
    })),
  },
};
