import { action } from '@ladle/react';
import { useState } from 'react';
import { type PlayingCardValue, Rank, Suit } from '~/types/cards';
import Hand from '.';

export default {
  title: 'Yaniv / Hand',
};

const defaultProps: React.ComponentProps<typeof Hand> = {
  cards: [
    {
      suit: Suit.CLUBS,
      rank: Rank.ACE,
      selected: false,
    },
    {
      suit: Suit.HEARTS,
      rank: Rank.KING,
      selected: false,
    },
    {
      suit: Suit.SPADES,
      rank: Rank.QUEEN,
      selected: false,
    },
    {
      suit: Suit.DIAMONDS,
      rank: Rank.JACK,
      selected: false,
    },
    {
      suit: Suit.CLUBS,
      rank: Rank.TEN,
      selected: false,
    },
    {
      suit: Suit.HEARTS,
      rank: Rank.NINE,
      selected: false,
    },
    {
      suit: Suit.SPADES,
      rank: Rank.EIGHT,
      selected: false,
    },
  ],
  isFiftyScoreHalved: false,
  isHundredScoreHalved: false,
  totalScore: 0,
  onCardClick: action('card clicked'),
};

export const FullHand = () => {
  const [cards, setCards] = useState(defaultProps.cards);

  const updateCard = (
    cardToUpdate: PlayingCardValue & { selected: boolean },
  ) => {
    setCards(
      cards.map((card) =>
        card.suit === cardToUpdate.suit && card.rank === cardToUpdate.rank
          ? { ...card, selected: !card.selected }
          : card,
      ),
    );
  };

  return <Hand {...defaultProps} cards={cards} onCardClick={updateCard} />;
};
