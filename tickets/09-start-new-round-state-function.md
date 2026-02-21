# Ticket 09 — Implement `start-new-round` server state function

## Context

After a round ends (game step is `PROCEED` and the round summary is shown), any player can trigger the start of the next round. This resets hands, rebuilds and reshuffles the deck, deals 5 new cards to each remaining player, seeds the discard pile, and sets the next starting player.

## Goal

Create the `start-new-round` server state function for Yaniv.

## Dependencies

- Ticket 04 (initial deal pattern)
- Ticket 08 (`call-yaniv` leaves the game in `GameStep.PROCEED`)

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
2. **Validate step** — confirm `gameStep === GameStep.PROCEED`. Throw if not. (Any player can trigger this, not just the current player — acting as a "ready" action.)
3. **Determine next starting player:**
   - The player who called Yaniv last round (find `players.find(p => p.isYanivCalled)`) starts the *next* round. This is a standard Yaniv rule.
   - If no player has `isYanivCalled` (shouldn't happen), fall back to the next player after `currentPlayerId`.
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

- **Who can trigger this?** Any player in the game (not just the host or current player). The round summary screen shows a "Start new round" button to all players. The first click wins; subsequent calls should be safe to ignore (idempotent — if `gameStep !== PROCEED` by the time the second call arrives, it will be rejected by the guard in step 2).
- **Eliminated players:** If score tracking results in players being eliminated (≥ 200), those players should be excluded from the new deal. Filter `state.players` to only active (below 200) players when dealing. However, if you keep all players in `state.players` for score history, only deal to those below the elimination threshold.
- **Deck recreation:** `createDeck` should overwrite any existing deck key in Redis, so no cleanup is needed beforehand.

## Acceptance Criteria

- [ ] Only valid when `gameStep === PROCEED`; other steps throw.
- [ ] All players' `isYanivCalled` flags are reset.
- [ ] `playedCards` is cleared; `hands` is reset.
- [ ] A fresh shuffled 54-card deck is created in Redis.
- [ ] Each active player receives exactly 5 cards; `cardCount` is updated.
- [ ] The discard pile is seeded with one card.
- [ ] `currentPlayerId` is set to the previous round's Yaniv caller.
- [ ] `gameStep` is reset to `PLAY_CARDS`.
- [ ] State is persisted and published.
