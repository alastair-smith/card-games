import { Children, cloneElement, isValidElement, type ReactNode } from 'react';
import { Card, CardHeader } from '~/components/ui/card';
import { MAX_NAME_LENGTH } from '~/types/entities';
import { cn } from '~/utils/cn';

const evenPlayerArchPositions = [
  'lg:row-start-8 lg:col-start-1',
  'lg:row-start-5 lg:col-start-2',
  'lg:row-start-2 lg:col-start-4',
  'lg:row-start-1 lg:col-start-7',
  'lg:row-start-1 lg:col-start-10',
  'lg:row-start-1 lg:col-start-13',
  'lg:row-start-1 lg:col-start-16',
  'lg:row-start-2 lg:col-start-19',
  'lg:row-start-5 lg:col-start-21',
  'lg:row-start-8 lg:col-start-22',
] as const satisfies `lg:row-start-${number} lg:col-start-${number}`[];

const oddPlayerArchPositions = [
  'lg:row-start-8 lg:col-start-1',
  'lg:row-start-5 lg:col-start-2',
  'lg:row-start-2 lg:col-start-4',
  'lg:row-start-1 lg:col-start-7',
  'lg:row-start-1 lg:col-start-10',
  'lg:row-start-1 lg:col-start-13',
  'lg:row-start-2 lg:col-start-16',
  'lg:row-start-5 lg:col-start-18',
  'lg:row-start-8 lg:col-start-19',
] as const satisfies `lg:row-start-${number} lg:col-start-${number}`[];

function getArchPosition(
  playerIndex: number,
  totalPlayers: number,
): `lg:row-start-${number} lg:col-start-${number}` | '' {
  const positions =
    totalPlayers % 2 === 0 ? evenPlayerArchPositions : oddPlayerArchPositions;

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
    <div
      className={cn(
        'grid grid-cols-[repeat(auto-fit,minmax(8rem,1fr))] gap-3',
        'lg:grid-cols-none',
        className,
      )}
    >
      {Children.map(children, (child, index) => {
        if (!isValidElement<{ className?: string }>(child)) return child;

        return cloneElement(child, {
          className: cn(
            'lg:row-span-3 lg:col-span-3 lg:self-start',
            getArchPosition(index, totalPlayers),
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
  className?: string;
  children: ReactNode;
};

export function PlayAreaPlayerName({
  className,
  children,
}: PlayAreaPlayerNameProps) {
  return (
    <div
      className={cn(
        'p-2 text-sm bg-alt-background rounded-lg text-center w-[calc(100%-1.5rem)]',
        className,
      )}
    >
      {children}
    </div>
  );
}
