'use client';

import { useEffect, useState } from 'react';

let mswStarted = false;

export function MSWProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(
    process.env.NEXT_PUBLIC_API_MOCKING !== 'enabled',
  );

  useEffect(() => {
    if (process.env.NEXT_PUBLIC_API_MOCKING !== 'enabled') return;
    if (mswStarted) {
      setReady(true);
      return;
    }
    mswStarted = true;

    void (async () => {
      const { worker } = await import('../mocks/browser');
      await worker.start({
        onUnhandledRequest: 'warn',
        serviceWorker: {
          url: '/mockServiceWorker.js',
        },
      });
      setReady(true);
    })();
  }, []);

  if (!ready) return null;
  return <>{children}</>;
}
