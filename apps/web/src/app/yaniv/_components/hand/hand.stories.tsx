import { action } from '@ladle/react';
import { useState } from 'react';
import { Rank, Suit } from '~/types/cards';
import type { YanivPlayingCard } from '~/types/games/yaniv';
import { PLAYER_COLOR_OPTIONS } from '~/utils/player-color';
import Hand from '.';

export default {
  title: 'Yaniv / Hand',
};

const defaultProps: React.ComponentProps<typeof Hand> = {
  color: 'cyan',
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
  totalScore: 0,
  onCardClick: action('card clicked'),
  handTotal: 0,
};

export const FullHand = () => {
  const [cards, setCards] = useState(defaultProps.cards);

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
  };

  return <Hand {...defaultProps} cards={cards} onCardClick={updateCard} />;
};

export const TotalInAllColours = () => (
  <div className='grid grid-cols-2 gap-4'>
    {PLAYER_COLOR_OPTIONS.map(({ key, name }) => (
      <div key={key} className='flex flex-col gap-1'>
        <span className='text-dark-text text-sm font-semibold'>{name}</span>
        <Hand {...defaultProps} color={key} handTotal={37} totalScore={28} />
      </div>
    ))}
  </div>
);
