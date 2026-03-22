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

    import('../mocks/browser').then(({ worker }) => {
      worker
        .start({
          onUnhandledRequest: 'warn',
          serviceWorker: {
            url: '/mockServiceWorker.js',
          },
        })
        .then(() => setReady(true));
    });
  }, []);

  if (!ready) return null;
  return <>{children}</>;
}
