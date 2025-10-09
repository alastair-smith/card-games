import { Children, cloneElement, isValidElement, type ReactNode } from 'react';
import { Card, CardHeader } from '~/components/ui/card';
import { cn } from '~/utils/cn';

const evenPlayerPositions = [
  'row-start-8 col-start-1',
  'row-start-5 col-start-2',
  'row-start-2 col-start-4',
  'row-start-1 col-start-7',
  'row-start-1 col-start-10',
  'row-start-1 col-start-13',
  'row-start-1 col-start-16',
  'row-start-2 col-start-19',
  'row-start-5 col-start-21',
  'row-start-8 col-start-22',
] as const satisfies `row-start-${number} col-start-${number}`[];

const oddPlayerPositions = [
  'row-start-8 col-start-1',
  'row-start-5 col-start-2',
  'row-start-2 col-start-4',
  'row-start-1 col-start-7',
  'row-start-1 col-start-10',
  'row-start-1 col-start-13',
  'row-start-2 col-start-16',
  'row-start-5 col-start-18',
  'row-start-8 col-start-19',
] as const satisfies `row-start-${number} col-start-${number}`[];

function getGridPosition(
  playerIndex: number,
  totalPlayers: number,
): `row-start-${number} col-start-${number}` | '' {
  const positions =
    totalPlayers % 2 === 0 ? evenPlayerPositions : oddPlayerPositions;

  if (totalPlayers === 1) {
    return positions[4];
  }

  if (totalPlayers > positions.length || totalPlayers < 1) {
    return '';
  }

  const step = (positions.length - 1) / (totalPlayers - 1);
  const positionIndex = Math.round(playerIndex * step);

  const position = positions[positionIndex];

  return position ?? '';
}

export type PlayAreaRootProps = {
  children: ReactNode;
  className?: string;
};
export function PlayAreaRoot({ children, className }: PlayAreaRootProps) {
  const totalPlayers = Children.count(children);
  return (
    <div className={cn('grid w-full h-full gap-3', className)}>
      {Children.map(children, (child, index) => {
        if (!isValidElement<{ className?: string }>(child)) return child;

        return cloneElement(child, {
          className: cn(
            'row-span-3 col-span-3 self-start',
            getGridPosition(index, totalPlayers),
            child.props.className,
          ),
        });
      })}
    </div>
  );
}

export type PlayAreaPlayerZoneProps = {
  children: ReactNode;
  className?: string;
};

export function PlayAreaPlayerZone({
  children,
  className,
}: PlayAreaPlayerZoneProps) {
  return (
    <div className={cn('flex flex-col items-center gap-1', className)}>
      {children}
    </div>
  );
}

export type PlayAreaPlayerNameProps = {
  children: ReactNode;
};

export function PlayAreaPlayerName({ children }: PlayAreaPlayerNameProps) {
  return (
    <Card className='rounded'>
      <CardHeader className='p-2'>{children}</CardHeader>
    </Card>
  );
}
