'use client';

import { CopyIcon, QrCodeIcon } from 'lucide-react';
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
      className={cn('flex items-center justify-between gap-3 p-4', className)}
    >
      <div className='flex flex-col'>
        <h2 className='text-sm font-semibold text-(--card-muted-text)'>
          Game code
        </h2>
        <p className='font-mono text-3xl font-bold uppercase tracking-widest'>
          {code}
        </p>
      </div>
      <div className='flex gap-2'>
        <Button
          variant='secondary'
          size='icon'
          aria-label='Copy invite link'
          onClick={() => {
            void copyUrlToClipboard(url);
          }}
        >
          <CopyIcon aria-hidden='true' />
        </Button>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant='secondary' size='icon' aria-label='Show QR code'>
              <QrCodeIcon aria-hidden='true' />
            </Button>
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
