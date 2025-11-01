'use client';

import type { ReactNode } from 'react';
import { Button } from '~/components/ui/button';
import { toast } from '~/components/ui/toast';

export function CopyToClipboard({
  className,
  children,
  value,
}: {
  className?: string;
  children: ReactNode;
  value: string;
}) {
  const copy = async () => {
    await navigator.clipboard.writeText(value);
    toast.success('Copied to clipboard.');
  };

  return (
    <Button onClick={copy} className={className}>
      {children}
    </Button>
  );
}
