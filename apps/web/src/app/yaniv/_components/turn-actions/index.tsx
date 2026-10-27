import {
  ArrowDownCircleIcon,
  ArrowRightCircleIcon,
  ArrowUpCircleIcon,
  CircleCheckIcon,
  MegaphoneIcon,
} from 'lucide-react';
import { Button } from '~/components/ui/button';
import { GameViewStage } from '~/types/games/yaniv';
import { cn } from '~/utils/cn';

type TurnActionsProps = {
  className?: string;
  stage: GameViewStage;
  isRunSelected?: boolean | undefined;
  onEndTurnClick: () => void;
  onYanivClick: () => void;
  onPlayCards: (direction?: 'ascending' | 'descending') => void;
  onStartNewRoundClick: () => void;
};

/** The buttons for your next move, if it has any. */
export function TurnActions({
  className,
  stage,
  isRunSelected,
  onEndTurnClick,
  onYanivClick,
  onPlayCards,
  onStartNewRoundClick,
}: TurnActionsProps) {
  return (
    <div
      className={cn(
        'flex shrink-0 justify-center gap-2 *:max-w-48 *:flex-1',
        className,
      )}
    >
      {stage === GameViewStage.PICKING_CARDS &&
        (isRunSelected ? (
          <>
            <Button onClick={() => onPlayCards('ascending')}>
              <ArrowUpCircleIcon />
              Play ascending
            </Button>
            <Button onClick={() => onPlayCards('descending')}>
              <ArrowDownCircleIcon />
              Play descending
            </Button>
          </>
        ) : (
          <Button onClick={() => onPlayCards()}>
            <CircleCheckIcon />
            Play Cards
          </Button>
        ))}

      {stage === GameViewStage.END_TURN && (
        <>
          <Button onClick={onYanivClick}>
            <MegaphoneIcon /> Yaniv!
          </Button>
          <Button onClick={onEndTurnClick}>
            End Turn
            <ArrowRightCircleIcon />
          </Button>
        </>
      )}

      {stage === GameViewStage.END_OF_ROUND && (
        <Button onClick={onStartNewRoundClick}>
          Start new round
          <ArrowRightCircleIcon />
        </Button>
      )}
    </div>
  );
}
