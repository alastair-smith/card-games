'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { Button } from './ui/button';

export function CurrentUrlLink({ children }: { children: React.ReactNode }) {
  const url = useMemo(() => window.location.href, []);

  return (
    <Button asChild variant='secondary'>
      <Link href={url}>{children}</Link>
    </Button>
  );
}

export function CurrentUrlText() {
  const url = useMemo(() => window.location.href, []);

  return (
    <code className='bg-main-background text-dark-text rounded w-fit px-3 py-1'>
      {url}
    </code>
  );
}
