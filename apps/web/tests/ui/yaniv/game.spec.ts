import { expect, test } from '@playwright/test';

test.describe('Yaniv game - game board', () => {
  test('shows game board with dealt hand', async ({ page }) => {
    await page.goto('/yaniv/GAME11');

    // Hand total is shown — confirms game state has loaded
    await expect(page.getByText('Hand total:')).toBeVisible({
      timeout: 10_000,
    });

    // Controls show Yaniv! since hand total is 6 (≤7)
    await expect(page.getByRole('button', { name: 'Yaniv!' })).toBeVisible();
  });

  test('shows both players in scorecards', async ({ page }) => {
    await page.goto('/yaniv/GAME11');

    await expect(page.getByText('Hand total:')).toBeVisible({
      timeout: 10_000,
    });
    await expect(page.getByText('Alice')).toBeVisible();
    await expect(page.getByText('Bob')).toBeVisible();
  });
});

test.describe('Yaniv game - playing cards', () => {
  test('turn passes to opponent after ending turn', async ({ page }) => {
    // PRCD11 = PROCEED step (player has already picked up) — End Turn calls endTurnMutation directly
    await page.goto('/yaniv/PRCD11');

    await expect(page.getByRole('button', { name: 'End Turn' })).toBeVisible({
      timeout: 10_000,
    });

    await page.getByRole('button', { name: 'End Turn' }).click();

    // MSW pushes waitingForOpponentScenario — Bob's turn now
    await expect(page.getByText('Bob is thinking')).toBeVisible();
  });
});

test.describe('Yaniv game - picking up from discard', () => {
  test('shows pickup controls after playing cards', async ({ page }) => {
    // HIHN11 = high hand (total 11 > 7) — Yaniv not callable, Play Cards button shown
    await page.goto('/yaniv/HIHN11');

    await expect(page.getByRole('button', { name: 'Play Cards' })).toBeVisible({
      timeout: 10_000,
    });

    await page.getByRole('button', { name: 'Play Cards' }).click();

    // MSW pushes pickupStepScenario (PICKUP_CARD step) — no Play Cards button
    await expect(
      page.getByRole('button', { name: 'Play Cards' }),
    ).not.toBeVisible();
  });
});

test.describe('Yaniv game - calling Yaniv', () => {
  test('round summary appears after Yaniv is called', async ({ page }) => {
    await page.goto('/yaniv/GAME11');

    // Hand total is 6 (≤7), so Yaniv! button is shown immediately
    await expect(page.getByRole('button', { name: 'Yaniv!' })).toBeVisible({
      timeout: 10_000,
    });

    await page.getByRole('button', { name: 'Yaniv!' }).click();

    // MSW pushes roundSummaryScenario (REDEAL step) → RoundSummary renders
    await expect(page.getByText('Round Summary')).toBeVisible();
  });
});

test.describe('Yaniv game - round summary', () => {
  test('shows per-round scores before next round begins', async ({ page }) => {
    await page.goto('/yaniv/RNDS11');

    await expect(page.getByText('Round Summary')).toBeVisible({
      timeout: 10_000,
    });
    await expect(page.getByRole('cell', { name: 'Alice' })).toBeVisible();
    await expect(page.getByRole('cell', { name: 'Bob' })).toBeVisible();
    // Bob scored 14 points in the round
    await expect(page.getByRole('cell', { name: '14' })).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Start new round' }),
    ).toBeVisible();
  });

  test('returns to game board after starting a new round', async ({ page }) => {
    await page.goto('/yaniv/RNDS11');

    await expect(page.getByText('Round Summary')).toBeVisible({
      timeout: 10_000,
    });
    await page.getByRole('button', { name: 'Start new round' }).click();

    // MSW pushes inProgressScenario → game board reappears
    await expect(page.getByRole('button', { name: 'Yaniv!' })).toBeVisible();
  });
});

test.describe('Yaniv game - opponent actions', () => {
  test('shows round summary when opponent calls Yaniv', async ({ page }) => {
    await page.goto('/yaniv/WAIT11');

    await expect(page.getByText('Bob is thinking')).toBeVisible({
      timeout: 10_000,
    });

    // Simulate the server pushing a state update triggered by Bob calling Yaniv
    await page.evaluate(() =>
      fetch('/api/mock/yaniv/push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: 'WAIT11', scenario: 'roundSummary' }),
      }),
    );

    await expect(page.getByText('Round Summary')).toBeVisible();
  });

  test('returns to game board when opponent starts new round', async ({
    page,
  }) => {
    await page.goto('/yaniv/WAIT11');

    await expect(page.getByText('Bob is thinking')).toBeVisible({
      timeout: 10_000,
    });

    // Simulate the server pushing a new round after Bob starts it
    await page.evaluate(() =>
      fetch('/api/mock/yaniv/push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: 'WAIT11', scenario: 'inProgress' }),
      }),
    );

    await expect(page.getByRole('button', { name: 'Yaniv!' })).toBeVisible();
  });
});

test.describe('Yaniv game - game over', () => {
  test('shows winner announcement with final scores', async ({ page }) => {
    await page.goto('/yaniv/GVER11');

    // Alice wins with 195 points
    await expect(page.getByText(/You win with a score of 195/)).toBeVisible({
      timeout: 10_000,
    });
    await expect(page.getByRole('cell', { name: '195' })).toBeVisible();
    await expect(page.getByRole('cell', { name: '205' })).toBeVisible();
  });

  test('shows both players in final scores table', async ({ page }) => {
    await page.goto('/yaniv/GVER11');

    await expect(page.getByText(/You win with a score of 195/)).toBeVisible({
      timeout: 10_000,
    });
    await expect(page.getByRole('cell', { name: 'Alice (You)' })).toBeVisible();
    await expect(page.getByRole('cell', { name: 'Bob' })).toBeVisible();
  });
});
