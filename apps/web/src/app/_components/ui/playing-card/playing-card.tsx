import { type Card, Joker, Suit } from "@/types/cards";
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
      <div className="grid place-items-center text-5xl"><SuitSymbol size='large' fill={color} /></div>
    </div>
  );
}

function JokerCard({ color }: { color: Joker['suit'] }) {
  return (
    <div>
      Joker {color}
    </div>
  );
}