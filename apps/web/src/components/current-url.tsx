'use client';

import { useEffect, useState } from 'react';
import { Button, type ButtonProps } from './ui/button';

export function CurrentUrlLink({
  variant,
  children,
}: {
  children: React.ReactNode;
  variant: ButtonProps['variant'];
}) {
  const [url, setUrl] = useState('');

  useEffect(() => {
    setUrl(window.location.href);
  }, []);

  return (
    <Button asChild variant={variant}>
      <a href={url}>{children}</a>
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
