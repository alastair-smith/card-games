# Ticket 03 — Implement `create-game` and `join-game` server state functions

## Context

Before a Yaniv game starts, players need to be able to create a game (generating a lobby and an initial game state) and join one. These functions follow the same pattern as their equivalents in `apps/web/src/server/state/game/high-card/`.

## Goal

Create the `create-game` and `join-game` server-side state functions for Yaniv.

## Reference

- `apps/web/src/server/state/game/high-card/create-game.ts`
- `apps/web/src/server/state/game/high-card/join-game.ts`
- `apps/web/src/server/data/lobby.ts`
- `apps/web/src/server/data/yaniv.ts`

## Changes

### `apps/web/src/server/state/game/yaniv/create-game.ts` (new file)

- Generate a random 6-character `GameCode` (same helper as high-card).
- Create a lobby entry (`setLobby`) with `type: GameType.YANIV`, the creator as host, and the creator as the first player.
- Create an initial Yaniv game state (`setYanivState`) with:
  - `gameStage: GameStage.LOBBY`
  - `gameStep: GameStep.INITIAL_DEAL`
  - `players: []` (populated at start-game)
  - `playedCards: []`
  - `hands: {}`
  - `currentPlayerId`: empty string / placeholder (not meaningful until game starts)
  - `winners: []`
- Return the `GameCode`.

### `apps/web/src/server/state/game/yaniv/join-game.ts` (new file)

- Accept `{ code, userId }`.
- Fetch the lobby. If the lobby is full (≥ 5 players) throw an appropriate error.
- If the user is already in the lobby, return early (idempotent).
- Add the player with a generated random name (`generatePlayerName()`), `isReady: false`.
- Persist the updated lobby (`setLobby`).
- Publish lobby state (`publishLobbyState`).

## Notes

- Max players for Yaniv is **5** (defined by `MAX_PLAYERS` in `apps/web/src/types/games/yaniv.ts`), unlike high-card's 10.
- Both functions should use `generatePlayerName` from the existing utility.
- Publish lobby state after `join-game` so the host sees the new player arrive in real time.

## Acceptance Criteria

- [ ] `create-game` creates a lobby and a Yaniv game state in Redis and returns a `GameCode`.
- [ ] `join-game` adds a player to the lobby, is idempotent if the player is already present, and rejects when the lobby is full.
- [ ] Both functions are typed correctly with no TypeScript errors.
