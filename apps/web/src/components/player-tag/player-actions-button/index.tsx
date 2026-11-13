import { EllipsisVerticalIcon } from 'lucide-react';
import type { ComponentProps } from 'react';
import { Button } from '~/components/ui/button';
import type { PlayerName } from '~/types/entities';
import { cn } from '~/utils/cn';
import { type PlayerColor, playerColorValue } from '~/utils/player-color';

/** A ⋮ button in a player's colour, to join to their tag in a `ButtonGroup`. */
export function PlayerActionsButton({
  className,
  name,
  color,
  ...buttonProps
}: Omit<ComponentProps<typeof Button>, 'color' | 'children'> & {
  name: PlayerName;
  color: PlayerColor;
}) {
  return (
    <Button
      variant='secondary'
      size='icon'
      style={{ backgroundColor: playerColorValue(color) }}
      className={cn(
        // No transition, so it changes colour with the tag
        'h-auto w-7 border-white text-white transition-none hover:brightness-110 sm:w-8',
        className,
      )}
      {...buttonProps}
    >
      <EllipsisVerticalIcon
        strokeWidth={3}
        aria-hidden='true'
        className='icon-outline-black'
      />
      <span className='sr-only'>Actions for {name}</span>
    </Button>
  );
}
