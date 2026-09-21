import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import type { ComponentProps } from 'react';
import { useState } from 'react';
import { Button } from '~/components/ui/button';
import {
  JOKER_RANK,
  JokerSuit,
  type PlayingCardValue,
  Rank,
  Suit,
} from '~/types/cards';
import { PlayingCard } from '../playing-card';
import { PlayingCardDiscardPile } from '.';

const pileCards: PlayingCardValue[] = [
  { suit: Suit.CLUBS, rank: Rank.NINE },
  { suit: Suit.HEARTS, rank: Rank.SIX },
  { suit: JokerSuit.BLACK, rank: JOKER_RANK },
  { suit: Suit.CLUBS, rank: Rank.SEVEN },
];

type DiscardPileStoryProps = ComponentProps<typeof PlayingCardDiscardPile> & {
  cardCount: number;
};

const meta: Meta<DiscardPileStoryProps> = {
  title: 'UI Components /Playing Card Discard Pile',
  component: PlayingCardDiscardPile,
  args: {
    cardCount: 1,
  },
  argTypes: {
    cardCount: { control: { type: 'range', min: 0, max: 4, step: 1 } },
  },
  render: ({ cardCount, ...args }) => (
    <PlayingCardDiscardPile {...args}>
      {pileCards.slice(0, cardCount).map((card) => (
        <PlayingCard key={`${card.suit}-${card.rank}`} card={card} />
      ))}
    </PlayingCardDiscardPile>
  ),
};

export default meta;

type Story = StoryObj<DiscardPileStoryProps>;

export const EmptyDiscardPile: Story = { args: { cardCount: 0 } };

export const DiscardPileSingleCard: Story = { args: { cardCount: 1 } };

export const DiscardPileTwoCards: Story = { args: { cardCount: 2 } };

export const DiscardPileThreeCards: Story = { args: { cardCount: 3 } };

export const DiscardPileLotsOfCards: Story = { args: { cardCount: 4 } };

const initialCardsForAnimation: PlayingCardValue[] = [
  { suit: Suit.CLUBS, rank: Rank.NINE },
  { suit: Suit.HEARTS, rank: Rank.SIX },
  { suit: JokerSuit.BLACK, rank: JOKER_RANK },
  { suit: Suit.DIAMONDS, rank: Rank.ACE },
];

const newCardsForAnimation: PlayingCardValue[] = [
  { suit: Suit.DIAMONDS, rank: Rank.ACE },
  { suit: Suit.SPADES, rank: Rank.KING },
  { suit: Suit.HEARTS, rank: Rank.QUEEN },
  { suit: Suit.CLUBS, rank: Rank.JACK },
  { suit: Suit.DIAMONDS, rank: Rank.TEN },
];

export const AnimatedDiscardPile: Story = {
  parameters: { controls: { disable: true } },
  render: () => {
    const [cards, setCards] = useState(initialCardsForAnimation);
    const [newCardIndex, setNewCardIndex] = useState(0);

    const handleClick = () => {
      setCards((currentCards) => {
        const nextCard = newCardsForAnimation[newCardIndex];
        if (!nextCard) return currentCards; // Should not happen
        const newCardsArray = [nextCard, ...currentCards.slice(0, 3)];
        setNewCardIndex((newCardIndex + 1) % newCardsForAnimation.length);
        return newCardsArray;
      });
    };

    return (
      <div className='flex flex-col gap-4 items-start'>
        <PlayingCardDiscardPile>
          {cards.map((card) => (
            <PlayingCard key={`${card.suit}-${card.rank}`} card={card} />
          ))}
        </PlayingCardDiscardPile>
        <Button onClick={handleClick}>Next card</Button>
      </div>
    );
  },
};
