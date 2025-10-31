import { ClubIcon, HeartIcon, SpadeIcon } from 'lucide-react';
import { PlayingCard } from '~/components/ui/playing-card/playing-card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table';
import { Rank, Suit } from '~/types/cards';

export function HighCardImage() {
  return (
    <div className='flex flex-wrap gap-12 bg-main-background m-8 p-8 text-light-text'>
      <div>
        <h2 className=''>High Card</h2>

        <div className='flex items-center gap-3 bg-main-background w-fit p-12 aspect-square text-dark-text'>
          <PlayingCard card={{ rank: Rank.FOUR, suit: Suit.DIAMONDS }} />
          <span className='text-9xl'>&lt;</span>
          <PlayingCard card={{ rank: Rank.ACE, suit: Suit.SPADES }} />
        </div>
      </div>

      <div>
        <h2 className=''>Yaniv</h2>

        <div className='flex items-center gap-3 bg-main-background w-fit p-12 aspect-square text-dark-text'>
          <PlayingCard card={{ rank: Rank.TWO, suit: Suit.DIAMONDS }} />
          <span className='text-9xl'>+</span>
          <PlayingCard card={{ rank: Rank.THREE, suit: Suit.SPADES }} />
          <span className='text-9xl'>&lt;</span>
          <span className='text-9xl'>7</span>
        </div>
      </div>

      <div>
        <h2 className=''>Blob</h2>

        <div className='flex items-center gap-3 bg-main-background w-fit p-6 aspect-square text-dark-text'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className='font-bold'>Cards</TableHead>
                <TableHead className='font-bold'>Suit</TableHead>
                <TableHead className='font-bold'>Player 1</TableHead>
                <TableHead className='font-bold'>Player 2</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody className='text-center'>
              <TableRow>
                <TableCell>4</TableCell>
                <TableCell>
                  <HeartIcon size='16' fill='var(--color-dark-text)' />
                </TableCell>
                <TableCell className='line-through'>0</TableCell>
                <TableCell className='line-through'>2</TableCell>
              </TableRow>

              <TableRow>
                <TableCell>3</TableCell>
                <TableCell>
                  <ClubIcon size='16' fill='var(--color-dark-text)' />
                </TableCell>
                <TableCell className='line-through'>1</TableCell>
                <TableCell className='line-through'>0</TableCell>
              </TableRow>

              <TableRow>
                <TableCell>2</TableCell>
                <TableCell>
                  <HeartIcon size='16' fill='var(--color-dark-text)' />
                </TableCell>
                <TableCell className='line-through'>0</TableCell>
                <TableCell>1</TableCell>
              </TableRow>

              <TableRow>
                <TableCell>1</TableCell>
                <TableCell>
                  <SpadeIcon size='16' fill='var(--color-dark-text)' />
                </TableCell>
                <TableCell>0</TableCell>
                <TableCell className='line-through'>0</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </div>

      <div>
        <h2 className=''>Shithead</h2>

        <div className='flex items-start gap-6 bg-main-background w-fit p-12 aspect-square text-dark-text'>
          <div className='translate-y-30'>
            <PlayingCard card={null} />
            <PlayingCard
              card={{ suit: Suit.SPADES, rank: Rank.ACE }}
              className='-translate-y-55 translate-x-2'
            />
          </div>
          <div className='translate-y-30'>
            <PlayingCard card={null} />
          </div>
          <div className='translate-y-30'>
            <PlayingCard card={null} />

            <PlayingCard
              card={{ suit: Suit.HEARTS, rank: Rank.TEN }}
              className='-translate-y-55 translate-x-2'
            />
          </div>
        </div>
      </div>

      <div>
        <h2 className=''>Fool</h2>

        <div className='flex flex-col items-center gap-y-6 bg-main-background w-[600px] h-[600px] py-6 aspect-square text-dark-text'>
          <div className='flex gap-6'>
            <div>
              <PlayingCard card={{ rank: Rank.SEVEN, suit: Suit.DIAMONDS }} />
              <PlayingCard
                card={{ rank: Rank.EIGHT, suit: Suit.DIAMONDS }}
                className='-translate-y-34 translate-x-2'
              />
            </div>

            <div>
              <PlayingCard card={{ rank: Rank.EIGHT, suit: Suit.CLUBS }} />
              <PlayingCard
                card={{ rank: Rank.NINE, suit: Suit.CLUBS }}
                className='-translate-y-34 translate-x-2'
              />
            </div>

            <div>
              <PlayingCard card={{ rank: Rank.EIGHT, suit: Suit.SPADES }} />
              <PlayingCard
                card={{ rank: Rank.TEN, suit: Suit.SPADES }}
                className='-translate-y-34 translate-x-2'
              />
            </div>
          </div>
          <div className='flex gap-6 -translate-y-30'>
            <div>
              <PlayingCard card={{ rank: Rank.TEN, suit: Suit.DIAMONDS }} />
              <PlayingCard
                card={{ rank: Rank.ACE, suit: Suit.DIAMONDS }}
                className='-translate-y-34 translate-x-2'
              />
            </div>

            <div>
              <PlayingCard card={{ rank: Rank.TEN, suit: Suit.CLUBS }} />
              <PlayingCard
                card={{ rank: Rank.ACE, suit: Suit.CLUBS }}
                className='-translate-y-34 translate-x-2'
              />
            </div>

            <div>
              <PlayingCard card={{ rank: Rank.TEN, suit: Suit.HEARTS }} />
              <PlayingCard
                card={{ rank: Rank.ACE, suit: Suit.HEARTS }}
                className='-translate-y-34 translate-x-2'
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
