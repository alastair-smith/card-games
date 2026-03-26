import { expect, type Page, test } from '@playwright/test';
import { createGame } from '../helpers';

const MAX_ITERATIONS = 300;

/**
 * Attempt to pick up from the deck.
 * At DRAWING_CARDS stage the server accepts this; at any other stage the
 * mutation is silently rejected by the server, so clicking is harmless.
 */
async function tryPickUp(page: Page): Promise<void> {
  try {
    await page.locator('[data-testid="deck"]').click({ timeout: 500 });
  } catch {
    // not in DRAWING_CARDS, nothing to do
  }
}

/**
 * Take one action unit for the given player page.
 *
 * The function handles a single step of the state machine and returns.
 * The simulation loop calls it repeatedly until the game is over.
 *
 * Stage transitions handled:
 *   END_OF_ROUND  → click "Start new round"
 *   PICKING_CARDS → select first card + click "Play Cards"
 *   END_TURN      → try "Yaniv!" (greedy; server validates hand ≤ 7 + PROCEED step);
 *                   if Yaniv not available or fails, select first card + click "End Turn"
 *   DRAWING_CARDS → click deck (no action buttons visible)
 *   WAITING       → no-op (other player's turn)
 */
async function tryPlayTurn(page: Page): Promise<void> {
  // End of round — any player can start the next round
  const newRound = page.getByRole('button', { name: 'Start new round' });
  if (await newRound.isVisible()) {
    await newRound.click();
    return;
  }

  // PICKING_CARDS: must select at least one card and click "Play Cards"
  const playCardsBtn = page.getByRole('button', { name: 'Play Cards' });
  if (await playCardsBtn.isVisible()) {
    const firstCard = page
      .locator('[data-testid="hand"] [data-testid^="card-"]')
      .first();
    if ((await firstCard.count()) > 0) await firstCard.click();
    await playCardsBtn.click();
    return;
  }

  // END_TURN: shown at both PLAY_CARDS+canCallYaniv and PROCEED step.
  // Try "Yaniv!" first (greedy strategy).
  //   - At PROCEED + hand ≤ 7: server accepts → round ends.
  //   - At PROCEED + hand > 7: server rejects silently → fall through to End Turn.
  //   - At PLAY_CARDS+canCallYaniv: server rejects silently (requires PROCEED)
  //     → fall through to End Turn (which plays a card).
  const yanivBtn = page.getByRole('button', { name: 'Yaniv!' });
  if (await yanivBtn.isVisible()) {
    await yanivBtn.click();
    // Brief wait — if Yaniv succeeded the button will have disappeared
    await page.waitForTimeout(300);
    if (await yanivBtn.isVisible()) {
      // Yaniv was rejected — play a card via "End Turn" instead
      const endTurnBtn = page.getByRole('button', { name: 'End Turn' });
      if (await endTurnBtn.isVisible()) {
        const firstCard = page
          .locator('[data-testid="hand"] [data-testid^="card-"]')
          .first();
        if ((await firstCard.count()) > 0) await firstCard.click();
        await endTurnBtn.click();
      }
    }
    return;
  }

  // DRAWING_CARDS: no action buttons — pick up from deck
  await tryPickUp(page);
}

test('plays a complete Yaniv game from lobby to game over', async ({
  browser,
}) => {
  test.setTimeout(300_000); // game simulation can take several minutes
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
  const players = [p1, p2, p3];

  try {
    let gameCode: string;

    await test.step('create game and join lobby', async () => {
      gameCode = await createGame(p1);
      await Promise.all([
        p1.goto(`/yaniv/${gameCode}`),
        p2.goto(`/yaniv/${gameCode}`),
        p3.goto(`/yaniv/${gameCode}`),
      ]);
      await Promise.all(
        players.map((page) =>
          expect(
            page.getByRole('heading', { name: 'Yaniv Lobby' }),
          ).toBeVisible({ timeout: 10_000 }),
        ),
      );
    });

    await test.step('all players ready and host starts', async () => {
      await Promise.all(
        players.map((page) =>
          page.locator('table tbody [role="switch"]:not([disabled])').click(),
        ),
      );
      await p1.getByRole('button', { name: 'Start Game' }).click();
      await Promise.all(
        players.map((page) =>
          expect(page.getByText('Hand total:')).toBeVisible({
            timeout: 10_000,
          }),
        ),
      );
    });

    await test.step('play game to completion', async () => {
      for (let iter = 0; iter < MAX_ITERATIONS; iter++) {
        if (await p1.getByText(/with a score of/).isVisible()) break;

        for (const page of players) {
          await tryPlayTurn(page);
        }

        await p1.waitForTimeout(100);
      }
    });

    await test.step('game over screen shown to all players', async () => {
      await Promise.all(
        players.map((page) =>
          expect(page.getByText(/with a score of/)).toBeVisible({
            timeout: 30_000,
          }),
        ),
      );
    });
  } finally {
    await Promise.all([p1Ctx.close(), p2Ctx.close(), p3Ctx.close()]);
  }
});
