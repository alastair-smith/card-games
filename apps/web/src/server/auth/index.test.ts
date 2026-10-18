// @vitest-environment node
// jose rejects jsdom's Uint8Array as a key, since it comes from a different realm

import { afterEach, describe, expect, test, vi } from 'vitest';
import { createAuthToken, getSession, nearExpiry } from '~/server/auth';

vi.mock('~/env', () => ({
  env: { AUTH_SECRET: 'unit-test-secret-at-least-32-characters-long' },
}));

const DAY_IN_MILLISECONDS = 24 * 60 * 60 * 1000;

afterEach(() => {
  vi.useRealTimers();
});

describe('auth tokens', () => {
  test('reads back the expiry the token was issued with', async () => {
    const { signedJWT, expiry } = await createAuthToken();

    const session = await getSession(signedJWT);

    expect(session?.expiry).toBeGreaterThan(expiry - 1000);
    expect(session?.expiry).toBeLessThanOrEqual(expiry);
  });

  test('does not renew a freshly issued token', async () => {
    const { signedJWT } = await createAuthToken();

    const session = await getSession(signedJWT);

    expect(session).not.toBeNull();
    expect(nearExpiry(session?.expiry ?? 0)).toBe(false);
  });

  test('renews a token once it is more than a day old', async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    const { signedJWT } = await createAuthToken();
    vi.setSystemTime(Date.now() + 2 * DAY_IN_MILLISECONDS);

    const session = await getSession(signedJWT);

    expect(session).not.toBeNull();
    expect(nearExpiry(session?.expiry ?? 0)).toBe(true);
  });
});
