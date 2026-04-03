import { expect, type Page, test } from '@playwright/test';
import { JOKER_RANK, RANK_FULL_NAME, Rank } from '../src/types/cards';
import {
  YANIV_CALL_THRESHOLD,
  YANIV_RANK_SCORE,
  type YanivPlayingCard,
} from '../src/types/games/yaniv';
import { pickBestMove } from '../src/utils/yaniv/pick-best-move';
import { pickWorstMove } from '../src/utils/yaniv/pick-worst-move';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Reverse lookup from RANK_FULL_NAME value (e.g. "A", "K", "7") back to the rank. */
const DISPLAY_TO_RANK = Object.fromEntries(
  Object.entries(RANK_FULL_NAME).map(([rank, display]) => [display, rank]),
);

/** Re-constructs a YanivPlayingCard from data-suit / data-rank attributes on an element. */
async function parseCardFromElement(
  element: import('@playwright/test').Locator,
): Promise<YanivPlayingCard | null> {
  const suit = await element.getAttribute('data-suit');
  const rankDisplay = await element.getAttribute('data-rank');
  if (!suit || !rankDisplay) return null;
  const rankStr = DISPLAY_TO_RANK[rankDisplay] ?? rankDisplay;
  return {
    suit,
    rank: rankStr === JOKER_RANK ? JOKER_RANK : Number(rankStr),
  } as YanivPlayingCard;
}

async function getHandCards(page: Page): Promise<YanivPlayingCard[]> {
  const hand = page.getByRole('list', { name: 'Your hand' });
  const buttons = await hand.getByRole('button').all();
  const cards: YanivPlayingCard[] = [];
  for (const btn of buttons) {
    const card = await parseCardFromElement(btn);
    if (card) cards.push(card);
  }
  return cards;
}

async function getDiscardCard(page: Page): Promise<YanivPlayingCard> {
  const pile = page.getByLabel('Discard pile');
  const cardElement = pile.locator('[data-suit]').first();
  const card = await parseCardFromElement(cardElement);
  if (!card) throw new Error('Discard card not found in DOM');
  return card;
}

async function getHandTotal(page: Page): Promise<number> {
  const text = await page.getByLabel('Hand total').textContent();
  return Number(text?.trim() ?? '0');
}

/** Collects a diagnostic snapshot of the game state visible to a single player. */
async function getPlayerSnapshot(page: Page, label: string): Promise<string> {
  const lines: string[] = [`  ${label}:`];

  // Hand cards
  const hand = await getHandCards(page);
  const handStr = hand.map((card) => `${card.suit}-${card.rank}`).join(', ');
  lines.push(`    Hand: [${handStr}]`);

  // Hand total
  const handTotal = await getHandTotal(page);
  lines.push(`    Hand total: ${handTotal}`);

  // Discard card
  try {
    const discard = await getDiscardCard(page);
    lines.push(`    Top discard: ${discard.suit}-${discard.rank}`);
  } catch {
    lines.push('    Top discard: (none)');
  }

  // Whose turn (from "is thinking" or controls)
  const thinkingEl = page.getByText('is thinking');
  if (await thinkingEl.isVisible().catch(() => false)) {
    const text = await thinkingEl.textContent();
    lines.push(`    Waiting for: ${text?.trim()}`);
  } else {
    lines.push("    Waiting for: (this player's turn)");
  }

  // Visible action buttons
  const buttonNames = [
    'Play Cards',
    'End Turn',
    'Yaniv!',
    'Draw from deck',
    'Start new round',
    'Pick Another Game',
  ];
  const visibleButtons: string[] = [];
  for (const name of buttonNames) {
    const visible = await page
      .getByRole('button', { name })
      .or(page.getByRole('link', { name }))
      .isVisible()
      .catch(() => false);
    if (visible) visibleButtons.push(name);
  }
  lines.push(`    Visible buttons: [${visibleButtons.join(', ')}]`);

  // All player scores and card counts from scorecards
  // Scorecards render: card count, "Score: N", and player name
  const scoreTexts = await page.locator('text=/Score: \\d+/').allTextContents();
  if (scoreTexts.length > 0) {
    lines.push(
      `    Scoreboard: ${scoreTexts.map((text) => text.trim()).join(' | ')}`,
    );
  }

  return lines.join('\n');
}

/** Builds a full diagnostic snapshot across all players. */
async function getGameSnapshot(
  players: Array<{ page: Page; label: string }>,
  iteration: number,
): Promise<string> {
  const snapshots = await Promise.all(
    players.map(({ page, label }) => getPlayerSnapshot(page, label)),
  );
  return [`Game state at iteration ${iteration}:`, ...snapshots].join('\n');
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

type MovePicker = (
  hand: YanivPlayingCard[],
  topDiscardCard: YanivPlayingCard,
) => YanivPlayingCard[];

/** Returns true if the discard card is worth picking up instead of drawing from the deck. */
type PickupStrategy = (discardCard: YanivPlayingCard) => boolean;

/** Optimal player picks up jokers, aces, and twos from the discard pile. */
const shouldPickupOptimal: PickupStrategy = (card) =>
  card.rank === JOKER_RANK || card.rank === Rank.ACE || card.rank === Rank.TWO;

/** Bad player picks up high-value cards (8+) from the discard pile. */
const shouldPickupWorst: PickupStrategy = (card) =>
  card.rank !== JOKER_RANK && YANIV_RANK_SCORE[card.rank] >= 8;

/** Returns true if this page is waiting for another player (i.e. it's not our turn). */
async function isWaitingForOtherPlayer(page: Page): Promise<boolean> {
  const thinkingVisible = await page
    .getByText('is thinking')
    .isVisible()
    .catch(() => false);
  if (thinkingVisible) return true;
  const dealingVisible = await page
    .getByText('to deal')
    .isVisible()
    .catch(() => false);
  return dealingVisible;
}

/** Attempts to perform one full turn for the given page.
 *  Returns true if an action was taken, false if it was not this player's turn. */
async function tryTakeTurn(
  page: Page,
  movePicker: MovePicker,
  shouldPickupDiscard: PickupStrategy,
): Promise<boolean> {
  // PLAY_CARDS step
  const playCardsBtn = page.getByRole('button', { name: 'Play Cards' });
  if (await playCardsBtn.isVisible()) {
    const hand = await getHandCards(page);
    const discard = await getDiscardCard(page);
    const cardsToPlay = movePicker(hand, discard);

    const handGroup = page.getByRole('list', { name: 'Your hand' });
    for (const card of cardsToPlay) {
      const rankDisplay = RANK_FULL_NAME[card.rank];
      await handGroup
        .locator(`[data-suit="${card.suit}"][data-rank="${rankDisplay}"]`)
        .click({ timeout: 5_000 });
    }
    try {
      await playCardsBtn.click({ timeout: 5_000 });
    } catch {
      return false;
    }

    // Wait for Play Cards to disappear, confirming the server accepted the play
    await playCardsBtn.waitFor({ state: 'hidden', timeout: 15_000 });

    // Either pickup is required (deck button appears) or we skip to PROCEED (End Turn)
    const deckBtn = page.getByRole('button', { name: 'Draw from deck' });
    const endTurnBtn = page.getByRole('button', { name: 'End Turn' });

    const nextStep = await Promise.race([
      deckBtn
        .waitFor({ state: 'visible', timeout: 15_000 })
        .then(() => 'pickup' as const),
      endTurnBtn
        .waitFor({ state: 'visible', timeout: 15_000 })
        .then(() => 'proceed' as const),
    ]);

    if (nextStep === 'pickup') {
      const discard = await getDiscardCard(page);
      if (shouldPickupDiscard(discard)) {
        await page
          .getByLabel('Discard pile')
          .getByRole('button')
          .click({ timeout: 5_000 });
      } else {
        await deckBtn.click({ timeout: 5_000 });
      }
      await endTurnBtn.waitFor({ state: 'visible', timeout: 15_000 });
    }

    const handTotal = await getHandTotal(page);
    if (handTotal <= YANIV_CALL_THRESHOLD) {
      await page
        .getByRole('button', { name: 'Yaniv!' })
        .click({ timeout: 5_000 });
    } else {
      await page
        .getByRole('button', { name: 'End Turn' })
        .click({ timeout: 5_000 });
    }

    return true;
  }

  // REDEAL step — only the round-caller sees this button
  const startRoundBtn = page.getByRole('button', { name: 'Start new round' });
  if (await startRoundBtn.isVisible()) {
    try {
      // Use a short timeout so React re-render flickers don't cause an infinite retry
      await startRoundBtn.click({ timeout: 5_000 });
    } catch {
      // Element detached mid-click (polling re-render); will retry next iteration
      return false;
    }
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
  // Player 1 plays optimally; players 2 and 3 play the worst possible move
  const MAX_ITERATIONS = 2_000;
  const players: Array<{
    page: Page;
    movePicker: MovePicker;
    pickupStrategy: PickupStrategy;
  }> = [
    { page: p1, movePicker: pickBestMove, pickupStrategy: shouldPickupOptimal },
    { page: p2, movePicker: pickWorstMove, pickupStrategy: shouldPickupWorst },
    { page: p3, movePicker: pickWorstMove, pickupStrategy: shouldPickupWorst },
  ];

  // Listen for game over on any page — resolves as soon as one page shows it
  const gameOverLink = { name: 'Pick Another Game' } as const;
  const gameOverPromise = Promise.race(
    players.map(({ page }) =>
      page.getByRole('link', gameOverLink).waitFor({ state: 'visible' }),
    ),
  );

  for (let i = 0; i < MAX_ITERATIONS; i++) {
    // Race the next turn against the game-over listener
    const result = await Promise.race([
      gameOverPromise.then(() => 'gameOver' as const),
      (async () => {
        for (const { page, movePicker, pickupStrategy } of players) {
          if (await isWaitingForOtherPlayer(page)) continue;
          if (await tryTakeTurn(page, movePicker, pickupStrategy))
            return 'turnTaken' as const;
        }
        return 'noAction' as const;
      })(),
    ]);

    if (result === 'gameOver') {
      for (const { page } of players) {
        await expect(page.getByRole('link', gameOverLink)).toBeVisible({
          timeout: 15_000,
        });
      }
      return;
    }
  }

  const snapshot = await getGameSnapshot(
    [
      { page: p1, label: 'Player 1 (optimal)' },
      { page: p2, label: 'Player 2 (worst)' },
      { page: p3, label: 'Player 3 (worst)' },
    ],
    MAX_ITERATIONS,
  );
  throw new Error(
    `Game did not finish within ${MAX_ITERATIONS} iterations — possible deadlock\n\n${snapshot}`,
  );
});
