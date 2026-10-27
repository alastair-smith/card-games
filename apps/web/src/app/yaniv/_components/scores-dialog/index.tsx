import { TrophyIcon } from 'lucide-react';
import type { ComponentProps } from 'react';
import { Button } from '~/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '~/components/ui/dialog';
import { Scoreboard } from '../scoreboard';

type ScoresDialogProps = Pick<
  ComponentProps<typeof Scoreboard>,
  'players' | 'userId'
> & { className?: string };

/** Every round's scores, opened from the header. */
export function ScoresDialog({
  className,
  players,
  userId,
}: ScoresDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size='sm' variant='secondary' className={className}>
          <TrophyIcon />
          Scores
        </Button>
      </DialogTrigger>
      <DialogContent
        aria-describedby={undefined}
        // The scoreboard's pinned columns paint --card-surface behind them,
        // which a panel Card would otherwise set; without it they fall back
        // to the darker felt
        className='max-h-[90dvh] overflow-y-auto border-2 border-white/30 bg-panel-background text-dark-text [--card-muted-text:var(--color-dark-text-disabled)] [--card-surface:var(--color-panel-background)]'
      >
        <DialogHeader>
          <DialogTitle>Scores</DialogTitle>
        </DialogHeader>
        <Scoreboard players={players} userId={userId} isInitiallyExpanded />
      </DialogContent>
    </Dialog>
  );
}
