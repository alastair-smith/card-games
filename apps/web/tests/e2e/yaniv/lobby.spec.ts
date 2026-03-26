import { expect, test } from '@playwright/test';
import { createGame } from '../helpers';

test('three players join a lobby and host starts the game', async ({
  browser,
}) => {
  const [p1Ctx, p2Ctx, p3Ctx] = await Promise.all([
    browser.newContext(),
    browser.newContext(),
    browser.newContext(),
  ]);
  const [p1, p2, p3] = await Promise.all([
    p1Ctx.newPage(),
    p2Ctx.newPage(),
    p3Ctx.newPage(),
  ]);

  let gameCode: string;

  try {
    await test.step('host creates a game', async () => {
      gameCode = await createGame(p1);
      await p1.goto(`/yaniv/${gameCode}`);
      await expect(
        p1.getByRole('heading', { name: 'Yaniv Lobby' }),
      ).toBeVisible({ timeout: 10_000 });
    });

    await test.step('two more players join', async () => {
      await Promise.all([
        p2.goto(`/yaniv/${gameCode}`),
        p3.goto(`/yaniv/${gameCode}`),
      ]);
      await expect(
        p2.getByRole('heading', { name: 'Yaniv Lobby' }),
      ).toBeVisible({ timeout: 10_000 });
      await expect(
        p3.getByRole('heading', { name: 'Yaniv Lobby' }),
      ).toBeVisible({ timeout: 10_000 });
    });

    await test.step('all three players are visible in the lobby', async () => {
      // Desktop table has one switch per real player row (no switches in placeholder rows)
      await expect(p1.locator('table tbody [role="switch"]')).toHaveCount(3, {
        timeout: 5_000,
      });
    });

    await test.step('all players mark themselves ready', async () => {
      // Each player has one non-disabled switch (their own ready toggle)
      // Both desktop and mobile views render — target the table row switch
      await Promise.all(
        [p1, p2, p3].map((page) =>
          page.locator('table tbody [role="switch"]:not([disabled])').click(),
        ),
      );
    });

    await test.step('host starts the game', async () => {
      await p1.getByRole('button', { name: 'Start Game' }).click();
      await Promise.all(
        [p1, p2, p3].map((page) =>
          expect(page.getByText('Hand total:')).toBeVisible({
            timeout: 10_000,
          }),
        ),
      );
    });
  } finally {
    await Promise.all([p1Ctx.close(), p2Ctx.close(), p3Ctx.close()]);
  }
});
