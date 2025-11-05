import { ClubIcon, HeartIcon, SpadeIcon } from 'lucide-react';
import { Children, cloneElement, isValidElement, type ReactNode } from 'react';
import { Card, CardContent, CardHeader } from '~/components/ui/card';
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
import { cn } from '~/utils/cn';

function ImageSizing({
  title,
  children,
  scaleSquare = '',
  scaleOg = '',
}: {
  title: string;
  children: ReactNode;
  scaleSquare?: string;
  scaleOg?: string;
}) {
  return (
    <Card>
      <CardHeader>{title}</CardHeader>
      <CardContent>
        <div className='flex flex-col bg-main-background p-2'>
          <div className='bg-main-background w-[250px] h-[250px] flex items-center justify-center border border-white'>
            {Children.map(children, (child) => {
              if (!isValidElement<{ className?: string }>(child)) return child;

              return cloneElement(child, {
                className: cn(scaleSquare, child.props.className),
              });
            })}
          </div>
          <div className='bg-main-background aspect-[1.91/1] w-[1200px] h-[630px] flex items-center justify-center border border-white'>
            {Children.map(children, (child) => {
              if (!isValidElement<{ className?: string }>(child)) return child;

              return cloneElement(child, {
                className: cn(scaleOg, child.props.className),
              });
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function GameImages() {
  return (
    <div className='flex flex-col gap-12 p-6 w-fit'>
      <ImageSizing title='High Card' scaleSquare='scale-60' scaleOg='scale-250'>
        <div className='flex items-center gap-3 w-fit text-dark-text'>
          <PlayingCard card={{ rank: Rank.FOUR, suit: Suit.DIAMONDS }} />
          <span className='text-9xl'>&lt;</span>
          <PlayingCard card={{ rank: Rank.ACE, suit: Suit.SPADES }} />
        </div>
      </ImageSizing>

      <ImageSizing title='Yaniv' scaleSquare='scale-40' scaleOg='scale-200'>
        <div className='flex items-center gap-3 bg-main-background w-fit text-dark-text'>
          <PlayingCard card={{ rank: Rank.TWO, suit: Suit.DIAMONDS }} />
          <span className='text-9xl'>+</span>
          <PlayingCard card={{ rank: Rank.THREE, suit: Suit.SPADES }} />
          <span className='text-9xl'>&lt;</span>
          <span className='text-9xl'>7</span>
        </div>
      </ImageSizing>

      <ImageSizing title='Blob' scaleSquare='scale-70' scaleOg='scale-200'>
        <div className='flex items-center gap-3 bg-main-background w-fit p-6 text-dark-text'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className='font-bold'>Cards</TableHead>
                <TableHead className='font-bold'>Suit</TableHead>
                <TableHead className='font-bold'>Jeff</TableHead>
                <TableHead className='font-bold'>Ingrid</TableHead>
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
      </ImageSizing>

      <ImageSizing title='Shithead' scaleSquare='scale-48' scaleOg='scale-210'>
        <div className='flex items-start gap-6 w-fit text-dark-text'>
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
      </ImageSizing>

      <ImageSizing title='Fool' scaleSquare='scale-40' scaleOg='scale-120'>
        <div className='flex flex-col items-center gap-y-6 translate-y-13 text-dark-text'>
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
      </ImageSizing>
    </div>
  );
}
