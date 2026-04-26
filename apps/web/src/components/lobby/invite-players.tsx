'use client';

import { useMemo } from 'react';
import QRCode from 'react-qr-code';
import type { GameCode } from '~/types/game';
import { cn } from '~/utils/cn';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Input } from '../ui/input';
import { toast } from '../ui/toast';

async function copyUrlToClipboard(url: string) {
  await navigator.clipboard.writeText(url);
  toast.success('Copied to clipboard.');
}

export default function InvitePlayers({
  code,
  className,
}: {
  code: GameCode;
  className?: string;
}) {
  const url = useMemo(() => {
    const { origin, pathname } = new URL(window.location.href);
    return `${origin}${pathname}`;
  }, []);

  return (
    <Card className={cn('w-fit', className)}>
      <CardContent className='p-4 flex gap-3 justify-center items-center flex-col sm:flex-row'>
        <div className='flex items-center justify-center row-span-2'>
          <QRCode
            value={url}
            className='border-border p-2 border-2 rounded-xl bg-true-white'
          />
        </div>
        <div className='flex flex-col gap-3'>
          <Input
            placeholder='Code'
            className='h-20 text-center font-mono text-4xl uppercase'
            name='code'
            value={code}
            readOnly
          />
          <Button
            className='sm:h-20 sm:text-xl px-6 w-full'
            onClick={() => {
              void copyUrlToClipboard(url);
            }}
          >
            Copy Link
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
