import { ClubIcon, DiamondIcon, HeartIcon, SpadeIcon } from 'lucide-react';
import { Button } from '~/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
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
import { JOKER_RANK, JokerSuit, Rank, Suit, suitColor } from '~/types/cards';

export function HowTo() {
  return (
    <div className='flex flex-col gap-1 items-start justify-start'>
      <p>
        Yaniv is a 'Draw-and-Discard' 'Shedding' card game. The winner is the
        player with the lowest score at the end of the game.
      </p>
      <p>
        The game is played in rounds where each player is dealt a hand of cards
        and take turns playing cards.
      </p>

      <h3 className='text-base font-semibold'>Taking a turn</h3>
      <ul className='list-disc list-inside'>
        <li>Play any card from your hand.</li>
        <li>
          Pick up from the top of the deck or discard pile{' '}
          <span className='italic'>after</span> playing.
        </li>
        <li>
          You can play multiple of the same rank card from your hand at once.
          For example:{' '}
          <span
            className='inline-flex items-center gap-0.5 font-bold'
            style={{ color: suitColor.hearts }}
          >
            7<HeartIcon fill={suitColor.hearts} size={12} />
          </span>
          ,{' '}
          <span
            className='inline-flex items-center gap-0.5 font-bold'
            style={{ color: suitColor.clubs }}
          >
            7<ClubIcon fill={suitColor.clubs} size={12} />
          </span>
          ,{' '}
          <span
            className='inline-flex items-center gap-0.5 font-bold'
            style={{ color: suitColor.diamonds }}
          >
            7<DiamondIcon fill={suitColor.diamonds} size={12} />
          </span>
        </li>
        <li>
          If you play the same rank card as the top of the discard then you
          don't need to pickup. For example if the top of the discard pile is{' '}
          <span
            className='inline-flex items-center gap-0.5 font-bold'
            style={{ color: suitColor.hearts }}
          >
            4<DiamondIcon fill={suitColor.hearts} size={12} />
          </span>{' '}
          and you have a{' '}
          <span
            className='inline-flex items-center gap-0.5 font-bold'
            style={{ color: suitColor.clubs }}
          >
            4<ClubIcon fill={suitColor.clubs} size={12} />
          </span>{' '}
          in your hand then you can play it and skip the pickup step.
        </li>
        <li>
          You can also play a straight flush of 3 cards or more at once. For
          example:{' '}
          <span
            className='inline-flex items-center gap-0.5 font-bold'
            style={{ color: suitColor.hearts }}
          >
            8<HeartIcon fill={suitColor.hearts} size={12} />
          </span>
          ,{' '}
          <span
            className='inline-flex items-center gap-0.5 font-bold'
            style={{ color: suitColor.hearts }}
          >
            9<HeartIcon fill={suitColor.hearts} size={12} />
          </span>
          ,{' '}
          <span
            className='inline-flex items-center gap-0.5 font-bold'
            style={{ color: suitColor.hearts }}
          >
            10
            <HeartIcon fill={suitColor.hearts} size={12} />
          </span>
        </li>
      </ul>

      <h3 className='text-base font-semibold'>Calling Yaniv</h3>
      <p>
        At the end of your turn if your hand total is 7 or less then you can
        call 'Yaniv' to signal the end of the round.
      </p>
      <p>
        Every other player will then get a final turn, they may also call
        'Yaniv' at the end of their turns if their hand totals are 7 or less.
      </p>

      <h3 className='text-base font-semibold'>Scoring</h3>
      <p>
        Players hand scores are the sum of their card values. This is added to
        their total score.
      </p>
      <p>
        If a player called 'Yaniv' then they get a score of 0. Unless another
        player called 'Yaniv' and had a smaller hand total, then they get 25
        points.
      </p>
      <p>
        The first time a player's total score reaches exactly 50 points it is
        halved to 25. The same happens at 100.
      </p>
      <p>
        The game ends when any player reaches a score of 200 or more. Then the
        player with the lowest score wins!
      </p>

      <Table>
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
              <PlayingCard card={{ rank: Rank.ACE, suit: Suit.CLUBS }} border />
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
              <PlayingCard card={{ rank: Rank.TWO, suit: Suit.CLUBS }} border />
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
              <PlayingCard card={{ rank: Rank.SIX, suit: Suit.CLUBS }} border />
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
              <PlayingCard card={{ rank: Rank.TEN, suit: Suit.CLUBS }} border />
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
      <DialogContent className='sm:max-w-4xl'>
        <DialogHeader>
          <DialogTitle>How to play Yaniv</DialogTitle>
        </DialogHeader>
        <DialogDescription asChild>
          <HowTo />
        </DialogDescription>
        <DialogFooter>
          <DialogClose asChild>
            <Button>Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
