import type React from 'react';
import { Children, cloneElement, isValidElement, type ReactNode } from 'react';
import { Card, CardHeader } from '~/components/ui/card';
import { cn } from '~/utils/cn';

function getGridPosition(
  playerIndex: number,
  totalPlayers: number,
): `row-start-${number} col-start-${number}` {
  if (playerIndex === 0) {
    return 'row-start-8 col-start-1';
  }
  if (playerIndex === 1) {
    return 'row-start-5 col-start-2';
  }
  if (playerIndex === 2) {
    return 'row-start-2 col-start-4';
  }
  if (playerIndex === 3) {
    return 'row-start-1 col-start-7';
  }
  if (playerIndex === 4) {
    return 'row-start-1 col-start-10';
  }
  if (playerIndex === 5) {
    return 'row-start-1 col-start-13';
  }
  if (playerIndex === 6) {
    return 'row-start-1 col-start-16';
  }
  if (playerIndex === 7) {
    return 'row-start-2 col-start-19';
  }
  if (playerIndex === 8) {
    return 'row-start-5 col-start-21';
  }
  if (playerIndex === 9) {
    return 'row-start-8 col-start-22';
  }
  return '';
}

export type PlayAreaRootProps = {
  children: ReactNode;
  className?: string;
};
export function PlayAreaRoot({ children, className }: PlayAreaRootProps) {
  return (
    <div className={cn('grid w-full h-full gap-3', className)}>
      {Children.map(children, (child, index) => {
        if (!isValidElement(child)) return child;

        return cloneElement(child, {
          className: cn(
            'row-span-3 col-span-3 self-start',
            getGridPosition(index, 4),
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
