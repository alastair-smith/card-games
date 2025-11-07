'use client';

import {
  BotIcon,
  BotMessageSquareIcon,
  ClubIcon,
  DiamondIcon,
  HeartIcon,
  type Icon,
  ScanFaceIcon,
  SpadeIcon,
  SwordsIcon,
} from 'lucide-react';
import {
  FlippableBack,
  FlippableFront,
  FlippableRoot,
} from '~/components/ui/flippable';
import {
  JOKER_RANK,
  type JokerSuit,
  type PictureCardRank,
  type PlayingCardValue,
  RANK_DISPLAY,
  Rank,
  Suit,
  suitColor,
} from '~/types/cards';
import { isPictureCard } from '~/utils/cards';
import { cn } from '~/utils/cn';

const RANK_FACE_SYMBOL_SIZE = '0.61em';
export const MIN_CARD_HEIGHT = 'min-h-[5.7em]'; // used to reserve space

const suitSymbol = {
  [Suit.SPADES]: SpadeIcon,
  [Suit.HEARTS]: HeartIcon,
  [Suit.DIAMONDS]: DiamondIcon,
  [Suit.CLUBS]: ClubIcon,
} satisfies Record<Suit, typeof Icon>;

const pictureCardSymbol = {
  [Rank.KING]: BotIcon,
  [Rank.QUEEN]: BotMessageSquareIcon,
  [Rank.JACK]: SwordsIcon,
};

export function PlayingCard({
  card,
  className,
  cardClassName,
  onClick,
  selected,
  highlighted,
  design,
}: {
  card: PlayingCardValue | null;
  className?: string;
  cardClassName?: string;
  onClick?: () => void;
  selected?: boolean;
  highlighted?: boolean;
  design?: 'default' | 'simple';
}) {
  const highlightedClass = highlighted ? 'ring-4 ring-ring' : '';
  return (
    // TODO fix accessibility issues
    // biome-ignore lint/a11y/noStaticElementInteractions: todo
    // biome-ignore lint/a11y/useKeyWithClickEvents: todo
    <div
      onClick={onClick}
      className={cn(
        'w-[3.75em] h-[5.25em]',
        'text-4xl',
        onClick ? 'cursor-pointer' : '',
        selected && '-translate-y-12',
        className,
      )}
    >
      <FlippableRoot showFront={!!card}>
        <FlippableFront>
          <PlayingCardFace
            card={card}
            design={design}
            className={cn(highlightedClass, cardClassName)}
          />
        </FlippableFront>

        <FlippableBack>
          <PlayingCardBack className={cn(highlightedClass, cardClassName)} />
        </FlippableBack>
      </FlippableRoot>
    </div>
  );
}

function PlayingCardFace({
  className,
  card,
  design,
}: {
  className?: string;
  card: PlayingCardValue | null;
  design?: 'default' | 'simple';
}) {
  if (!card)
    return (
      <div
        className={cn('w-full h-full bg-white rounded-[0.22em]', className)}
      />
    );

  if (card.rank === JOKER_RANK) return <JokerCard color={card.suit} />;

  const SuitSymbol = suitSymbol[card.suit];
  const color = suitColor[card.suit];
  const isSimple = design === 'simple';

  return (
    <div
      className={cn(
        'flex flex-col bg-white p-[0.22em] rounded-[0.22em] w-full h-full',
        className,
      )}
      style={{ color }}
    >
      <div
        className={cn(
          'flex items-center gap-[0.11em] pb-[0.11em] leading-none',
          isSimple ? 'h-full w-full justify-center' : '',
        )}
      >
        <div className={cn('font-bold')}>{RANK_DISPLAY[card.rank]}</div>
        <SuitSymbol fill={color} size='0.8em' />
      </div>
      {!isSimple && (
        <div className='grid place-items-center p-[0.44em] border-[0.03em] rounded-[0.11em] flex-1'>
          {isPictureCard(card) ? (
            <PictureCardContent
              rank={card.rank}
              SuitSymbol={SuitSymbol}
              color={color}
            />
          ) : (
            <RankContent
              rank={Number(card.rank)}
              SuitSymbol={SuitSymbol}
              color={color}
            />
          )}
        </div>
      )}
    </div>
  );
}

function PictureCardContent({
  rank,
  SuitSymbol,
  color,
}: {
  rank: PictureCardRank;
  SuitSymbol: (typeof suitSymbol)[Suit];
  color: string;
}) {
  const PictureSymbol =
    rank === Rank.ACE ? SuitSymbol : pictureCardSymbol[rank];
  const useFill = rank === Rank.ACE || rank === Rank.JACK;

  return (
    <PictureSymbol className='size-full' fill={useFill ? color : 'none'} />
  );
}

function RankContent({
  rank,
  SuitSymbol,
  color,
}: {
  rank: number;
  SuitSymbol: (typeof suitSymbol)[Suit];
  color: string;
}) {
  const symbolSize = RANK_FACE_SYMBOL_SIZE;

  if (rank <= 3) {
    return (
      <div className='grid grid-cols-1 w-full h-full place-items-center'>
        {Array.from({ length: rank }).map((_, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: used for same symbols
          <SuitSymbol key={i} size={symbolSize} fill={color} />
        ))}
      </div>
    );
  }

  if (rank === 4 || rank === 6) {
    return (
      <div className='grid grid-cols-2 w-full h-full place-items-center'>
        {Array.from({ length: rank }).map((_, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: used for same symbols
          <SuitSymbol key={i} size={symbolSize} fill={color} />
        ))}
      </div>
    );
  }

  const longColLength = rank === 9 ? 4 : Math.ceil(rank / 3);
  const shortColLength = rank - 2 * longColLength;

  return (
    <div className='grid grid-cols-3 w-full h-full place-items-center'>
      <div className='h-full flex flex-col justify-between'>
        {Array.from({ length: longColLength }).map((_, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: used for same symbols
          <SuitSymbol key={i} size={symbolSize} fill={color} />
        ))}
      </div>
      <div className='h-full flex flex-col justify-around'>
        {Array.from({ length: shortColLength }).map((_, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: used for same symbols
          <SuitSymbol key={i} size={symbolSize} fill={color} />
        ))}
        {
          // sneaky hack as the middle col of 7 is not centered
          rank === 7 && (
            <SuitSymbol size={symbolSize} fill={color} className='invisible' />
          )
        }
      </div>
      <div className='h-full flex flex-col justify-between'>
        {Array.from({ length: longColLength }).map((_, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: used for same symbols
          <SuitSymbol key={i} size={symbolSize} fill={color} />
        ))}
      </div>
    </div>
  );
}

function JokerCard({ color }: { color: JokerSuit }) {
  return (
    <div
      className='flex flex-col w-full h-full bg-white p-[0.22em] rounded-[0.22em] leading-none'
      style={{ color }}
    >
      {/* Top left */}
      <div className='flex items-center gap-[0.056em] pb-[0.11em]'>
        <div className='font-bold w-full flex justify-center'>JOKER!</div>
      </div>

      {/* Middle */}
      <div className='grid place-items-center px-[0.44em] py-[0.22em] border-[0.03em] rounded-[0.11em] flex-1'>
        <ScanFaceIcon className='size-full' />
      </div>
    </div>
  );
}

export function PlayingCardBack({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'w-full h-full rounded-[0.22em] bg-white flex justify-center items-center',
        className,
      )}
    >
      <div
        className={cn(
          'w-[calc(100%-0.44em)] h-[calc(100%-0.44em)]',
          'bg-red-200 [background-image:repeating-linear-gradient(45deg,transparent,transparent_0.28em,#ef9a9a_0.28em,#ef9a9a_0.56em)]',
        )}
      />
    </div>
  );
}

export function ZeroPlayingCard({
  suit,
  className,
  onClick,
}: {
  suit: Suit;
  className?: string;
  onClick?: () => void;
}) {
  const SuitSymbol = suitSymbol[suit];
  const color = suitColor[suit];

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: todo
    // biome-ignore lint/a11y/useKeyWithClickEvents: todo
    <div
      onClick={onClick}
      className={cn(
        'w-[3.75em] h-[5.25em]',
        'text-4xl',
        onClick ? 'cursor-pointer' : '',
        className,
      )}
    >
      <div
        className='flex flex-col bg-white p-[0.22em] rounded-[0.22em] w-full h-full'
        style={{ color }}
      >
        <div className='flex items-center gap-[0.11em] pb-[0.11em]'>
          <div className={cn('font-bold')}>0</div>
          <SuitSymbol className='h-[0.9em]' fill={color} />
        </div>
        <div className='grid place-items-center p-[0.44em] border-[0.03em] rounded-[0.11em] flex-1'>
          <div className={cn('font-bold text-[2.7em]')}>0</div>
        </div>
      </div>
    </div>
  );
}
