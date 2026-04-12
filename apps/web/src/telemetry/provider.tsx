'use client';

import { useEffect } from 'react';
import { getTelemetryConsent } from './consent';

export function TelemetryProvider() {
  useEffect(() => {
    if (!getTelemetryConsent()) return;

    import('./client').then(({ initClientTelemetry }) => {
      initClientTelemetry();
    });
  }, []);

  return null;
}
