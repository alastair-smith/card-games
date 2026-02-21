# Ticket 11 — Create Yaniv tRPC router and register in root

## Context

The tRPC router is the API surface between the frontend and backend. It needs procedures for all Yaniv game actions and an SSE subscription for real-time state updates. The pattern follows `apps/web/src/server/api/routers/high-card/` closely.

## Goal

Create the Yaniv tRPC router with a state subscription and all game action mutations, then register it in the root router.

## Dependencies

- Tickets 03–10 (all server state functions)

## Reference

- `apps/web/src/server/api/routers/high-card/` — complete example to follow
- `apps/web/src/server/api/root.ts` — where to register
- `apps/web/src/server/api/trpc.ts` — `protectedProcedure`, context shape

## New Files

### `apps/web/src/server/api/routers/yaniv/state.ts`

SSE subscription. Mirrors `high-card/state.ts`:

- **Input:** `{ code: GameCode }`
- **On connect:**
  - Call `join-game` (idempotent) so late joiners are added.
  - Call `get-game-state` for the initial payload.
  - Yield initial state as `{ type: 'GAME_STATE_UPDATE', data: clientState }` (or `LOBBY_UPDATE` if `gameStage === LOBBY`).
- **Listeners:**
  - `lobby:${code}` → yield `{ type: 'LOBBY_UPDATE', data: lobbyState }`
  - `yaniv:${code}` → call `get-game-state` for the `userId`, yield `{ type: 'GAME_STATE_UPDATE', data: clientState }`
  - `emoji:${code}` → yield `{ type: 'EMOJI_REACTION', data: emojiPayload }`
- **Message queue + 100ms tick** — same pattern as high-card.
- **Cleanup** — remove listeners in `finally`.
- **Signal** — respect `ctx.signal` for abort / disconnect.
- **Additional message types** to handle (same as high-card): `KICKED`, `LEFT_GAME`, `LOBBY_FULL`, `FINISHED`.

### `apps/web/src/server/api/routers/yaniv/start-game.ts`

- **Input:** `{ code: GameCode }`
- Calls `startYanivGame({ code, userId: ctx.userId })`.
- Publishes updated state (done inside the state function).

### `apps/web/src/server/api/routers/yaniv/play-cards.ts`

- **Input:** `{ code: GameCode, cards: YanivPlayingCard[] }`
- Calls `playCards({ code, userId: ctx.userId, cards })`.

### `apps/web/src/server/api/routers/yaniv/pickup-card.ts`

- **Input:** `{ code: GameCode, source: z.enum(['deck', 'discard']) }`
- Calls `pickupCard({ code, userId: ctx.userId, source })`.

### `apps/web/src/server/api/routers/yaniv/call-yaniv.ts`

- **Input:** `{ code: GameCode }`
- Calls `callYaniv({ code, userId: ctx.userId })`.

### `apps/web/src/server/api/routers/yaniv/start-new-round.ts`

- **Input:** `{ code: GameCode }`
- Calls `startNewRound({ code, userId: ctx.userId })`.

### `apps/web/src/server/api/routers/yaniv/trigger-emoji.ts`

- **Input:** `{ code: GameCode, emoji: ReactionEmoji }`
- Calls the shared emoji trigger (same as high-card).

### `apps/web/src/server/api/routers/yaniv/index.ts`

Assembles the router:

```ts
export const yanivRouter = createTRPCRouter({
  state: yanivStateSubscription,
  startGame: startGameMutation,
  playCards: playCardsMutation,
  pickupCard: pickupCardMutation,
  callYaniv: callYanivMutation,
  startNewRound: startNewRoundMutation,
  triggerEmoji: triggerEmojiMutation,
});
```

### `apps/web/src/server/api/root.ts`

Add the Yaniv router:

```ts
import { yanivRouter } from './routers/yaniv';

export const appRouter = createTRPCRouter({
  lobby: lobbyRouter,
  highCard: highCardRouter,
  yaniv: yanivRouter,   // NEW
});
```

## Acceptance Criteria

- [ ] SSE subscription emits correct typed messages on lobby, game state, and emoji events.
- [ ] `get-game-state` is called per-subscriber when a yaniv state update is received (hands are filtered per user).
- [ ] All mutations delegate to the correct state functions and are protected procedures.
- [ ] Root router includes `yaniv`.
- [ ] `RouterOutputs['yaniv']` and `RouterInputs['yaniv']` types are correctly inferred on the client.
- [ ] TypeScript compiles without errors.
