import type { Page } from '@playwright/test';

export async function createGame(page: Page): Promise<string> {
  await page.goto('/');
  const code = await page.evaluate(async () => {
    const res = await fetch('/api/trpc/lobby.create?batch=1', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ '0': { json: { gameType: 'YANIV' } } }),
    });
    const data = (await res.json()) as Array<{
      result: { data: { json: { code: string } } };
    }>;
    return data[0]?.result?.data?.json?.code;
  });
  if (!code) throw new Error('Failed to create game');
  return code;
}
