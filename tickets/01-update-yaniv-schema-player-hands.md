# Ticket 01 — Update Yaniv game state schema to include player hands

## Context

The Yaniv `gameStateSchema` in `apps/web/src/types/games/yaniv.ts` stores a `cardCount` per player but does not store the actual cards in each player's hand. Card hands need to be stored server-side so the game logic can validate plays, score rounds, and deal cards. They must not be leaked to other players on the client.

## Goal

Add a `hands` field to the Yaniv game state schema that maps each player's `UserId` to their current hand of cards.

## Changes

### `apps/web/src/types/games/yaniv.ts`

Add a `hands` field to `gameStateSchema`:

```ts
export const gameStateSchema = z.object({
  players: z.array(playerSchema),
  playedCards: z.array(yanivPlayingCardSchema),
  gameStage: gameStageSchema,
  currentPlayerId: userIdSchema,
  gameStep: gameStepSchema,
  winners: z.array(userIdSchema),
  hands: z.record(userIdSchema, z.array(yanivPlayingCardSchema)), // NEW
});
```

`hands` is a plain object keyed by `UserId`. It is populated during the initial deal and updated on every play/pickup action.

## Notes

- `hands` is stored in Redis but **must be filtered** before being sent to the client. Each player should only receive their own hand. This filtering happens in `get-game-state` (Ticket 10).
- `cardCount` on the player object remains — it is derived from `hands[player.id].length` whenever state is updated, giving other players visibility of hand size without revealing cards.
- `UserId` is a branded string, so `z.record(userIdSchema, ...)` uses string keys at runtime. This is fine for Redis serialisation via SuperJSON.

## Acceptance Criteria

- [ ] `gameStateSchema` includes a `hands` field with the correct Zod type.
- [ ] The `GameState` TypeScript type (inferred from the schema) includes `hands`.
- [ ] Existing usages of `gameStateSchema` (i.e. `apps/web/src/server/data/yaniv.ts`) continue to work — no other files need changes at this stage.
