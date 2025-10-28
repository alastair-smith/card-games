import type { ReactNode } from 'react';
import { type GameType, gameDisplayName } from '~/types/game';
import { cn } from '~/utils/cn';
import { Header, Page } from './page';

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
    <Page>
      <Header
        breadcrumbs={[
          { text: 'PlayCards.Games', href: '/' },
          { text: gameDisplayName[gameType] },
        ]}
      >
        {actions}
      </Header>

      <main
        className={cn('flex-1 w-full flex flex-col justify-center', className)}
      >
        {children}
      </main>
    </Page>
  );
}
