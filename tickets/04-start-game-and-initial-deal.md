# Ticket 04 — Implement `start-game` and initial deal server state function

## Context

Once all players are ready, the host starts the game. This transitions the game from `LOBBY` to `IN_PROGRESS`, creates and shuffles the deck, deals 5 cards to each player, places the top card of the remaining deck face-up as the first discard, and sets the first player's turn.

## Goal

Create the `start-game` server state function for Yaniv.

## Reference

- `apps/web/src/server/state/game/high-card/start-game.ts`
- `apps/web/src/server/data/deck.ts` — `yanivDeck` store (`createDeck`, `drawCard`)
- `apps/web/src/server/data/discard.ts` — `yanivDiscard` store (`createDiscard`, `pushDiscard`)
- `apps/web/src/types/games/yaniv.ts` — `MIN_PLAYERS`, `GameStage`, `GameStep`

## Changes

### `apps/web/src/server/state/game/yaniv/start-game.ts` (new file)

Steps:

1. **Validate** — fetch lobby, confirm calling user is the host, and that there are at least `MIN_PLAYERS` (2) players.
2. **Build initial player list** — map lobby players to Yaniv player objects:
   ```ts
   {
     id, name,
     cardCount: 0,          // updated after deal
     score: 0,
     isFiftyScoreHalved: false,
     isHundredScoreHalved: false,
     isYanivCalled: false,
   }
   ```
3. **Create deck** — call `yanivDeck.createDeck(code)` using `deckWithJokers` (54 cards — 52 standard + 2 jokers), shuffled.
4. **Deal cards** — for each player, draw 5 cards from the deck and store in `hands[player.id]`. Update `player.cardCount = 5`.
5. **Create discard pile** — draw one more card from the deck and call `yanivDiscard.createDiscard(code, [card])` to seed the discard pile.
6. **Persist game state** — call `setYanivState` with:
   - `gameStage: GameStage.IN_PROGRESS`
   - `gameStep: GameStep.PLAY_CARDS`
   - `currentPlayerId`: first player's id (index 0 from lobby order)
   - `players`, `hands` as built above
   - `playedCards: []`
   - `winners: []`
7. **Publish** — call `publishYanivState(code, state)`.

## Notes

- The deck store uses Redis lists. `yanivDeck.createDeck` should receive a pre-shuffled array. Use the `shuffle()` utility from `apps/web/src/utils/cards/index.ts`.
- The `deckWithJokers` constant from `apps/web/src/types/cards.ts` provides the full 54-card array to shuffle.
- `currentPlayerId` is the first lobby player. Future rounds will rotate this (handled in `start-new-round`, Ticket 09).

## Acceptance Criteria

- [ ] Only the host can call this; non-hosts receive an error.
- [ ] Requires at least 2 players; fewer throws an error.
- [ ] A 54-card shuffled deck is created in Redis.
- [ ] Each player receives exactly 5 cards in `hands`; `cardCount` is set to 5.
- [ ] The discard pile is seeded with one face-up card.
- [ ] Game state is persisted with `gameStage: IN_PROGRESS` and `gameStep: PLAY_CARDS`.
- [ ] Yaniv state update is published.
