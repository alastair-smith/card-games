import { type Card, Joker, Rank, Suit } from "@/types/cards";
import { ClubIcon, DiamondIcon, HeartIcon, SpadeIcon } from "lucide-react";

const suitSymbol = {
  [Suit.spades]: SpadeIcon,
  [Suit.hearts]: HeartIcon,
  [Suit.diamonds]: DiamondIcon,
  [Suit.clubs]: ClubIcon,
} as const;

const suitColor = {
  [Suit.spades]: '#12212E',
  [Suit.hearts]: '#ff0000',
  [Suit.diamonds]: '#ff0000',
  [Suit.clubs]: '#12212E',
} as const;

function isPictureCard(rank: Rank): rank is 'A' | 'K' | 'Q' | 'J' {
  const singularRanks: Rank[] = ['A', 'K', 'Q', 'J'];
  return singularRanks.includes(rank);
}

export function PlayingCard({ card }: { card: Card }) {
  if (card.rank === 'Joker') { return <JokerCard color={card.suit} />; }

  const SuitSymbol = suitSymbol[card.suit];
  const color = suitColor[card.suit];

  return (
    <div className="grid grid-cols-[2ch,1fr,2ch] w-40 h-60 bg-white p-2 rounded-lg" style={{ color }}>
      {/* Top left */}
      <div className="flex flex-col items-center">
        <div className="font-bold">{card.rank}</div>
        <SuitSymbol size='1.5ch' fill={color} />
      </div>

      {/* Middle */}
      <div className="grid place-items-center">
        {isPictureCard(card.rank) ?
          (
            <SuitSymbol size='large' fill={color} />
          ) : (
            <RankContent
              rank={Number(card.rank)}
              SuitSymbol={SuitSymbol}
              color={color}
            />
          )}
      </div>
    </div>
  );
}

/** Helper function to determine grid layout for number cards */
function getGridCols(rank: number): string {
  switch (rank) {
    case 1: case 2: case 3:
      return "grid-cols-1";
    case 4: case 6:
      return "grid-cols-2";
    default:
      return "grid-cols-3";
  }
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
    <div className='grid grid-cols-3 w-full h-full place-items-center py-8'>
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

function JokerCard({ color }: { color: Joker['suit'] }) {
  return (
    <div>
      Joker {color}
    </div>
  );
}