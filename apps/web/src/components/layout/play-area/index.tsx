import type React from 'react';
import { Children, cloneElement, isValidElement, type ReactNode } from 'react';
import { Card, CardHeader } from '~/components/ui/card';
import { cn } from '~/utils/cn';

export type PlayAreaRootProps = {
  children: ReactNode;
};

export function PlayAreaRoot({ children }: PlayAreaRootProps) {
  return (
    <div className='grid grid-cols-12 grid-rows-8 gap-12 w-full'>
      {Children.map(children, (child, index) => {
        if (!isValidElement(child)) return child;

        return cloneElement(child);
      })}
    </div>
  );
}

export type PlayAreaPlayerZoneProps = {
  children: ReactNode;
  style?: React.CSSProperties;
};

export function PlayAreaPlayerZone({
  children,
  style,
}: PlayAreaPlayerZoneProps) {
  return (
    <div style={style} className='flex flex-col items-center gap-2'>
      {children}
    </div>
  );
}

export type PlayAreaPlayerNameProps = {
  children: ReactNode;
};

export function PlayAreaPlayerName({ children }: PlayAreaPlayerNameProps) {
  return (
    <Card>
      <CardHeader>{children}</CardHeader>
    </Card>
  );
}
