'use client';

import { useEffect } from 'react';

let mswStarted = false;

export function MSWInit() {
  useEffect(() => {
    if (process.env.NEXT_PUBLIC_API_MOCKING !== 'enabled') return;
    if (mswStarted) return;
    mswStarted = true;

    import('../mocks/browser').then(({ worker }) => {
      worker.start({
        onUnhandledRequest: 'warn',
        serviceWorker: {
          url: '/mockServiceWorker.js',
        },
      });
    });
  }, []);

  return null;
}
