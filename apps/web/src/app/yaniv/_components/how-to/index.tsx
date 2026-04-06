import { ClubIcon, DiamondIcon, HeartIcon } from 'lucide-react';
import { Button } from '~/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '~/components/ui/dialog';
import { PlayingCard } from '~/components/ui/playing-card';
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
  Rank,
  Suit,
  suitColorClass,
} from '~/types/cards';
import { cn } from '~/utils/cn';

export function HowTo({ className }: { className?: string }) {
  return (
    <div
      className={cn('flex flex-col gap-2 items-start justify-start', className)}
    >
      <section>
        <p>
          Yaniv is a game of playing and drawing cards where the player with the
          lowest score wins.
        </p>
      </section>

      <section className='flex flex-col gap-1'>
        <h3 className='text-base/relaxed font-semibold'>Taking a turn</h3>
        <ul className='list-disc list-inside'>
          <li>Play any card from your hand.</li>
          <li>
            After playing, pick up from the top of either the deck or discard
            pile.
          </li>
          <li>
            You can play multiple of the same rank card from your hand at once.
            For example:{' '}
            <span
              className={cn(
                'inline-flex items-center gap-0.5 font-bold',
                suitColorClass.hearts,
              )}
            >
              7
              <HeartIcon fill='currentColor' size={12} aria-label='hearts' />
            </span>
            ,{' '}
            <span
              className={cn(
                'inline-flex items-center gap-0.5 font-bold',
                suitColorClass.clubs,
              )}
            >
              7<ClubIcon fill='currentColor' size={12} aria-label='clubs' />
            </span>
            ,{' '}
            <span
              className={cn(
                'inline-flex items-center gap-0.5 font-bold',
                suitColorClass.diamonds,
              )}
            >
              7
              <DiamondIcon
                fill='currentColor'
                size={12}
                aria-label='diamonds'
              />
            </span>
            .
          </li>
          <li>
            You can also play a straight flush of 3 cards or more. For example:{' '}
            <span
              className={cn(
                'inline-flex items-center gap-0.5 font-bold',
                suitColorClass.hearts,
              )}
            >
              8
              <HeartIcon fill='currentColor' size={12} aria-label='hearts' />
            </span>
            ,{' '}
            <span
              className={cn(
                'inline-flex items-center gap-0.5 font-bold',
                suitColorClass.hearts,
              )}
            >
              9
              <HeartIcon fill='currentColor' size={12} aria-label='hearts' />
            </span>
            ,{' '}
            <span
              className={cn(
                'inline-flex items-center gap-0.5 font-bold',
                suitColorClass.hearts,
              )}
            >
              10
              <HeartIcon fill='currentColor' size={12} aria-label='hearts' />
            </span>
            .
          </li>
          <li>
            If you play the same rank card as the top of the discard then you
            don't need to pickup. For example if the top of the discard pile is{' '}
            <span
              className={cn(
                'inline-flex items-center gap-0.5 font-bold',
                suitColorClass.diamonds,
              )}
            >
              4
              <DiamondIcon
                fill='currentColor'
                size={12}
                aria-label='diamonds'
              />
            </span>{' '}
            and you have a{' '}
            <span
              className={cn(
                'inline-flex items-center gap-0.5 font-bold',
                suitColorClass.clubs,
              )}
            >
              4<ClubIcon fill='currentColor' size={12} aria-label='clubs' />
            </span>{' '}
            in your hand then you can play it without picking up a card.
          </li>
        </ul>
      </section>

      <section className='flex flex-col gap-1'>
        <h3 className='text-base/relaxed font-semibold'>Calling Yaniv</h3>
        <p>
          At the end of your turn if your hand total is 7 or less then you can
          call 'Yaniv' to signal the end of the round.
        </p>
        <p>
          Every other player will then get a final turn, they may also call
          'Yaniv' at the end of their turns if their hand totals are 7 or less.
        </p>
      </section>

      <section className='flex flex-col gap-1'>
        <h3 className='text-base/relaxed font-semibold'>Scoring</h3>
        <p>
          Players' hand scores are the sum of their card values. This is added
          to their total score.
        </p>
        <p>
          If a player called 'Yaniv' then they get a score of 0. If any other
          players also call 'Yaniv' then only the player with the lowest hand
          score gets 0, the rest get 25.
        </p>
        <p>
          The first time a player's total score reaches exactly 50 points it is
          halved to 25. The same happens at 100.
        </p>
        <p>
          The game ends when any player reaches a score of 200 or more. Then the
          player with the lowest score wins!
        </p>

        <Table rootClassName='overflow-x-clip'>
          <TableCaption>Card values in Yaniv</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Card</TableHead>
              <TableHead className='text-center'>Value</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className='flex flex-wrap gap-2 items-center text-xs'>
                <PlayingCard
                  card={{ rank: JOKER_RANK, suit: JokerSuit.RED }}
                  border
                />
                <PlayingCard
                  card={{ rank: JOKER_RANK, suit: JokerSuit.BLACK }}
                  border
                />
              </TableCell>
              <TableCell className='text-center'>0</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className='flex flex-wrap gap-2 items-center text-xs'>
                <PlayingCard
                  card={{ rank: Rank.ACE, suit: Suit.DIAMONDS }}
                  border
                />
                <PlayingCard
                  card={{ rank: Rank.ACE, suit: Suit.CLUBS }}
                  border
                />
                <PlayingCard
                  card={{ rank: Rank.ACE, suit: Suit.HEARTS }}
                  border
                />
                <PlayingCard
                  card={{ rank: Rank.ACE, suit: Suit.SPADES }}
                  border
                />
              </TableCell>
              <TableCell className='text-center'>1</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className='flex flex-wrap gap-2 items-center text-xs'>
                <PlayingCard
                  card={{ rank: Rank.TWO, suit: Suit.CLUBS }}
                  border
                />
                <PlayingCard
                  card={{ rank: Rank.THREE, suit: Suit.DIAMONDS }}
                  border
                />
                <PlayingCard
                  card={{ rank: Rank.FOUR, suit: Suit.SPADES }}
                  border
                />
                <PlayingCard
                  card={{ rank: Rank.FIVE, suit: Suit.HEARTS }}
                  border
                />
                <PlayingCard
                  card={{ rank: Rank.SIX, suit: Suit.CLUBS }}
                  border
                />
                <PlayingCard
                  card={{ rank: Rank.SEVEN, suit: Suit.DIAMONDS }}
                  border
                />
                <PlayingCard
                  card={{ rank: Rank.EIGHT, suit: Suit.SPADES }}
                  border
                />
                <PlayingCard
                  card={{ rank: Rank.NINE, suit: Suit.HEARTS }}
                  border
                />
                <PlayingCard
                  card={{ rank: Rank.TEN, suit: Suit.CLUBS }}
                  border
                />
              </TableCell>
              <TableCell className='text-center'>Face value</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className='flex flex-wrap gap-2 items-center text-xs'>
                <PlayingCard
                  card={{ rank: Rank.JACK, suit: Suit.DIAMONDS }}
                  border
                />
                <PlayingCard
                  card={{ rank: Rank.QUEEN, suit: Suit.SPADES }}
                  border
                />
                <PlayingCard
                  card={{ rank: Rank.KING, suit: Suit.HEARTS }}
                  border
                />
              </TableCell>
              <TableCell className='text-center'>10</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </section>
    </div>
  );
}

export function HowToDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size='sm' variant='secondary'>
          Help
        </Button>
      </DialogTrigger>
      <DialogContent
        className='sm:max-w-4xl max-h-[90dvh] grid-rows-[auto_1fr_auto] overflow-hidden'
        aria-describedby={undefined}
      >
        <DialogHeader>
          <DialogTitle>How to play Yaniv</DialogTitle>
        </DialogHeader>

        <HowTo className='overflow-y-auto min-h-0' />

        <DialogFooter>
          <DialogClose asChild>
            <Button>Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
