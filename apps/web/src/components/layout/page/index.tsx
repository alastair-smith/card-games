import { HomeIcon } from 'lucide-react';
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

type PageRootProps = {
  children: React.ReactNode;
  className?: string;
  fullscreen?: boolean;
  /** Fits the page to the screen, for pages whose content scrolls inside it. */
  isScreenHeight?: boolean | undefined;
  /** Below the scrolling content, such as a `PageFooter` */
  footer?: React.ReactNode;
};

export function PageRoot({
  children,
  className,
  fullscreen,
  isScreenHeight,
  footer,
}: PageRootProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-3 px-3',
        isScreenHeight ? 'h-dvh' : 'min-h-dvh',
        fullscreen ? '' : 'items-center',
        className,
      )}
    >
      {fullscreen ? (
        children
      ) : (
        <div
          className={cn(
            'w-7xl max-w-full flex flex-col gap-3',
            // Scrolls the header with the content. Positioned, so sr-only text
            // scrolls with it rather than stretching the page
            isScreenHeight
              ? 'relative min-h-0 flex-1 overflow-y-auto'
              : 'min-h-dvh',
          )}
        >
          {children}
        </div>
      )}
      {footer}
    </div>
  );
}

/** A strip across the full width of a `PageRoot`'s foot. */
export function PageFooter({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        '-mx-3 self-stretch border-t-2 border-white/30 bg-panel-background text-dark-text',
        className,
      )}
    >
      {/* Lines up with the page's content column */}
      <div className='mx-auto w-7xl max-w-full p-3'>{children}</div>
    </div>
  );
}

type PageHeaderProps = {
  breadcrumbs: {
    text: string;
    href?: string;
  }[];
  children?: React.ReactNode;
};

export function PageHeader({ breadcrumbs, children }: PageHeaderProps) {
  return (
    <header className='w-7xl max-w-full min-h-14 pt-1 flex flex-wrap gap-2 justify-between items-center self-center'>
      <Breadcrumb>
        <BreadcrumbList>
          {breadcrumbs.map(({ text, href }, index) => (
            <React.Fragment key={text}>
              {index > 0 && <BreadcrumbSeparator />}
              <BreadcrumbItem>
                {href ? (
                  <BreadcrumbLink asChild>
                    <Link href={href}>
                      {href === '/' ? (
                        <>
                          <span className='sr-only sm:not-sr-only'>{text}</span>
                          <HomeIcon className='block sm:hidden' size='16' />
                        </>
                      ) : (
                        text
                      )}
                    </Link>
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
