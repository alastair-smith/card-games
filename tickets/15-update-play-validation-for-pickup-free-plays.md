# Ticket 15 — Update play validation for pickup-free plays

## Context

In Yaniv, a player can play cards "on" the top card of the discard pile in two ways that affect whether they must draw:

1. **Matching rank** — playing 1, 2, or 3 cards that all share the rank of the top discard card. No pickup required.
2. **Run extension** — playing 2 or more cards whose ranks, together with the top discard card, form a consecutive run of the same suit. Pickup still required.

The existing `isValidYanivPlay` function returns a plain `boolean` and has no concept of the discard pile. It needs to:
- Accept the top discard card as a second parameter
- Return `{ isValid: boolean, isPickupRequired: boolean }` instead of `boolean`

Ticket 06 (`play-cards` server function) currently always advances to the `PICKUP_CARD` step; it must be updated to skip that step when `isPickupRequired` is false.

## Goal

Update `isValidYanivPlay` to support pickup-free plays and update all downstream consumers.

## Reference

- `apps/web/src/utils/yaniv/validation.ts` — function to update
- `apps/web/src/utils/yaniv/validation.test.ts` — tests to update
- `apps/web/src/types/games/yaniv.ts` — `YanivPlayingCard` type
- `tickets/06-play-cards-state-function.md` — step 4 and step 8 need amending (see Notes)

## Changes

### `apps/web/src/utils/yaniv/validation.ts`

Update the signature and return type:

```ts
export function isValidYanivPlay(
  cards: YanivPlayingCard[],
  topDiscard?: YanivPlayingCard,
): { isValid: boolean; isPickupRequired: boolean }
```

Logic (evaluate in order):

1. **Matching-rank play** (no pickup): if `topDiscard` is provided and is a standard card, and every card in `cards` is a standard card sharing the same rank as `topDiscard` → `{ isValid: true, isPickupRequired: false }`.
2. **Run extension** (pickup required): if `topDiscard` is provided and is a standard card, and `cards.length >= 2`, and all cards in `cards` are the same suit as `topDiscard`, and the ranks of `[topDiscard, ...cards]` together form a valid run (no duplicates, gaps fillable by jokers in `cards`) → `{ isValid: true, isPickupRequired: true }`.
3. **Existing standalone validation**: apply the current set/run logic to `cards` alone. Return `{ isValid: <result>, isPickupRequired: true }`.

Return `{ isValid: false, isPickupRequired: false }` for invalid plays (the `isPickupRequired` value is irrelevant when `isValid` is false but should be false for clarity).

### `apps/web/src/utils/yaniv/validation.test.ts`

- Update all existing tests that assert a boolean to assert `{ isValid: true/false, isPickupRequired: true/false }`.
- All existing valid-play assertions: `isPickupRequired: true`.
- All existing invalid-play assertions: `isPickupRequired: false`.
- Add a `describe` block for matching-rank plays (with `topDiscard`):
  - Single card matching top discard rank → `{ isValid: true, isPickupRequired: false }`
  - Two cards matching top discard rank → same
  - Three cards matching top discard rank → same
  - Card with different rank → falls through to standalone validation
  - `topDiscard` is a joker → falls through to standalone validation (joker has no rank to match against)
- Add a `describe` block for run extension plays (with `topDiscard`):
  - Two cards extending a run (e.g. top discard is 5♥, play 6♥ 7♥) → `{ isValid: true, isPickupRequired: true }`
  - Extension in either direction (below or above top discard)
  - Mixed suits → invalid
  - Single card extending → invalid (run extension requires 2+)

## Notes

- **Jokers in matching-rank plays**: a joker in the played cards means the rank is `'JOKER'`, which won't match a standard card's rank, so the matching-rank rule will not fire. This is correct — you cannot use a joker as a rank-match substitute.
- **Ticket 06 amendment**: Step 4 of Ticket 06 should pass `topDiscard` to the validation function. Step 8 should only advance to `PICKUP_CARD` when `isPickupRequired` is true; otherwise advance the turn directly (set `gameStep = GameStep.PLAY_CARDS` and advance `currentPlayerId`).
- **topDiscard is optional** to keep the function usable in contexts where no discard pile exists (e.g. start of round before any card is discarded).

## Acceptance Criteria

- [ ] `isValidYanivPlay` returns `{ isValid, isPickupRequired }` in all cases.
- [ ] Playing 1–3 cards matching the top discard rank returns `isPickupRequired: false`.
- [ ] Playing 2+ cards that extend a run from the top discard returns `isPickupRequired: true`.
- [ ] All existing valid standalone plays still return `isValid: true, isPickupRequired: true`.
- [ ] All existing invalid plays still return `isValid: false`.
- [ ] Tests cover all new cases with and without jokers.
- [ ] `topDiscard` being a joker does not trigger the matching-rank rule.

## Verification

```
pnpm --filter @repo/web test -- run src/utils/yaniv/validation.test.ts
pnpm run typecheck
```
