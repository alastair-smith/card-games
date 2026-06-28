import type { CSSProperties } from 'react';
import { cn } from '~/utils/cn';
import { type PlayerColor, playerColorHighlight } from '~/utils/player-color';

/**
 * A full-viewport frame that highlights the screen edges. Tinted with the
 * player's colour when one is provided, otherwise the default highlight.
 */
export function ScreenEdgeHighlight({
  className,
  color,
}: {
  className?: string;
  color?: PlayerColor;
}) {
  return (
    <div
      aria-hidden='true'
      style={
        color
          ? ({
              '--color-highlight': playerColorHighlight(color),
            } as CSSProperties)
          : undefined
      }
      className={cn(
        'pointer-events-none fixed inset-1 z-50 rounded-lg shadow-[0_0_0_100vmax_var(--color-highlight)]',
        className,
      )}
    />
  );
}
