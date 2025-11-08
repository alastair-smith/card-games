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

export const EmptyDiscardPile = () => {
  return <PlayingCardDiscardPile />;
};

export const DiscardPileSingleCard = () => {
  return (
    <PlayingCardDiscardPile>
      <PlayingCard card={{ suit: Suit.CLUBS, rank: Rank.NINE }} />
    </PlayingCardDiscardPile>
  );
};

export const DiscardPileTwoCards = () => {
  return (
    <PlayingCardDiscardPile>
      <PlayingCard card={{ suit: Suit.CLUBS, rank: Rank.NINE }} />
      <PlayingCard card={{ suit: Suit.HEARTS, rank: Rank.SIX }} />
    </PlayingCardDiscardPile>
  );
};

export const DiscardPileThreeCards = () => {
  return (
    <PlayingCardDiscardPile>
      <PlayingCard card={{ suit: Suit.CLUBS, rank: Rank.NINE }} />
      <PlayingCard card={{ suit: Suit.HEARTS, rank: Rank.SIX }} />
      <PlayingCard card={{ suit: JokerSuit.BLACK, rank: JOKER_RANK }} />
    </PlayingCardDiscardPile>
  );
};

export const DiscardPileLotsOfCards = () => {
  return (
    <PlayingCardDiscardPile>
      <PlayingCard card={{ suit: Suit.CLUBS, rank: Rank.NINE }} />
      <PlayingCard card={{ suit: Suit.HEARTS, rank: Rank.SIX }} />
      <PlayingCard card={{ suit: JokerSuit.BLACK, rank: JOKER_RANK }} />
      <PlayingCard card={{ suit: Suit.CLUBS, rank: Rank.SEVEN }} />
    </PlayingCardDiscardPile>
  );
};

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

export const AnimatedDiscardPile = () => {
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
};
