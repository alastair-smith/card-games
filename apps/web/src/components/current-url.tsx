'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Button } from './ui/button';

export function CurrentUrlLink({ children }: { children: React.ReactNode }) {
  const [url, setUrl] = useState('');

  useEffect(() => {
    setUrl(window.location.href);
  }, []);

  return (
    <Button asChild variant='secondary'>
      <Link href={url}>{children}</Link>
    </Button>
  );
}

export function CurrentUrlText() {
  const [url, setUrl] = useState('');

  useEffect(() => {
    setUrl(window.location.href);
  }, []);

  return (
    <code className='bg-slate text-dark-text rounded w-fit p-3 break-all min-w-full min-h-12'>
      {url}
    </code>
  );
}
