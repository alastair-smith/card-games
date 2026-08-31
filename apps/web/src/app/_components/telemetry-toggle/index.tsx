'use client';

import { useEffect, useState } from 'react';
import { Skeleton } from '~/components/ui/skeleton';
import { Switch } from '~/components/ui/switch';
import { getTelemetryConsent, setTelemetryConsent } from '~/telemetry/consent';
import { cn } from '~/utils/cn';

export function TelemetryToggle({ className }: { className?: string }) {
  const [isEnabled, setIsEnabled] = useState<boolean | null>(null);

  useEffect(() => {
    setIsEnabled(getTelemetryConsent());
  }, []);

  function handleCheckedChange(isEnabled: boolean) {
    setTelemetryConsent(isEnabled);
    // OTel providers can't be de-registered once initialised, so a full reload
    // is the only clean way to apply or remove client-side telemetry.
    window.location.reload();
  }

  return (
    <div
      className={cn(
        'flex items-center gap-3 text-sm text-light-text',
        className,
      )}
    >
      {isEnabled === null ? (
        <Skeleton className='h-6 w-11 shrink-0 rounded-full' />
      ) : (
        <Switch
          id='telemetry-toggle'
          checked={isEnabled}
          onCheckedChange={handleCheckedChange}
        />
      )}
      <label htmlFor='telemetry-toggle' className='cursor-pointer select-none'>
        Share pseudonymised usage to help improve this app
      </label>
    </div>
  );
}
