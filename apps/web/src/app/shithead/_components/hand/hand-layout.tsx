import { type CSSProperties, type ReactNode, useId } from 'react';
import { cn } from '~/utils/cn';
import { type PlayerColor, playerColorHighlight } from '~/utils/player-color';

type HandLayoutProps = {
  className?: string | undefined;
  color: PlayerColor;
  title: string;
  hint?: string | undefined;
  isUserActing: boolean;
  actions?: ReactNode;
  children: ReactNode;
};

/** The box around the cards, with the buttons for the next move below it. */
export function HandLayout({
  className,
  color,
  title,
  hint,
  isUserActing,
  actions,
  children,
}: HandLayoutProps) {
  const titleId = useId();
  const style: CSSProperties & Record<'--color-highlight', string> = {
    '--color-highlight': playerColorHighlight(color),
  };

  return (
    <div style={style} className={cn('flex min-h-0 flex-col gap-3', className)}>
      <section
        aria-labelledby={titleId}
        className={cn(
          'flex min-h-0 flex-1 flex-col gap-2 rounded-lg border-2 border-white/30 bg-black/20 p-2',
          isUserActing && 'motion-safe:animate-pulse-bg',
        )}
      >
        <h2 id={titleId} className='m-0 text-center font-semibold text-sm'>
          {title}
        </h2>
        {/* A big hand scrolls here, keeping the buttons in view */}
        <div className='flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto p-1'>
          {children}
        </div>
        {hint && <p className='m-0 text-center text-sm text-balance'>{hint}</p>}
      </section>
      {/* Keeps the buttons' height when they're gone, so the cards don't shift */}
      <div className='flex h-10 shrink-0 justify-center gap-2 *:max-w-48 *:flex-1'>
        {actions}
      </div>
    </div>
  );
}
