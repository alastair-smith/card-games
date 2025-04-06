import { type PlayingCardValue, Joker, JOKER_RANK, JokerSuit, PictureCardRank, Rank, RANK_DISPLAY, Suit, suitColor } from "@/types/cards";
import { isPictureCard } from "@/utils/cards";
import { cn } from "@/utils/cn";
import { BotIcon, BotMessageSquareIcon, ClubIcon, DiamondIcon, HeartIcon, ScanFaceIcon, SpadeIcon, SwordsIcon } from "lucide-react";

const suitSymbol = {
  [Suit.SPADES]: SpadeIcon,
  [Suit.HEARTS]: HeartIcon,
  [Suit.DIAMONDS]: DiamondIcon,
  [Suit.CLUBS]: ClubIcon,
} satisfies Record<Suit, any>;

const pictureCardSymbol = {
  [Rank.KING]: BotIcon,
  [Rank.QUEEN]: BotMessageSquareIcon,
  [Rank.JACK]: SwordsIcon,
}

export function PlayingCard({ card, className, onClick }: { card: PlayingCardValue | null; className?: string; onClick?: () => void; }) {
  return (
    <div onClick={onClick} className={cn("w-40 h-60 [perspective:1000px]", onClick ? 'cursor-pointer' : '', className)}>
      <div
        className={cn(
          'relative w-full h-full duration-700 [transform-style:preserve-3d] [transform-origin:center] transition-transform [timing-function:cubic-bezier(0.4,0,0.2,1)]',
          card ? '[transform:rotateY(0deg)]' : '[transform:rotateY(180deg)]'
        )}
      >
        {/* Front */}
        <div className="absolute w-full h-full [backface-visibility:hidden]">
          <PlayingCardFace card={card} />
        </div>

        {/* Back */}
        <div className="absolute w-full h-full [backface-visibility:hidden] [transform:rotateY(180deg)]">
          <PlayingCardBack />
        </div>
      </div>
    </div>
  );
}

function PlayingCardFace({ card }: { card: PlayingCardValue | null }) {
  if (!card) return <div className="w-full h-full bg-white rounded-lg" />;

  if (card.rank === JOKER_RANK) return <JokerCard color={card.suit} />;

  const SuitSymbol = suitSymbol[card.suit];
  const color = suitColor[card.suit];

  return (
    <div
      className="flex flex-col bg-white p-2 rounded-lg w-full h-full"
      style={{ color }}
    >
      <div className="flex items-center gap-1 pb-1">
        <div className="font-bold text-4xl">{RANK_DISPLAY[card.rank]}</div>
        <SuitSymbol className="h-8" fill={color} />
      </div>
      <div className="grid place-items-center p-4 border rounded flex-1">
        {isPictureCard(card) ? (
          <PictureCardContent rank={card.rank} SuitSymbol={SuitSymbol} color={color} />
        ) : (
          <RankContent rank={Number(card.rank)} SuitSymbol={SuitSymbol} color={color} />
        )}
      </div>
    </div>
  );
}

function PictureCardContent({ rank, SuitSymbol, color }: { rank: PictureCardRank, SuitSymbol: typeof suitSymbol[Suit], color: string }) {
  const PictureSymbol = rank === Rank.ACE ? SuitSymbol : pictureCardSymbol[rank];
  const useFill = rank === Rank.ACE || rank === Rank.JACK;

  return <PictureSymbol className='size-full' fill={useFill ? color : 'none'} />;
}

function RankContent({ rank, SuitSymbol, color }: { rank: number, SuitSymbol: typeof suitSymbol[Suit], color: string }) {
  if (rank <= 3) {
    return (
      <div className='grid grid-cols-1 w-full h-full place-items-center'>
        {
          Array
            .from({ length: rank })
            .map((_, i) => (
              <SuitSymbol key={i} size='3ch' fill={color} />
            ))
        }
      </div>
    )
  }

  if (rank === 4 || rank === 6) {
    return (
      <div className='grid grid-cols-2 w-full h-full place-items-center'>
        {
          Array
            .from({ length: rank })
            .map((_, i) => (
              <SuitSymbol key={i} size='3ch' fill={color} />
            ))
        }
      </div>
    )
  }

  const longColLength = rank === 9 ? 4 : Math.ceil(rank / 3);
  const shortColLength = rank - (2 * longColLength);


  return (
    <div className='grid grid-cols-3 w-full h-full place-items-center'>
      <div className='h-full flex flex-col justify-between'>
        {
          Array
            .from({ length: longColLength })
            .map((_, i) => (
              <SuitSymbol key={i} size='3ch' fill={color} />
            ))
        }
      </div>
      <div className='h-full flex flex-col justify-around'>
        {
          Array
            .from({ length: shortColLength })
            .map((_, i) => (
              <SuitSymbol key={i} size='3ch' fill={color} />
            ))
        }
        {
          // sneaky hack as the middle col of 7 is not centered
          rank === 7 && <SuitSymbol size='3ch' fill={color} className='invisible' />
        }
      </div>
      <div className='h-full flex flex-col justify-between'>
        {
          Array
            .from({ length: longColLength })
            .map((_, i) => (
              <SuitSymbol key={i} size='3ch' fill={color} />
            ))
        }
      </div>
    </div>
  )
}

function JokerCard({ color }: { color: JokerSuit }) {
  return (
    <div className="flex flex-col w-full h-full bg-white p-2 rounded-lg" style={{ color }}>
      {/* Top left */}
      <div className="flex items-center gap-0.5 pb-1">
        <div className="font-bold text-4xl w-full flex justify-center">
          JOKER!
        </div>
      </div>

      {/* Middle */}
      <div className="grid place-items-center px-4 py-2 border rounded flex-1">
        <ScanFaceIcon className="size-full" />
      </div>
    </div>
  );
}

export function PlayingCardBack() {
  return (
    <div
      className="flex flex-col w-40 h-60 rounded-lg border-8 border-white bg-red-200 [background-image:repeating-linear-gradient(45deg,transparent,transparent_10px,#ef9a9a_10px,#ef9a9a_20px)]"
    />
  );
}
