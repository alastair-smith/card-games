'use client';

import { useEffect, useState } from 'react';
import { Switch } from '~/components/ui/switch';
import { getTelemetryConsent, setTelemetryConsent } from '~/telemetry/consent';

export function TelemetryToggle() {
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
    <div className='flex items-center gap-3 text-sm text-dark-text/60'>
      <Switch
        id='telemetry-toggle'
        checked={isEnabled}
        onCheckedChange={handleCheckedChange}
      />
      <label htmlFor='telemetry-toggle' className='cursor-pointer select-none'>
        Share usage data to help improve this app
      </label>
    </div>
  );
}
