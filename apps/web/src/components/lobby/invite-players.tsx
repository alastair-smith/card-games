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
        <div className='flex flex-row gap-3 flex-wrap sm:flex-nowrap'>
          <Input
            placeholder='Code'
            className='h-20 text-center font-mono text-4xl uppercase'
            name='code'
            value={code}
            readOnly
          />
          <Button
            className='sm:h-20 sm:text-xl px-6 w-full sm:max-w-3xs'
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
