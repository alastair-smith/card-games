# Ticket 09 — Implement `start-new-round` server state function

## Context

After a round ends (game step is `REDEAL` and the round summary is shown), the current player (one who successfully called yaniv) can trigger the start of the next round. This resets hands, rebuilds and reshuffles the deck, deals 7 new cards to each remaining player, seeds the discard pile, and keeps the next starting player as the one who dealt.

## Goal

Create the `start-new-round` server state function for Yaniv.

## Reference

- `apps/web/src/server/data/deck.ts` — `yanivDeck.createDeck`, `yanivDeck.drawCard`
- `apps/web/src/server/data/discard.ts` — `yanivDiscard.createDiscard`
- `apps/web/src/utils/cards/index.ts` — `shuffle()`
- `apps/web/src/types/cards.ts` — `deckWithJokers`

## Changes

### `apps/web/src/server/state/game/yaniv/start-new-round.ts` (new file)

Input: `{ code: GameCode, userId: UserId }`

Steps:

1. **Fetch state** — `getYanivState(code)`.
2. **Validate step** — confirm `gameStep === GameStep.REDEAL`. Throw if not.
3. **keep current player as next starting player:**
4. **Reset per-round player state:**
   - For each player: set `isYanivCalled = false`, `cardCount = 0`.
5. **Reset played cards** — set `playedCards = []`.
6. **Reset hands** — set `hands = {}`.
7. **Rebuild deck** — `yanivDeck.createDeck(code, shuffle([...deckWithJokers]))`.
8. **Deal 5 cards to each player** — for each player, draw 5 cards and populate `hands[player.id]`; set `cardCount = 5`.
9. **Seed discard pile** — draw one more card; `yanivDiscard.createDiscard(code, [card])`.
10. **Update state:**
    - `currentPlayerId` = the Yaniv caller from last round.
    - `gameStep = GameStep.PLAY_CARDS`.
11. **Persist** — `setYanivState(code, state)`.
12. **Publish** — `publishYanivState(code, state)`.

## Notes

- **Deck recreation:** `createDeck` should overwrite any existing deck key in Redis, so no cleanup is needed beforehand.

## Acceptance Criteria

- [ ] Only valid when `gameStep === REDEAL`; other steps throw.
- [ ] All players' `isYanivCalled` flags are reset.
- [ ] `playedCards` is cleared; `hands` is reset.
- [ ] A fresh shuffled 54-card deck is created in Redis.
- [ ] Each active player receives exactly  7 cards; `cardCount` is updated.
- [ ] The discard pile is seeded with one card.
- [ ] `currentPlayerId` is kept as the previous round's successful Yaniv caller.
- [ ] `gameStep` is reset to `PLAY_CARDS`.
- [ ] State is persisted and published.
