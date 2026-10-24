import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useState } from 'react';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardHeader } from '~/components/ui/card';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table';
import {
  JOKER_RANK,
  JokerSuit,
  RANKS,
  Rank,
  SUITS,
  Suit,
  ZERO_RANK,
} from '~/types/cards';
import { PLAYING_CARD_DEFAULT_SIZE, PlayingCard } from '.';

const CARD_SIZES = [
  'text-xs',
  'text-sm',
  'text-base',
  'text-lg',
  'text-xl',
  'text-2xl',
  'text-3xl',
  'text-4xl',
  'text-5xl',
  'text-6xl',
] as const;

const meta = {
  title: 'UI Components / Playing Card',
  component: PlayingCard,
  args: {
    card: { suit: Suit.SPADES, rank: Rank.ACE },
    className: PLAYING_CARD_DEFAULT_SIZE,
    selected: false,
    highlighted: false,
    design: 'default',
  },
  argTypes: {
    design: { control: 'inline-radio', options: ['default', 'simple'] },
    className: { control: 'select', options: CARD_SIZES },
  },
} satisfies Meta<typeof PlayingCard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const FaceDown: Story = { args: { card: null } };

export const Selected: Story = { args: { selected: true } };

export const Highlighted: Story = { args: { highlighted: true } };

export const Overview: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className='p-6 flex flex-col gap-6'>
      <Card>
        <CardHeader className='text-2xl font-medium'>Sizing</CardHeader>
        <CardContent>
          <Table className='w-fit bg-main-background text-dark-text'>
            <TableCaption>Different sizes of playing cards</TableCaption>

            <TableHeader>
              <TableRow>
                <TableHead>Size</TableHead>
                <TableHead>Example Cards</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {[
                'text-xs',
                'text-sm',
                'text-base',
                'text-lg',
                'text-xl',
                'text-2xl',
                'text-3xl',
                'text-4xl',
                'text-5xl',
                'text-6xl',
                'text-7xl',
                'text-8xl',
                'text-9xl',
              ].map((className) => (
                <TableRow key={className}>
                  <TableCell>
                    {className}
                    {className === PLAYING_CARD_DEFAULT_SIZE
                      ? ' (Default)'
                      : ''}
                  </TableCell>
                  <TableCell className='flex gap-3'>
                    <PlayingCard
                      card={{ rank: Rank.ACE, suit: Suit.SPADES }}
                      className={className}
                    />
                    <PlayingCard
                      card={{ rank: Rank.TEN, suit: Suit.DIAMONDS }}
                      className={className}
                    />
                    <PlayingCard
                      card={{ rank: Rank.TEN, suit: Suit.DIAMONDS }}
                      className={className}
                      design='simple'
                    />
                    <PlayingCard card={null} className={className} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className='text-2xl font-medium'>
          Selecting Cards
        </CardHeader>
        <CardContent>
          <Table className='w-fit bg-main-background text-dark-text'>
            <TableCaption>
              Variations of the PlayingCard selection states
            </TableCaption>

            <TableHeader>
              <TableRow>
                <TableHead>Highlighted</TableHead>
                <TableHead>Not Selected (Face)</TableHead>
                <TableHead>Selected (Face)</TableHead>
                <TableHead>Not Selected (Back)</TableHead>
                <TableHead>Selected (Back)</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              <TableRow>
                <TableCell>Not Highlighted</TableCell>
                <TableCell className='pt-14'>
                  <PlayingCard card={{ rank: Rank.ACE, suit: Suit.SPADES }} />
                </TableCell>
                <TableCell className='pt-14'>
                  <PlayingCard
                    card={{ rank: Rank.ACE, suit: Suit.SPADES }}
                    selected
                  />
                </TableCell>
                <TableCell className='pt-14'>
                  <PlayingCard card={null} />
                </TableCell>
                <TableCell className='pt-14'>
                  <PlayingCard card={null} selected />
                </TableCell>
              </TableRow>

              <TableRow>
                <TableCell>Highlighted</TableCell>
                <TableCell className='pt-14'>
                  <PlayingCard
                    card={{ rank: Rank.ACE, suit: Suit.SPADES }}
                    highlighted
                  />
                </TableCell>
                <TableCell className='pt-14'>
                  <PlayingCard
                    card={{ rank: Rank.ACE, suit: Suit.SPADES }}
                    selected
                    highlighted
                  />
                </TableCell>
                <TableCell className='pt-14'>
                  <PlayingCard card={null} highlighted />
                </TableCell>
                <TableCell className='pt-14'>
                  <PlayingCard card={null} selected highlighted />
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  ),
};

export const FlipCard: Story = {
  parameters: { controls: { disable: true } },
  render: () => {
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
          {showCard && (
            <PlayingCard
              highlighted
              card={cardHasValue ? { rank: Rank.ACE, suit: Suit.SPADES } : null}
            />
          )}
        </div>
      </div>
    );
  },
};

const deck = SUITS.flatMap((suit) => {
  return RANKS.map((rank) => {
    return { rank, suit };
  });
});

const DeckGrid = ({ className }: { className: string | undefined }) => {
  return (
    <div className='p-10 flex flex-wrap gap-4'>
      <PlayingCard card={null} className={className} />
      <PlayingCard
        card={{ rank: JOKER_RANK, suit: JokerSuit.RED }}
        className={className}
      />
      <PlayingCard
        card={{ rank: JOKER_RANK, suit: JokerSuit.BLACK }}
        className={className}
      />
      <PlayingCard
        card={{ rank: ZERO_RANK, suit: Suit.DIAMONDS }}
        className={className}
      />
      {deck.map((card) => (
        <PlayingCard
          key={`${card.suit}_${card.rank}`}
          card={card}
          className={className}
        />
      ))}
    </div>
  );
};

export const FullDeck: Story = {
  args: { className: undefined },
  render: ({ className }) => <DeckGrid className={className} />,
};

export const FullDeck2xl: Story = {
  args: { className: 'text-2xl' },
  render: ({ className }) => <DeckGrid className={className} />,
};
