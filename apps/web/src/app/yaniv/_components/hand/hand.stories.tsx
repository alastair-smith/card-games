import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useState } from 'react';
import { fn } from 'storybook/test';
import { Rank, Suit } from '~/types/cards';
import type { YanivPlayingCard } from '~/types/games/yaniv';
import { PLAYER_COLOR_OPTIONS } from '~/utils/player-color';
import { Hand } from '.';

const meta = {
  title: 'Yaniv / Hand',
  component: Hand,
  args: {
    color: 'cyan',
    cards: [
      { suit: Suit.CLUBS, rank: Rank.ACE, selected: false },
      { suit: Suit.HEARTS, rank: Rank.KING, selected: false },
      { suit: Suit.SPADES, rank: Rank.QUEEN, selected: false },
      { suit: Suit.DIAMONDS, rank: Rank.JACK, selected: false },
      { suit: Suit.CLUBS, rank: Rank.TEN, selected: false },
      { suit: Suit.HEARTS, rank: Rank.NINE, selected: false },
      { suit: Suit.SPADES, rank: Rank.EIGHT, selected: false },
    ],
    isFiftyScoreHalved: false,
    totalScore: 23,
    handTotal: 59,
    isActive: false,
    isFaceDown: false,
    onCardClick: fn(),
    onVisibilityToggle: fn(),
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

// Selection is held locally so cards can be picked up and put down.
export const FullHand: Story = {
  render: ({ cards: initialCards, onCardClick, ...args }) => {
    const [cards, setCards] = useState(initialCards);

    const updateCard = (
      cardToUpdate: YanivPlayingCard & { selected?: boolean },
    ) => {
      setCards(
        cards.map((card) =>
          card.suit === cardToUpdate.suit && card.rank === cardToUpdate.rank
            ? { ...card, selected: !card.selected }
            : card,
        ),
      );
      onCardClick?.(cardToUpdate);
    };

    return <Hand {...args} cards={cards} onCardClick={updateCard} />;
  },
};

export const YourTurn: Story = { args: { isActive: true } };

/** Larger screens only: the toggle shows from 1024px wide. */
export const FaceDown: Story = { args: { isFaceDown: true } };
