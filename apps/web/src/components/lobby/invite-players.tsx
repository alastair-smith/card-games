'use client';

import type { GameCode } from '~/types/game';
import { cn } from '~/utils/cn';
import { Button } from '../ui/button';
import { Card, CardHeader } from '../ui/card';
import { Input } from '../ui/input';
import { toast } from '../ui/toast';

async function copyUrlToClipboard() {
  const { origin, pathname } = new URL(window.location.href);
  await navigator.clipboard.writeText(`${origin}${pathname}`);
  toast.success('Copied to clipboard.');
}

export default function InvitePlayers({
  code,
  className,
}: {
  code: GameCode;
  className?: string;
}) {
  return (
    <Card className={cn('w-fit', className)}>
      <CardHeader>
        <div className='flex gap-3 flex-wrap justify-center'>
          <Input
            placeholder='Code'
            className='h-20 min-w-60 max-w-80 text-center font-mono text-4xl uppercase flex-grow-[9999] basis-2'
            name='code'
            value={code}
            readOnly
          />
          <Button
            className='w-full grow basis-1 h-auto max-w-80 text-2xl'
            onClick={() => {
              void copyUrlToClipboard();
            }}
          >
            Copy Link
          </Button>
        </div>
      </CardHeader>
    </Card>
  );
}
