'use client';

import { useEffect, useState } from 'react';
import { Switch } from '~/components/ui/switch';
import { getTelemetryConsent, setTelemetryConsent } from '~/telemetry/consent';
import { cn } from '~/utils/cn';

export function TelemetryToggle({ className }: { className?: string }) {
  const [isEnabled, setIsEnabled] = useState(false);

  useEffect(() => {
    setIsEnabled(getTelemetryConsent());
  }, []);

  function handleCheckedChange(checked: boolean) {
    setTelemetryConsent(checked);
    setIsEnabled(checked);
    window.location.reload();
  }

  return (
    <div
      className={cn(
        'flex items-center gap-3 text-sm text-light-text',
        className,
      )}
    >
      <Switch
        id='telemetry-toggle'
        checked={isEnabled}
        onCheckedChange={handleCheckedChange}
      />
      <label htmlFor='telemetry-toggle' className='cursor-pointer select-none'>
        Share anonymised usage to help improve this app
      </label>
    </div>
  );
}
