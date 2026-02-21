# Ticket 07 — Implement `pickup-card` server state function

## Context

After playing cards, the current player draws one card — either from the top of the deck or from the discard pile. Once drawn, the turn passes to the next player and the game step resets to `PLAY_CARDS`. If the deck is empty, the discard pile (minus the top card) must be reshuffled to form a new deck before drawing.

## Goal

Create the `pickup-card` server state function for Yaniv.

## Dependencies

- Ticket 01 (schema includes `hands`)
- Ticket 06 (`play-cards` sets `gameStep = PICKUP_CARD`)

## Reference

- `apps/web/src/server/data/deck.ts` — `yanivDeck` (`drawCard`, `getDeckSize`, `createDeck`)
- `apps/web/src/server/data/discard.ts` — `yanivDiscard` (`popDiscard`, `peekDiscard`, `getDiscardSize`, `createDiscard`)
- `apps/web/src/utils/cards/index.ts` — `shuffle()`

## Changes

### `apps/web/src/server/state/game/yaniv/pickup-card.ts` (new file)

Input: `{ code: GameCode, userId: UserId, source: 'deck' | 'discard' }`

Steps:

1. **Fetch state** — `getYanivState(code)`.
2. **Validate turn** — confirm `currentPlayerId === userId` and `gameStep === GameStep.PICKUP_CARD`. Throw if not.
3. **Draw card:**
   - If `source === 'deck'`:
     - Check deck size. If empty, reshuffle:
       - `peekDiscard` to preserve the top card.
       - Pop all remaining discard cards (or fetch full pile and truncate top).
       - Shuffle the remaining cards.
       - `createDeck(code, shuffledCards)` to seed a new deck.
       - Set `gameStep = GameStep.REDEAL` momentarily if you want to broadcast a reshuffle animation, then continue. *(Optional — may be handled client-side from the state.)*
     - `drawCard(code)` → `drawnCard`.
   - If `source === 'discard'`:
     - `popDiscard(code)` → `drawnCard`. This gives the player the **top** card of the discard pile (the most recently played card visible to them).
     - Clear `state.playedCards` since those cards are no longer available to pick up.
4. **Add card to hand** — push `drawnCard` into `hands[userId]`. Increment `cardCount`.
5. **Advance to next player:**
   - Find the index of `currentPlayerId` in `state.players`.
   - Next player index = `(currentIndex + 1) % players.length`.
   - Set `currentPlayerId` to the next player's id.
6. **Reset step** — set `gameStep = GameStep.PLAY_CARDS`.
7. **Persist** — `setYanivState(code, state)`.
8. **Publish** — `publishYanivState(code, state)`.

## Notes

- **Picking from discard vs deck:** The player picks up the top card of the discard pile (the one that was face-up before the current player played). This is `popDiscard` — it removes the top item that was placed by the previous player's play-cards action.
- **Reshuffle:** Only the cards *below* the top of the discard pile are reshuffled. The top card stays visible. If the `discard` store doesn't natively support "pop all except top", implement it as: peek top → get all → keep top → shuffle rest → create new deck → push top back.
- **REDEAL step:** The `GameStep.REDEAL` enum value exists for this scenario. Whether to pause with a broadcast before continuing is a design choice — the simplest path is to do it inline and publish once with `PLAY_CARDS` as the resulting step.

## Acceptance Criteria

- [ ] Only the current player may pick up; others receive an error.
- [ ] `gameStep` must be `PICKUP_CARD`; wrong step throws.
- [ ] Drawing from deck gives the top deck card; deck reshuffle occurs if empty.
- [ ] Drawing from discard gives the top discard card; `playedCards` is cleared.
- [ ] Drawn card is added to `hands[userId]`; `cardCount` is incremented.
- [ ] Turn advances to the next player (wrapping around).
- [ ] `gameStep` resets to `PLAY_CARDS`.
- [ ] State is persisted and published.
