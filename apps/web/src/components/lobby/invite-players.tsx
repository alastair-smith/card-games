'use client';

import { useMemo } from 'react';
import { QRCode } from 'react-qr-code';
import type { GameCode } from '~/types/game';
import { cn } from '~/utils/cn';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
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
    <Card
      variant='panel'
      className={cn('flex items-center justify-between gap-3 p-4', className)}
    >
      <div className='flex flex-col items-start gap-2'>
        <h2 className='text-sm font-semibold text-(--card-muted-text)'>
          Game code
        </h2>
        <p className='font-mono text-3xl font-bold uppercase tracking-widest'>
          {code}
        </p>
        <Button
          variant='secondary'
          size='sm'
          onClick={() => {
            void copyUrlToClipboard(url);
          }}
        >
          Copy link
        </Button>
      </div>
      <div>
        <Dialog>
          <DialogTrigger asChild>
            <button
              type='button'
              aria-label='Show a larger QR code'
              className='block cursor-pointer rounded-xl focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring'
            >
              <QRCode
                value={url}
                aria-hidden='true'
                className='block size-28 rounded-xl border-2 border-border bg-true-white p-1.5 sm:size-32'
              />
            </button>
          </DialogTrigger>
          <DialogContent className='sm:max-w-sm'>
            <DialogHeader>
              <DialogTitle>Scan to join</DialogTitle>
              <DialogDescription className='break-all'>
                Or go to {url}
              </DialogDescription>
            </DialogHeader>
            <QRCode
              value={url}
              className='mx-auto h-auto w-full max-w-64 rounded-xl border-2 border-border bg-true-white p-2'
            />
          </DialogContent>
        </Dialog>
      </div>
    </Card>
  );
}
