# Ticket 05 — Implement card play validation utility

## Context

In Yaniv, a player must discard one or more cards in a valid combination before drawing. The server needs to validate that the cards a player attempts to play form a legal combination. This logic is pure and has no side effects, so it belongs in a shared utility.

## Goal

Create a utility function `isValidYanivPlay(cards: YanivPlayingCard[]): boolean` that returns `true` for all legal Yaniv discards.

## Legal combinations

| Combination | Rule |
|---|---|
| Single card | Always valid |
| Pair / set | 2 or more cards of the **same rank** (jokers are wild and count as any rank) |
| Run | 3 or more **consecutive ranks** of the **same suit** (jokers can fill any gap or extend either end) |

**Joker rules:**
- Jokers are wild and may substitute for any card in a set or run.
- A hand of all jokers is valid.
- A single joker is valid.

## Changes

### `apps/web/src/utils/cards/yaniv-validation.ts` (new file)

Export a single function:

```ts
export function isValidYanivPlay(cards: YanivPlayingCard[]): boolean
```

Implementation outline:

1. **0 cards** → `false`.
2. **1 card** → `true`.
3. **Separate jokers from non-jokers.**
4. **Check set (matching ranks):**
   - All non-joker cards share the same rank → `true`.
5. **Check run (consecutive, same suit):**
   - All non-joker cards share the same suit.
   - Sort non-joker cards by rank.
   - Check that the gaps between consecutive ranks can be filled by the available jokers.
   - The total span of the run (highest rank − lowest rank + 1) must equal `cards.length`.
6. If neither check passes → `false`.

### `apps/web/src/utils/cards/yaniv-validation.test.ts` (new file, optional but encouraged)

Unit tests covering:
- Single card
- Pair, three-of-a-kind, four-of-a-kind
- Valid run of 3, 4, 5
- Run with a joker filling a gap
- Run with joker extending an end
- Non-matching ranks (invalid)
- Mixed suits (invalid run)
- Empty array

## Notes

- Ranks in `apps/web/src/types/cards.ts` are numeric enums — comparison with `<` / `>` works directly.
- Jokers have `rank: JOKER_RANK` (value `0`). Do not include them in rank-ordering logic for runs.
- The `Suit` for jokers differs from standard suits — use `card.rank === JOKER_RANK` to identify jokers.

## Acceptance Criteria

- [ ] `isValidYanivPlay` is exported from the new utility file.
- [ ] All legal single cards, sets, and runs return `true`.
- [ ] Jokers are handled correctly in both sets and runs.
- [ ] Invalid combinations (empty, mixed ranks/suits outside rules) return `false`.
- [ ] Function is pure with no side effects or async operations.
