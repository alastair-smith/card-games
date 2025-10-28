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

const RANK_FACE_SYMBOL_SIZE = '1.375rem';
const CARD_WIDTH = 'w-34';
const CARD_HEIGHT = 'h-48';
export const MIN_CARD_HEIGHT = 'min-h-51'; // used to reserve space
const FONT_SIZE = 'text-4xl';
const SMALL_CARD_WIDTH = 'w-16';
const SMALL_CARD_HEIGHT = 'h-22.5';
const SMALL_FONT_SIZE = 'text-2xl';

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
  onClick,
  selected,
  highlighted,
  size,
}: {
  card: PlayingCardValue | null;
  className?: string;
  onClick?: () => void;
  selected?: boolean;
  highlighted?: boolean;
  size?: 'default' | 'sm';
}) {
  const [cardHeight, cardWidth] =
    size === 'sm'
      ? [SMALL_CARD_HEIGHT, SMALL_CARD_WIDTH]
      : [CARD_HEIGHT, CARD_WIDTH];

  return (
    // TODO fix accessibility issues
    // biome-ignore lint/a11y/noStaticElementInteractions: todo
    // biome-ignore lint/a11y/useKeyWithClickEvents: todo
    <div
      onClick={onClick}
      className={cn(
        cardWidth,
        cardHeight,
        '[perspective:1000px]',
        'transition-transform duration-200 ease-in-out',
        onClick ? 'cursor-pointer' : '',
        selected && '-translate-y-12',
        className,
      )}
    >
      <div
        className={cn(
          'relative w-full h-full duration-700 [transform-style:preserve-3d] [transform-origin:center] transition-transform [timing-function:cubic-bezier(0.4,0,0.2,1)]',
          card ? '[transform:rotateY(0deg)]' : '[transform:rotateY(180deg)]',
          'rounded-lg',
          highlighted && 'ring-4 ring-ring',
        )}
      >
        {/* Front */}
        <div className='absolute w-full h-full [backface-visibility:hidden]'>
          <PlayingCardFace card={card} size={size} />
        </div>

        {/* Back */}
        <div className='absolute w-full h-full [backface-visibility:hidden] [transform:rotateY(180deg)]'>
          <PlayingCardBack size={size} />
        </div>
      </div>
    </div>
  );
}

function PlayingCardFace({
  card,
  size,
}: {
  card: PlayingCardValue | null;
  size?: 'default' | 'sm';
}) {
  if (!card) return <div className='w-full h-full bg-white rounded-lg' />;

  if (card.rank === JOKER_RANK) return <JokerCard color={card.suit} />;

  const SuitSymbol = suitSymbol[card.suit];
  const color = suitColor[card.suit];

  return (
    <div
      className='flex flex-col bg-white p-2 rounded-lg w-full h-full'
      style={{ color }}
    >
      <div
        className={cn(
          'flex items-center gap-1 pb-1',
          size === 'sm' ? 'h-full w-full justify-center' : '',
        )}
      >
        <div
          className={cn(
            'font-bold',
            size === 'sm' ? SMALL_FONT_SIZE : FONT_SIZE,
          )}
        >
          {RANK_DISPLAY[card.rank]}
        </div>
        <SuitSymbol className='h-8' fill={color} />
      </div>
      {size !== 'sm' && (
        <div className='grid place-items-center p-4 border rounded flex-1'>
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
  if (rank <= 3) {
    return (
      <div className='grid grid-cols-1 w-full h-full place-items-center'>
        {Array.from({ length: rank }).map((_, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: used for same symbols
          <SuitSymbol key={i} size={RANK_FACE_SYMBOL_SIZE} fill={color} />
        ))}
      </div>
    );
  }

  if (rank === 4 || rank === 6) {
    return (
      <div className='grid grid-cols-2 w-full h-full place-items-center'>
        {Array.from({ length: rank }).map((_, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: used for same symbols
          <SuitSymbol key={i} size={RANK_FACE_SYMBOL_SIZE} fill={color} />
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
          <SuitSymbol key={i} size={RANK_FACE_SYMBOL_SIZE} fill={color} />
        ))}
      </div>
      <div className='h-full flex flex-col justify-around'>
        {Array.from({ length: shortColLength }).map((_, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: used for same symbols
          <SuitSymbol key={i} size={RANK_FACE_SYMBOL_SIZE} fill={color} />
        ))}
        {
          // sneaky hack as the middle col of 7 is not centered
          rank === 7 && (
            <SuitSymbol
              size={RANK_FACE_SYMBOL_SIZE}
              fill={color}
              className='invisible'
            />
          )
        }
      </div>
      <div className='h-full flex flex-col justify-between'>
        {Array.from({ length: longColLength }).map((_, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: used for same symbols
          <SuitSymbol key={i} size={RANK_FACE_SYMBOL_SIZE} fill={color} />
        ))}
      </div>
    </div>
  );
}

function JokerCard({ color }: { color: JokerSuit }) {
  return (
    <div
      className='flex flex-col w-full h-full bg-white p-2 rounded-lg'
      style={{ color }}
    >
      {/* Top left */}
      <div className='flex items-center gap-0.5 pb-1'>
        <div className='font-bold text-4xl w-full flex justify-center'>
          JOKER!
        </div>
      </div>

      {/* Middle */}
      <div className='grid place-items-center px-4 py-2 border rounded flex-1'>
        <ScanFaceIcon className='size-full' />
      </div>
    </div>
  );
}

export function PlayingCardBack({ size }: { size?: 'default' | 'sm' }) {
  const [cardHeight, cardWidth] =
    size === 'sm'
      ? [SMALL_CARD_HEIGHT, SMALL_CARD_WIDTH]
      : [CARD_HEIGHT, CARD_WIDTH];

  return (
    <div
      className={cn(
        cardWidth,
        cardHeight,
        'flex flex-col rounded-lg border-8 border-white bg-red-200 [background-image:repeating-linear-gradient(45deg,transparent,transparent_10px,#ef9a9a_10px,#ef9a9a_20px)]',
      )}
    />
  );
}

export function ZeroPlayingCard({
  suit,
  className,
  onClick,
  size,
}: {
  suit: Suit;
  className?: string;
  onClick?: () => void;
  size?: 'default' | 'sm';
}) {
  const [cardHeight, cardWidth] =
    size === 'sm'
      ? [SMALL_CARD_HEIGHT, SMALL_CARD_WIDTH]
      : [CARD_HEIGHT, CARD_WIDTH];

  const SuitSymbol = suitSymbol[suit];
  const color = suitColor[suit];

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: todo
    // biome-ignore lint/a11y/useKeyWithClickEvents: todo
    <div
      onClick={onClick}
      className={cn(
        cardWidth,
        cardHeight,
        onClick ? 'cursor-pointer' : '',
        className,
      )}
    >
      <div
        className='flex flex-col bg-white p-2 rounded-lg w-full h-full'
        style={{ color }}
      >
        <div className='flex items-center gap-1 pb-1'>
          <div className='font-bold text-4xl'>0</div>
          <SuitSymbol className='h-8' fill={color} />
        </div>
        <div className='grid place-items-center p-4 border rounded flex-1'>
          <div className='font-bold text-8xl'>0</div>
        </div>
      </div>
    </div>
  );
}
