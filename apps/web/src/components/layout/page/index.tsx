import Link from 'next/link';
import React from 'react';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '~/components/ui/breadcrumbs';
import { cn } from '~/utils/cn';

type PageProps = {
  children: React.ReactNode;
  className?: string;
  fullscreen?: boolean;
};

export function Page({ children, className, fullscreen }: PageProps) {
  return (
    <div
      className={cn(
        'min-h-dvh flex flex-col gap-3 px-3',
        fullscreen ? '' : 'items-center',
        className,
      )}
    >
      {fullscreen ? (
        children
      ) : (
        <div className='w-7xl max-w-full min-h-dvh flex flex-col gap-3'>
          {children}
        </div>
      )}
    </div>
  );
}

type HeaderProps = {
  breadcrumbs: {
    text: string;
    href?: string;
  }[];
  children?: React.ReactNode;
};

export function Header({ breadcrumbs, children }: HeaderProps) {
  return (
    <header className='w-7xl max-w-full h-14 pt-1 flex justify-between items-center self-center'>
      <Breadcrumb>
        <BreadcrumbList>
          {breadcrumbs.map(({ text, href }, index) => (
            <React.Fragment key={text}>
              {index > 0 && <BreadcrumbSeparator />}
              <BreadcrumbItem>
                {href ? (
                  <BreadcrumbLink asChild>
                    <Link href={href}>{text}</Link>
                  </BreadcrumbLink>
                ) : (
                  <BreadcrumbPage>{text}</BreadcrumbPage>
                )}
              </BreadcrumbItem>
            </React.Fragment>
          ))}
        </BreadcrumbList>
      </Breadcrumb>

      <div>{children}</div>
    </header>
  );
}
