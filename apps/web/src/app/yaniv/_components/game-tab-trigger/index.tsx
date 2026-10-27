import type { CSSProperties, ReactNode } from 'react';
import { TabsTrigger } from '~/components/ui/tabs';
import { cn } from '~/utils/cn';
import {
  type PlayerColor,
  playerColorHighlight,
  playerColorValue,
} from '~/utils/player-color';

type GameTabTriggerProps = {
  value: string;
  color: PlayerColor;
  isActionNeeded: boolean;
  children: ReactNode;
};

/** A tab that pulses in your colour when your next move is on it. */
export function GameTabTrigger({
  value,
  color,
  isActionNeeded,
  children,
}: GameTabTriggerProps) {
  return (
    <TabsTrigger
      value={value}
      style={
        { '--color-highlight': playerColorHighlight(color) } as CSSProperties
      }
      className={cn('h-full', isActionNeeded && 'motion-safe:animate-pulse-bg')}
    >
      {children}
      {isActionNeeded && (
        <>
          <span
            aria-hidden='true'
            style={{ backgroundColor: playerColorValue(color) }}
            className='size-2.5 rounded-full border border-white'
          />
          <span className='sr-only'>, your move</span>
        </>
      )}
    </TabsTrigger>
  );
}
