import { expect, type Page, test } from '@playwright/test';

async function joinLobby(page: Page, gameUrl: string): Promise<void> {
  await page.goto(gameUrl);
  await page
    .getByRole('switch')
    .filter({ hasNot: page.locator('[data-disabled]') })
    .click();
}

test('create a game and see it start', async ({ browser }) => {
  const ctx1 = await browser.newContext();
  const ctx2 = await browser.newContext();
  const ctx3 = await browser.newContext();

  const p1 = await ctx1.newPage();
  const p2 = await ctx2.newPage();
  const p3 = await ctx3.newPage();

  try {
    // Player 1 creates the game
    await p1.goto('/yaniv');
    await p1.waitForURL(/\/yaniv\/[A-Z0-9]+/, { timeout: 15_000 });
    const gameUrl = p1.url();

    // Players 2 and 3 join
    await Promise.all([joinLobby(p2, gameUrl), joinLobby(p3, gameUrl)]);

    // Player 1 marks ready
    await p1
      .getByRole('switch')
      .filter({ hasNot: p1.locator('[data-disabled]') })
      .click();

    // All players ready — host starts the game
    const startBtn = p1.getByRole('button', { name: 'Start Game' });
    await startBtn.waitFor({ state: 'visible', timeout: 15_000 });
    await startBtn.click();

    // Verify the game board is visible for all players
    await expect(p1.getByRole('list', { name: 'Your hand' })).toBeVisible();
    await expect(p2.getByRole('list', { name: 'Your hand' })).toBeVisible();
    await expect(p3.getByRole('list', { name: 'Your hand' })).toBeVisible();
  } finally {
    await ctx1.close();
    await ctx2.close();
    await ctx3.close();
  }
});
