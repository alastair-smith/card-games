import { cn } from '~/utils/cn';

/**
 * A full-viewport frame that highlights the screen edges.
 */
export function ScreenEdgeHighlight({ className }: { className?: string }) {
  return (
    <div
      aria-hidden='true'
      className={cn(
        'pointer-events-none fixed inset-1 z-50 rounded-lg shadow-[0_0_0_100vmax_var(--color-highlight)]',
        className,
      )}
    />
  );
}
