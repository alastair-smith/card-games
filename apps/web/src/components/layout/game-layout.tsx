import type { ReactNode } from 'react';
import { type GameType, gameDisplayName } from '~/types/game';

import { cn } from '~/utils/cn';

type GameLayoutProps = {
  gameType: GameType;
  children: ReactNode;
  actions?: ReactNode;
  className?: string;
};

export default function GameLayout({
  gameType,
  children,
  actions,
  className,
}: GameLayoutProps) {
  return (
    <div className='flex min-h-dvh justify-center text-white'>
      <div className='flex h-dvh w-full max-w-[80rem] flex-col items-center gap-6 px-4 py-6'>
        <header className='flex w-full items-center justify-between self-start'>
          <h1 className='font-bold'>{gameDisplayName[gameType]}</h1>
          <div>{actions}</div>
        </header>
        <main className={cn('flex-1 w-full', className)}>{children}</main>
      </div>
    </div>
  );
}
