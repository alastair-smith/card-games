import { expect, type Page, test } from '@playwright/test';

async function joinLobby(page: Page, gameUrl: string): Promise<void> {
  await page.goto(gameUrl);
  await page
    .getByRole('switch')
    .filter({ hasNot: page.locator('[data-disabled]') })
    .click();
}

// p1 uses the `page` fixture so it inherits baseURL from the config (the
// `browser` fixture does not inherit baseURL, so relative URLs would fail).
// p2/p3 navigate to the absolute gameUrl and don't need it.
test('create a game and see it start', async ({ page, browser }) => {
  const ctx2 = await browser.newContext();
  const ctx3 = await browser.newContext();

  const p2 = await ctx2.newPage();
  const p3 = await ctx3.newPage();

  try {
    // Player 1 creates the game
    await page.goto('/yaniv');
    await page.waitForURL(/\/yaniv\/[A-Z0-9]+/, { timeout: 15_000 });
    const gameUrl = page.url();

    // Players 2 and 3 join
    await joinLobby(p2, gameUrl);
    await joinLobby(p3, gameUrl);

    // Player 1 marks ready
    await page
      .getByRole('switch')
      .filter({ hasNot: page.locator('[data-disabled]') })
      .click();

    // All players ready — host starts the game
    const startBtn = page.getByRole('button', { name: 'Start Game' });
    await startBtn.waitFor({ state: 'visible', timeout: 15_000 });
    await startBtn.click();

    // Verify the game board is visible for all players
    await expect(page.getByRole('list', { name: 'Your hand' })).toBeVisible();
    await expect(p2.getByRole('list', { name: 'Your hand' })).toBeVisible();
    await expect(p3.getByRole('list', { name: 'Your hand' })).toBeVisible();
  } finally {
    await ctx2.close();
    await ctx3.close();
  }
});
