# Ticket 10 — Implement `get-game-state` server state function

## Context

The SSE subscription (Ticket 11) needs a function to fetch the current Yaniv game state and prepare it for the client. Critically, `hands` must be filtered so each client only receives their own cards — other players' hands must be hidden. Additionally, each player entry should be decorated with an `isUser` flag so the frontend can identify the current user.

## Goal

Create the `get-game-state` server state function for Yaniv.

## Dependencies

- Ticket 01 (schema includes `hands`)

## Reference

- `apps/web/src/server/state/game/high-card/get-game-state.ts`
- `apps/web/src/server/data/yaniv.ts` — `getYanivState`

## Changes

### `apps/web/src/server/state/game/yaniv/get-game-state.ts` (new file)

Input: `{ code: GameCode, userId: UserId }`

Output type (define inline or in a separate types file):

```ts
type ClientGameState = Omit<GameState, 'hands'> & {
  hand: YanivPlayingCard[];         // only this player's hand
  players: (Player & { isUser: boolean })[];
};
```

Steps:

1. **Fetch raw state** — `getYanivState(code)`.
2. **Extract requesting player's hand** — `hand = state.hands[userId] ?? []`.
3. **Decorate players** — map `state.players` to add `isUser: player.id === userId`.
4. **Return client state** — return the full state but replace `hands` with the single `hand` array, and use the decorated `players`.

## Notes

- The raw `hands` object (containing all players' cards) must **never** be sent to the client. Strip it and replace with the single-player `hand` before returning.
- This function is called both for the initial state on subscription connect and on every subsequent state update published via the event emitter. The SSE handler will call `get-game-state` after receiving each `yaniv:${code}` event to produce the correctly filtered payload for each connected client.
- If `userId` is not in `hands` (e.g. during `LOBBY` stage), return `hand: []`.

## Acceptance Criteria

- [ ] Returns `hand` containing only the requesting player's cards.
- [ ] Does not include the full `hands` map in the returned object.
- [ ] Each player in `players` has an `isUser: boolean` field.
- [ ] Works correctly when called with a userId not yet in `hands` (returns empty hand).
- [ ] TypeScript types are correct and no `any` is used.
