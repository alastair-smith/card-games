import type { ReactNode } from 'react';
import { type GameType, gameDisplayName } from '~/types/game';
import { cn } from '~/utils/cn';
import { PageHeader, PageRoot } from './page';

type GameLayoutProps = {
  gameType: GameType;
  children: ReactNode;
  actions?: ReactNode;
  footer?: ReactNode;
  className?: string | undefined;
};

export default function GameLayout({
  gameType,
  children,
  actions,
  footer,
  className,
}: GameLayoutProps) {
  return (
    <PageRoot isScreenHeight footer={footer}>
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
          'flex-auto w-full flex flex-col justify-center-safe',
          className,
        )}
      >
        {children}
      </main>
    </PageRoot>
  );
}
