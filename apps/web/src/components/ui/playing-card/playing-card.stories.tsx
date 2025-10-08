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
            <TableHead>Highlighted</TableHead>
            <TableHead>Not Selected (Front)</TableHead>
            <TableHead>Selected (Front)</TableHead>
            <TableHead>Not Selected (Back)</TableHead>
            <TableHead>Selected (Back)</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>Not Highlighted</TableCell>
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
            <TableCell>Highlighted</TableCell>
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
        </TableBody>
      </Table>
    </CardContent>
  </Card>
);

export const DefaultCard = () => {
  return <PlayingCard card={{ rank: Rank.ACE, suit: Suit.SPADES }} />;
};

export const SelectedCard = () => {
  return <PlayingCard card={{ rank: Rank.ACE, suit: Suit.SPADES }} selected />;
};

export const DefaultBackCard = () => {
  return <PlayingCard card={null} />;
};

export const SelectedBackCard = () => {
  return <PlayingCard card={null} selected />;
};

export const HighlightedCard = () => {
  return (
    <PlayingCard card={{ rank: Rank.ACE, suit: Suit.SPADES }} highlighted />
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

export const HighlightedBackCard = () => {
  return <PlayingCard card={null} highlighted />;
};

export const HighLightedAndSelectedBackCard = () => {
  return <PlayingCard card={null} highlighted selected />;
};

export const WholeDeck = () => {
  return (
    <div className='bg-felt-texture p-10 flex flex-wrap gap-4'>
      <PlayingCard card={null} />
      <PlayingCard card={{ rank: JOKER_RANK, suit: JokerSuit.RED }} />
      <PlayingCard card={{ rank: JOKER_RANK, suit: JokerSuit.BLACK }} />
      {deck.map((card) => (
        <PlayingCard key={`${card.suit}_${card.rank}`} card={card} />
      ))}
    </div>
  );
};

export const FlipCard = () => {
  const [showCard, setShowCard] = useState(false);
  const [cardHasValue, setCardHasValue] = useState(false);

  return (
    <div className='bg-felt-texture p-10 flex flex-col gap-8'>
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
