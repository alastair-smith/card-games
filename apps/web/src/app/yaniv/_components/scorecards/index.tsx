import type { PlayerName, UserId } from '~/types/entities';
import { cn } from '~/utils/cn';
import ScoreCard from '../scorecard';

type ScoreCardsProps = {
  className?: string;
  players: {
    id: UserId;
    cardCount: number;
    isFiftyScoreHalved: boolean;
    isHundredScoreHalved: boolean;
    name: PlayerName;
    score: number;
  }[];
};

export default function ScoreCards({ className, players }: ScoreCardsProps) {
  return (
    <div className={cn('grid grid-cols-2 md:grid-cols-3 gap-3', className)}>
      {players.map(({ id, ...player }) => (
        <ScoreCard key={id} {...player} />
      ))}
    </div>
  );
}
