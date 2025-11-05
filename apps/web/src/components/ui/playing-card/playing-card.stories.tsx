import { useState } from 'react';
import { JOKER_RANK, JokerSuit, RANKS, Rank, SUITS, Suit } from '~/types/cards';
import { Button } from '../button';
import { Card, CardContent, CardHeader } from '../card';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../table';
import { PlayingCard } from './playing-card';

const deck = SUITS.flatMap((suit) => {
  return RANKS.map((rank) => {
    return { rank, suit };
  });
});

export const Docs = () => (
  <Card>
    <CardHeader className='text-2xl font-medium'>PlayingCard</CardHeader>
    <CardContent>
      <Table className='w-fit bg-main-background text-dark-text'>
        <TableCaption>
          Variations of the PlayingCard selection states
        </TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Size</TableHead>
            <TableHead>Highlighted</TableHead>
            <TableHead>Not Selected (Front)</TableHead>
            <TableHead>Selected (Front)</TableHead>
            <TableHead>Not Selected (Back)</TableHead>
            <TableHead>Selected (Back)</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>Default</TableCell>
            <TableCell className='pt-14'>
              <DefaultCard />
            </TableCell>
            <TableCell className='pt-14'>
              <SelectedCard />
            </TableCell>
            <TableCell className='pt-14'>
              <DefaultBackCard />
            </TableCell>
            <TableCell className='pt-14'>
              <SelectedBackCard />
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Default (Highlighted)</TableCell>
            <TableCell className='pt-14'>
              <HighlightedCard />
            </TableCell>
            <TableCell className='pt-14'>
              <HighLightedAndSelectedCard />
            </TableCell>
            <TableCell className='pt-14'>
              <HighlightedBackCard />
            </TableCell>
            <TableCell className='pt-14'>
              <HighLightedAndSelectedBackCard />
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Small</TableCell>
            <TableCell className='pt-14'>
              <DefaultCardSm />
            </TableCell>
            <TableCell className='pt-14'>
              <SelectedCardSm />
            </TableCell>
            <TableCell className='pt-14'>
              <DefaultBackCardSm />
            </TableCell>
            <TableCell className='pt-14'>
              <SelectedBackCardSm />
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Small (Highlighted)</TableCell>
            <TableCell className='pt-14'>
              <HighlightedCardSm />
            </TableCell>
            <TableCell className='pt-14'>
              <HighLightedAndSelectedCardSm />
            </TableCell>
            <TableCell className='pt-14'>
              <HighlightedBackCardSm />
            </TableCell>
            <TableCell className='pt-14'>
              <HighLightedAndSelectedBackCardSm />
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Large</TableCell>
            <TableCell className='pt-14'>
              <DefaultCardLg />
            </TableCell>
            <TableCell className='pt-14'>
              <SelectedCardLg />
            </TableCell>
            <TableCell className='pt-14'>
              <DefaultBackCardLg />
            </TableCell>
            <TableCell className='pt-14'>
              <SelectedBackCardLg />
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Large (Highlighted)</TableCell>
            <TableCell className='pt-14'>
              <HighlightedCardLg />
            </TableCell>
            <TableCell className='pt-14'>
              <HighLightedAndSelectedCardLg />
            </TableCell>
            <TableCell className='pt-14'>
              <HighlightedBackCardLg />
            </TableCell>
            <TableCell className='pt-14'>
              <HighLightedAndSelectedBackCardLg />
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </CardContent>
  </Card>
);

export const DefaultCard = () => {
  return <PlayingCard card={{ rank: Rank.ACE, suit: Suit.SPADES }} />;
};

export const DefaultCardSm = () => {
  return <PlayingCard card={{ rank: Rank.ACE, suit: Suit.SPADES }} size='sm' />;
};

export const DefaultCardLg = () => {
  return <PlayingCard card={{ rank: Rank.ACE, suit: Suit.SPADES }} size='lg' />;
};

export const SelectedCard = () => {
  return <PlayingCard card={{ rank: Rank.ACE, suit: Suit.SPADES }} selected />;
};

export const SelectedCardSm = () => {
  return (
    <PlayingCard
      card={{ rank: Rank.ACE, suit: Suit.SPADES }}
      selected
      size='sm'
    />
  );
};

export const SelectedCardLg = () => {
  return (
    <PlayingCard
      card={{ rank: Rank.ACE, suit: Suit.SPADES }}
      selected
      size='lg'
    />
  );
};

export const DefaultBackCard = () => {
  return <PlayingCard card={null} />;
};

export const DefaultBackCardSm = () => {
  return <PlayingCard card={null} size='sm' />;
};

export const DefaultBackCardLg = () => {
  return <PlayingCard card={null} size='lg' />;
};

export const SelectedBackCard = () => {
  return <PlayingCard card={null} selected />;
};

export const SelectedBackCardSm = () => {
  return <PlayingCard card={null} selected size='sm' />;
};

export const SelectedBackCardLg = () => {
  return <PlayingCard card={null} selected size='lg' />;
};

export const HighlightedCard = () => {
  return (
    <PlayingCard card={{ rank: Rank.ACE, suit: Suit.SPADES }} highlighted />
  );
};

export const HighlightedCardSm = () => {
  return (
    <PlayingCard
      card={{ rank: Rank.ACE, suit: Suit.SPADES }}
      highlighted
      size='sm'
    />
  );
};

export const HighlightedCardLg = () => {
  return (
    <PlayingCard
      card={{ rank: Rank.ACE, suit: Suit.SPADES }}
      highlighted
      size='lg'
    />
  );
};

export const HighLightedAndSelectedCard = () => {
  return (
    <PlayingCard
      card={{ rank: Rank.ACE, suit: Suit.SPADES }}
      highlighted
      selected
    />
  );
};

export const HighLightedAndSelectedCardSm = () => {
  return (
    <PlayingCard
      card={{ rank: Rank.ACE, suit: Suit.SPADES }}
      highlighted
      selected
      size='sm'
    />
  );
};

export const HighLightedAndSelectedCardLg = () => {
  return (
    <PlayingCard
      card={{ rank: Rank.ACE, suit: Suit.SPADES }}
      highlighted
      selected
      size='lg'
    />
  );
};

export const HighlightedBackCard = () => {
  return <PlayingCard card={null} highlighted />;
};

export const HighlightedBackCardSm = () => {
  return <PlayingCard card={null} highlighted size='sm' />;
};

export const HighlightedBackCardLg = () => {
  return <PlayingCard card={null} highlighted size='lg' />;
};

export const HighLightedAndSelectedBackCard = () => {
  return <PlayingCard card={null} highlighted selected />;
};

export const HighLightedAndSelectedBackCardSm = () => {
  return <PlayingCard card={null} highlighted selected size='sm' />;
};

export const HighLightedAndSelectedBackCardLg = () => {
  return <PlayingCard card={null} highlighted selected size='lg' />;
};

export const WholeDeck = () => {
  return (
    <div className='p-10 flex flex-wrap gap-4'>
      <PlayingCard card={null} />
      <PlayingCard card={{ rank: JOKER_RANK, suit: JokerSuit.RED }} />
      <PlayingCard card={{ rank: JOKER_RANK, suit: JokerSuit.BLACK }} />
      {deck.map((card) => (
        <PlayingCard key={`${card.suit}_${card.rank}`} card={card} />
      ))}
    </div>
  );
};

export const WholeDeckSm = () => {
  return (
    <div className='p-10 flex flex-wrap gap-4'>
      <PlayingCard card={null} size='sm' />
      <PlayingCard card={{ rank: JOKER_RANK, suit: JokerSuit.RED }} size='sm' />
      <PlayingCard
        card={{ rank: JOKER_RANK, suit: JokerSuit.BLACK }}
        size='sm'
      />
      {deck.map((card) => (
        <PlayingCard key={`${card.suit}_${card.rank}`} card={card} size='sm' />
      ))}
    </div>
  );
};

export const WholeDeckLg = () => {
  return (
    <div className='p-10 flex flex-wrap gap-4'>
      <PlayingCard card={null} size='lg' />
      <PlayingCard card={{ rank: JOKER_RANK, suit: JokerSuit.RED }} size='lg' />
      <PlayingCard
        card={{ rank: JOKER_RANK, suit: JokerSuit.BLACK }}
        size='lg'
      />
      {deck.map((card) => (
        <PlayingCard key={`${card.suit}_${card.rank}`} card={card} size='lg' />
      ))}
    </div>
  );
};

export const WholeDeckSmSimple = () => {
  return (
    <div className='p-10 flex flex-wrap gap-4'>
      <PlayingCard card={null} size='sm' design='simple' />
      <PlayingCard
        card={{ rank: JOKER_RANK, suit: JokerSuit.RED }}
        size='sm'
        design='simple'
      />
      <PlayingCard
        card={{ rank: JOKER_RANK, suit: JokerSuit.BLACK }}
        size='sm'
        design='simple'
      />
      {deck.map((card) => (
        <PlayingCard
          key={`${card.suit}_${card.rank}`}
          card={card}
          size='sm'
          design='simple'
        />
      ))}
    </div>
  );
};

export const FlipCard = () => {
  const [showCard, setShowCard] = useState(false);
  const [cardHasValue, setCardHasValue] = useState(false);

  return (
    <div className='p-10 flex flex-col gap-8'>
      <Button onClick={() => setShowCard(!showCard)}>Deal card</Button>
      <Button
        onClick={() => {
          setCardHasValue(!cardHasValue);
        }}
      >
        Flip card
      </Button>
      <div className='flex flex-wrap gap-4'>
        {showCard && (
          <PlayingCard
            card={cardHasValue ? { rank: Rank.ACE, suit: Suit.SPADES } : null}
          />
        )}
      </div>
    </div>
  );
};

export const FlipCardSm = () => {
  const [showCard, setShowCard] = useState(false);
  const [cardHasValue, setCardHasValue] = useState(false);

  return (
    <div className='p-10 flex flex-col gap-8'>
      <Button onClick={() => setShowCard(!showCard)}>Deal card</Button>
      <Button
        onClick={() => {
          setCardHasValue(!cardHasValue);
        }}
      >
        Flip card
      </Button>
      <div className='flex flex-wrap gap-4'>
        {showCard && (
          <PlayingCard
            card={cardHasValue ? { rank: Rank.ACE, suit: Suit.SPADES } : null}
            size='sm'
          />
        )}
      </div>
    </div>
  );
};

export const FlipCardLg = () => {
  const [showCard, setShowCard] = useState(false);
  const [cardHasValue, setCardHasValue] = useState(false);

  return (
    <div className='p-10 flex flex-col gap-8'>
      <Button onClick={() => setShowCard(!showCard)}>Deal card</Button>
      <Button
        onClick={() => {
          setCardHasValue(!cardHasValue);
        }}
      >
        Flip card
      </Button>
      <div className='flex flex-wrap gap-4'>
        {showCard && (
          <PlayingCard
            card={cardHasValue ? { rank: Rank.ACE, suit: Suit.SPADES } : null}
            size='lg'
          />
        )}
      </div>
    </div>
  );
};
