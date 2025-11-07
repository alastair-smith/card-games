import { JOKER_RANK, JOKER_SUITS, JokerSuit, Rank, Suit } from '~/types/cards';
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
