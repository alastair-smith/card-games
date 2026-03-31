'use client';

import {
  ChessKingIcon,
  ChessQueenIcon,
  ClubIcon,
  DiamondIcon,
  HeartIcon,
  type Icon,
  ScanFaceIcon,
  SpadeIcon,
  SwordsIcon,
} from 'lucide-react';
import { type CSSProperties, createElement } from 'react';
import {
  FlippableBack,
  FlippableFront,
  FlippableRoot,
} from '~/components/ui/flippable';
import {
  JOKER_RANK,
  type PictureCardRank,
  type PlayingCardValue,
  RANK_DISPLAY,
  Rank,
  Suit,
  suitColor,
  ZERO_RANK,
} from '~/types/cards';
import { isPictureCard } from '~/utils/cards';
import { cn } from '~/utils/cn';

const RANK_FACE_SYMBOL_SIZE = '0.61em';
export const MIN_CARD_HEIGHT = 'min-h-[5.7em]'; // used to reserve space
export const PLAYING_CARD_PROPORTIONS = 'w-[3.75em] h-[5.25em]';
export const PLAYING_CARD_MIN_PROPORTIONS = 'min-w-[3.75em] min-h-[5.25em]';
export const PLAYING_CARD_DEFAULT_SIZE = 'text-4xl';
const BORDER = 'border-[0.056em] border-border/50';

const suitSymbol = {
  [Suit.SPADES]: SpadeIcon,
  [Suit.HEARTS]: HeartIcon,
  [Suit.DIAMONDS]: DiamondIcon,
  [Suit.CLUBS]: ClubIcon,
} satisfies Record<Suit, typeof Icon>;

const pictureCardSymbol = {
  [Rank.KING]: ChessKingIcon,
  [Rank.QUEEN]: ChessQueenIcon,
  [Rank.JACK]: SwordsIcon,
  [JOKER_RANK]: ScanFaceIcon,
};

export function PlayingCard({
  card,
  className,
  cardClassName,
  onClick,
  selected,
  highlighted,
  design,
  style,
  border,
}: {
  card: PlayingCardValue | null;
  className?: string;
  cardClassName?: string;
  onClick?: () => void;
  selected?: boolean;
  highlighted?: boolean;
  design?: 'default' | 'simple';
  style?: CSSProperties;
  border?: boolean;
}) {
  const highlightedClass = highlighted ? 'bg-highlighted-card-background' : '';

  const cardContent = (
    <FlippableRoot showFront={!!card}>
      <FlippableFront>
        <PlayingCardFace
          card={card}
          design={design}
          className={cn(highlightedClass, border ? BORDER : '', cardClassName)}
        />
      </FlippableFront>

      <FlippableBack>
        <PlayingCardBack
          className={cn(highlightedClass, border ? BORDER : '', cardClassName)}
        />
      </FlippableBack>
    </FlippableRoot>
  );

  const sharedClassName = cn(
    PLAYING_CARD_PROPORTIONS,
    selected && '-translate-y-12',
    className,
  );

  if (onClick) {
    return (
      <button
        type='button'
        onClick={onClick}
        style={style}
        className={cn(
          sharedClassName,
          'cursor-pointer rounded-[0.22em] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring focus-visible:ring-offset-2',
        )}
      >
        {cardContent}
      </button>
    );
  }

  return (
    <div style={style} className={sharedClassName}>
      {cardContent}
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
        {card.rank !== JOKER_RANK &&
          createElement(suitSymbol[card.suit], { fill: color, size: '0.8em' })}
      </div>

      {!isSimple && (
        <div className='grid place-items-center p-[0.44em] border-[0.03em] rounded-[0.11em] flex-1'>
          {isPictureCard(card) ? (
            <PictureCardContent card={card} color={color} />
          ) : (
            <RankContent
              rank={Number(card.rank)}
              suit={card.suit}
              color={color}
            />
          )}
        </div>
      )}
    </div>
  );
}

function PictureCardContent({
  card,
  color,
}: {
  card: PlayingCardValue & { rank: PictureCardRank };
  color: string;
}) {
  if (card.rank === ZERO_RANK) {
    return <div className={cn('font-bold text-[2.5em] leading-none')}>0</div>;
  }

  const PictureSymbol =
    card.rank === Rank.ACE
      ? suitSymbol[card.suit]
      : pictureCardSymbol[card.rank];
  const useFill = card.rank === Rank.ACE || card.rank === Rank.JACK;

  return (
    <PictureSymbol className='size-full' fill={useFill ? color : 'none'} />
  );
}

function RankContent({
  rank,
  suit,
  color,
}: {
  rank: number;
  suit: Suit;
  color: string;
}) {
  const symbolSize = RANK_FACE_SYMBOL_SIZE;
  const SuitSymbol = suitSymbol[suit];

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
