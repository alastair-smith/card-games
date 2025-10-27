import Link from 'next/link';
import type { ReactNode } from 'react';
import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '~/components/ui/breadcrumbs';
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
      <div className='flex h-dvh w-full max-w-[80rem] flex-col items-start gap-6 px-4 py-6'>
        <header className='flex w-full items-center justify-between self-start'>
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href='/'>PlayCards.Games</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{gameDisplayName[gameType]}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <div>{actions}</div>
        </header>
        <main className={cn('flex-1 w-full', className)}>{children}</main>
      </div>
    </div>
  );
}
