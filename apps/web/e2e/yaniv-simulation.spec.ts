import { expect, type Page, test } from '@playwright/test';
import { JOKER_RANK } from '../src/types/cards';
import {
  YANIV_CALL_THRESHOLD,
  type YanivPlayingCard,
} from '../src/types/games/yaniv';
import { pickBestMove } from '../src/utils/yaniv/pick-best-move';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Re-constructs a YanivPlayingCard from a `hand-card-{suit}-{rank}` testid. */
function parseCardFromTestId(testId: string): YanivPlayingCard {
  const rest = testId.replace(/^hand-card-/, '');
  const lastDash = rest.lastIndexOf('-');
  const suit = rest.substring(0, lastDash);
  const rankStr = rest.substring(lastDash + 1);
  return {
    suit,
    rank: rankStr === JOKER_RANK ? JOKER_RANK : Number(rankStr),
  } as YanivPlayingCard;
}

async function getHandCards(page: Page): Promise<YanivPlayingCard[]> {
  const hand = page.getByTestId('player-hand');
  const buttons = await hand.locator('[data-testid^="hand-card-"]').all();
  const cards: YanivPlayingCard[] = [];
  for (const btn of buttons) {
    const testId = await btn.getAttribute('data-testid');
    if (testId) cards.push(parseCardFromTestId(testId));
  }
  return cards;
}

async function getDiscardCard(page: Page): Promise<YanivPlayingCard> {
  const el = page.getByTestId('top-discard');
  const suit = await el.getAttribute('data-suit');
  const rankStr = await el.getAttribute('data-rank');
  if (!suit || !rankStr) throw new Error('Discard card not found in DOM');
  return {
    suit,
    rank: rankStr === JOKER_RANK ? JOKER_RANK : Number(rankStr),
  } as YanivPlayingCard;
}

async function getHandTotal(page: Page): Promise<number> {
  const text = await page.getByTestId('hand-total').textContent();
  return Number(text?.trim() ?? '0');
}

async function isGameOver(page: Page): Promise<boolean> {
  return page.getByRole('link', { name: 'Pick Another Game' }).isVisible();
}

// ---------------------------------------------------------------------------
// Lobby setup
// ---------------------------------------------------------------------------

async function joinLobby(page: Page, gameUrl: string): Promise<void> {
  await page.goto(gameUrl);
  // Toggle the current player's own Ready switch (other players' switches are disabled)
  await page
    .getByRole('switch')
    .filter({ hasNot: page.locator('[data-disabled]') })
    .click();
}

// ---------------------------------------------------------------------------
// Per-turn logic
// ---------------------------------------------------------------------------

/** Attempts to perform one full turn for the given page.
 *  Returns true if an action was taken, false if it was not this player's turn. */
async function tryTakeTurn(page: Page): Promise<boolean> {
  // PLAY_CARDS step
  const playCardsBtn = page.getByRole('button', { name: 'Play Cards' });
  if (await playCardsBtn.isVisible()) {
    const hand = await getHandCards(page);
    const discard = await getDiscardCard(page);
    const cardsToPlay = pickBestMove(hand, discard);

    const handGroup = page.getByTestId('player-hand');
    for (const card of cardsToPlay) {
      await handGroup
        .getByTestId(`hand-card-${card.suit}-${card.rank}`)
        .click();
    }
    await playCardsBtn.click();

    // PICKUP_CARD step — deck button only exists when isActive=true
    const deckBtn = page.getByRole('button', { name: 'Draw from deck' });
    try {
      await deckBtn.waitFor({ state: 'visible', timeout: 3_000 });
      await deckBtn.click();
    } catch {
      // isPickupRequired=false — went straight to PROCEED
    }

    // PROCEED step — call Yaniv immediately if hand total ≤ threshold
    await page
      .getByRole('button', { name: 'End Turn' })
      .waitFor({ state: 'visible', timeout: 15_000 });

    const handTotal = await getHandTotal(page);
    if (handTotal <= YANIV_CALL_THRESHOLD) {
      await page.getByRole('button', { name: 'Yaniv!' }).click();
    } else {
      await page.getByRole('button', { name: 'End Turn' }).click();
    }

    return true;
  }

  // REDEAL step — only the round-caller sees this button
  const startRoundBtn = page.getByRole('button', { name: 'Start new round' });
  if (await startRoundBtn.isVisible()) {
    await startRoundBtn.click();
    return true;
  }

  return false;
}

// ---------------------------------------------------------------------------
// Test
// ---------------------------------------------------------------------------

test('simulates a full 3-player game of Yaniv to completion', async ({
  browser,
}) => {
  const ctx1 = await browser.newContext();
  const ctx2 = await browser.newContext();
  const ctx3 = await browser.newContext();

  const p1 = await ctx1.newPage();
  const p2 = await ctx2.newPage();
  const p3 = await ctx3.newPage();

  // Player 1 creates the game
  await p1.goto('/yaniv');
  // Wait for redirect to /yaniv/[code]
  await p1.waitForURL(/\/yaniv\/[A-Z0-9]+/, { timeout: 15_000 });
  const gameUrl = p1.url();

  // Players 2 and 3 join
  await Promise.all([joinLobby(p2, gameUrl), joinLobby(p3, gameUrl)]);

  // Player 1 marks ready too (other players' switches are disabled)
  await p1
    .getByRole('switch')
    .filter({ hasNot: p1.locator('[data-disabled]') })
    .click();

  // Wait for all 3 to show as ready, then player 1 starts the game
  const startGameBtn = p1.getByRole('button', { name: 'Start Game' });
  await startGameBtn.waitFor({ state: 'visible', timeout: 15_000 });
  await startGameBtn.click();

  // Game loop — players take turns until the game is over
  const MAX_ITERATIONS = 2_000;
  const pages = [p1, p2, p3];

  for (let i = 0; i < MAX_ITERATIONS; i++) {
    // Check for game over on any page
    for (const page of pages) {
      if (await isGameOver(page)) {
        // Verify the other players also see the finished screen
        for (const otherPage of pages) {
          await expect(
            otherPage.getByRole('link', { name: 'Pick Another Game' }),
          ).toBeVisible({ timeout: 15_000 });
        }
        return;
      }
    }

    // Try to take a turn on each player's page
    for (const page of pages) {
      if (await tryTakeTurn(page)) break;
    }
  }

  throw new Error(
    `Game did not finish within ${MAX_ITERATIONS} iterations — possible deadlock`,
  );
});
