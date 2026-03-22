import { expect, test } from '@playwright/test';

test.describe('Yaniv lobby', () => {
  test('shows lobby waiting screen after joining', async ({ page }) => {
    await page.goto('/yaniv/LBBY11');

    await expect(
      page.getByRole('heading', { name: 'Yaniv Lobby' }),
    ).toBeVisible({
      timeout: 10_000,
    });
    // Bob appears in the players list (table cell on desktop, span on mobile)
    await expect(page.locator(':text-is("Bob"):visible')).toBeVisible();
  });

  test('shows invite players section with game code', async ({ page }) => {
    await page.goto('/yaniv/LBBY11');

    await expect(
      page.getByRole('heading', { name: 'Yaniv Lobby' }),
    ).toBeVisible({
      timeout: 10_000,
    });
    // InvitePlayers renders the code in a read-only input and a Copy Link button
    await expect(page.getByRole('button', { name: 'Copy Link' })).toBeVisible();
  });

  test('shows game board after host starts game', async ({ page }) => {
    await page.goto('/yaniv/LBBY11');

    await expect(
      page.getByRole('heading', { name: 'Yaniv Lobby' }),
    ).toBeVisible({
      timeout: 10_000,
    });

    await page.getByRole('button', { name: 'Start Game' }).click();

    // MSW pushes inProgressScenario onto the SSE stream after startGame mutation
    await expect(page.getByRole('button', { name: 'Yaniv!' })).toBeVisible();
  });
});
