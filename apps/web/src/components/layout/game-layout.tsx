import type { ReactNode } from 'react';
import { type GameType, gameDisplayName } from '~/types/game';
import { cn } from '~/utils/cn';
import { PageHeader, PageRoot } from './page';

type GameLayoutProps = {
  gameType: GameType;
  children: ReactNode;
  actions?: ReactNode;
  className?: string | undefined;
  /** Fits the page to the screen, so only panels inside `main` scroll. */
  isScreenHeight?: boolean;
};

export default function GameLayout({
  gameType,
  children,
  actions,
  className,
  isScreenHeight,
}: GameLayoutProps) {
  return (
    <PageRoot isScreenHeight={isScreenHeight}>
      <PageHeader
        breadcrumbs={[
          { text: 'PlayCards.Games', href: '/' },
          { text: gameDisplayName[gameType] },
        ]}
      >
        {actions}
      </PageHeader>

      <main
        className={cn(
          'flex-1 w-full flex flex-col justify-center',
          isScreenHeight && 'min-h-0',
          className,
        )}
      >
        {children}
      </main>
    </PageRoot>
  );
}
