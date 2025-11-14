import { useState } from 'react';
import { Button } from '~/components/ui/button';
import { PlayingCard } from '~/components/ui/playing-card';
import {
  PlayingCardDeck,
  PlayingCardDiscardPile,
  PlayingCardStack,
} from '~/components/ui/playing-card-stacks';
import { type PlayingCardValue, Rank, Suit } from '~/types/cards';

const playAreaCards = [
  <PlayingCard key='1' card={{ suit: Suit.HEARTS, rank: Rank.TEN }} />,
  <>
    <PlayingCard card={{ suit: Suit.DIAMONDS, rank: Rank.SEVEN }} />
    <PlayingCard card={{ suit: Suit.SPADES, rank: Rank.FOUR }} />
  </>,
  <>
    <PlayingCard card={{ suit: Suit.CLUBS, rank: Rank.THREE }} />
    <PlayingCard card={{ suit: Suit.SPADES, rank: Rank.ACE }} />
    <PlayingCard card={{ suit: Suit.SPADES, rank: Rank.JACK }} />
  </>,
  <>
    <PlayingCard card={{ suit: Suit.CLUBS, rank: Rank.EIGHT }} />
    <PlayingCard card={{ suit: Suit.HEARTS, rank: Rank.TEN }} />
  </>,
];

export function PlayArea() {
  const [discardCard, setDiscardCard] = useState<PlayingCardValue | null>(null);
  const [playAreaCardsIndex, setPlayAreaCardsIndex] = useState(0);
  const [playAreaCardsVisible, setPlayAreaCardsVisible] = useState(false);

  return (
    <div className='flex flex-col gap-6'>
      <div className='grid grid-cols-2 w-fit'>
        <PlayingCardDeck />
        <PlayingCardDiscardPile>
          {discardCard && <PlayingCard card={discardCard} />}
        </PlayingCardDiscardPile>
        <PlayingCardStack className='col-span-2'>
          {playAreaCardsVisible && playAreaCards[playAreaCardsIndex]}
        </PlayingCardStack>
      </div>

      <div>
        <Button onClick={() => setDiscardCard(null)}>Empty Discard</Button>
        <Button
          onClick={() => {
            setPlayAreaCardsIndex(
              (playAreaCardsIndex + 1) % playAreaCards.length,
            );
            setPlayAreaCardsVisible(true);
          }}
        >
          Play cards
        </Button>
        <Button
          onClick={() => {
            setDiscardCard({ suit: Suit.CLUBS, rank: Rank.EIGHT });
            setPlayAreaCardsVisible(false);
          }}
        >
          Discard
        </Button>
      </div>
    </div>
  );
}
