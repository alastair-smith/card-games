import type { ReactNode } from 'react';
import { type GameType, gameDisplayName } from '~/types/game';
import { cn } from '~/utils/cn';
import { PageHeader, PageRoot } from './page';

type GameLayoutProps = {
  gameType: GameType;
  children: ReactNode;
  actions?: ReactNode;
  className?: string | undefined;
};

export default function GameLayout({
  gameType,
  children,
  actions,
  className,
}: GameLayoutProps) {
  return (
    <PageRoot>
      <PageHeader
        breadcrumbs={[
          { text: 'PlayCards.Games', href: '/' },
          { text: gameDisplayName[gameType] },
        ]}
      >
        {actions}
      </PageHeader>

      <main
        className={cn('flex-1 w-full flex flex-col justify-center', className)}
      >
        {children}
      </main>
    </PageRoot>
  );
}
