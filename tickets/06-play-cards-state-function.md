# Ticket 06 — Implement `play-cards` server state function

## Context

On their turn, during the `PLAY_CARDS` game step, a player selects one or more cards from their hand to discard. The server must validate the action, remove the cards from the player's hand, record them as the most recently played set, and advance the game to the `PICKUP_CARD` step.

## Goal

Create the `play-cards` server state function for Yaniv.

## Reference

- `apps/web/src/server/data/discard.ts` — `yanivDiscard.pushDiscard`
- `apps/web/src/server/state/game/yaniv/` (sibling files)

## Changes

### `apps/web/src/server/state/game/yaniv/play-cards.ts` (new file)

Input: `{ code: GameCode, userId: UserId, cards: YanivPlayingCard[] }`

Steps:

1. **Fetch state** — `getYanivState(code)`.
2. **Validate turn** — confirm `currentPlayerId === userId` and `gameStep === GameStep.PLAY_CARDS`. Throw if not.
3. **Validate cards are in hand** — every card in `cards` must appear in `state.hands[userId]`. Throw if any card is missing.
4. **Validate combination** — call `isValidYanivPlay(cards, topDiscard)` where `topDiscard` is the top card of the discard pile (from `yanivDiscard`). Throw if `isValid` is false.
5. **Update hand** — remove the played cards from `hands[userId]`. Update the player's `cardCount`.
6. **Record played cards** — set `state.playedCards = cards` (overwrite; this is the most recent play visible in the UI).
7. **Push to discard** — call `yanivDiscard.pushDiscard(code, cards)` to persist the cards on the discard pile in Redis.
8. **Advance step** — if `isPickupRequired` is true, set `gameStep = GameStep.PICKUP_CARD`. Otherwise set `gameStep = GameStep.PLAY_CARDS` and advance `currentPlayerId` to the next player (skip the pickup step entirely).
9. **Persist** — `setYanivState(code, state)`.
10. **Publish** — `publishYanivState(code, state)`.

## Notes

- Card identity: `YanivPlayingCard` is a union of `jokerSchema` and `standardPlayingCardSchema`. Two cards are the same if their `rank` and `suit` match. When removing cards from a hand, remove by value not by reference — filter carefully if duplicate ranks exist (e.g. two 5s of different suits are different cards).
- `playedCards` in the persisted state serves as the "most recently played" display for the UI. The full discard history lives in the Redis discard store.
- Do not advance `currentPlayerId` yet — that happens after the player picks up (handled in `pickup-card`, Ticket 07).

## Acceptance Criteria

- [ ] Only the current player can play cards; others receive an error.
- [ ] Cards not in the player's hand are rejected.
- [ ] Invalid combinations are rejected (uses `isValidYanivPlay`).
- [ ] Played cards are removed from `hands[userId]`; `cardCount` is decremented.
- [ ] `playedCards` is updated on the game state.
- [ ] Cards are pushed onto the Redis discard pile.
- [ ] `gameStep` advances to `PICKUP_CARD`.
- [ ] State is persisted and published.
