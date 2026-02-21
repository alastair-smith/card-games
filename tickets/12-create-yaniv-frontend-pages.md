# Ticket 12 — Create Yaniv frontend pages

## Context

The Yaniv components exist but there are no Next.js pages or a client entry point to render them. This ticket creates the page structure and the client component that owns the tRPC subscription and manages top-level game state — mirroring the high-card page structure.

## Goal

Create the three page-level files for Yaniv: the game creation page, the game code page, and the client component.

## Dependencies

- Ticket 11 (Yaniv tRPC router must exist for type inference)

## Reference

- `apps/web/src/app/high-card/page.tsx`
- `apps/web/src/app/high-card/[code]/page.tsx`
- `apps/web/src/app/high-card/[code]/client.tsx`
- `apps/web/src/app/high-card/_components/lobby.tsx` (reuse this component)
- `apps/web/src/app/yaniv/_components/game/index.tsx` (Yaniv game component)

## New Files

### `apps/web/src/app/yaniv/page.tsx` (server component)

- Calls `api.lobby.create({ type: GameType.YANIV })` (or the equivalent Yaniv-specific create — confirm how high-card does it; likely calls a create procedure that then redirects).
- Redirects to `/yaniv/[code]`.

Follow `apps/web/src/app/high-card/page.tsx` exactly, substituting `GameType.YANIV`.

### `apps/web/src/app/yaniv/[code]/page.tsx` (server component)

- Validates the `code` param against `gameCodeSchema`.
- If invalid, redirects to `/yaniv` (or shows 404).
- Renders `<YanivClient code={code} />`.

Follow `apps/web/src/app/high-card/[code]/page.tsx`.

### `apps/web/src/app/yaniv/[code]/client.tsx` (client component)

This is the main integration point. Follow `apps/web/src/app/high-card/[code]/client.tsx` closely.

**State managed:**
- `status`: `'loading' | 'lobby' | 'in-progress' | 'finished'`
- `lobbyState`: lobby data from subscription
- `gameState`: Yaniv client game state from subscription (filtered, with `hand`)
- `selectedCards`: `YanivPlayingCard[]` — cards the user has selected to play (local UI state)
- `emojiReactions`: array of active emoji reactions

**Subscription:** `api.yaniv.state.useSubscription({ code })` handling message types:
- `LOBBY_UPDATE` → update `lobbyState`, set `status = 'lobby'`
- `GAME_STATE_UPDATE` → update `gameState`; set `status` based on `gameStage`
- `EMOJI_REACTION` → append to `emojiReactions` (with timeout cleanup)
- `KICKED` / `LEFT_GAME` → redirect home
- `FINISHED` → set `status = 'finished'`

**Mutations (define here, pass as props):**
- `api.yaniv.startGame.useMutation()`
- `api.yaniv.playCards.useMutation()`
- `api.yaniv.pickupCard.useMutation()`
- `api.yaniv.callYaniv.useMutation()`
- `api.yaniv.startNewRound.useMutation()`
- `api.yaniv.triggerEmoji.useMutation()`
- Lobby mutations via `api.lobby.*` (same as high-card)

**Render logic:**
```
status === 'loading'    → <LoadingScreen />
status === 'lobby'      → <Lobby ... /> (reuse high-card Lobby component)
status === 'in-progress'
  or 'finished'         → <YanivGameController ... /> (Ticket 13)
```

## Notes

- The `selectedCards` state and card-toggle logic lives here (or in the controller — decide when implementing Ticket 13, but keeping it here keeps the controller thin).
- The Lobby component from high-card should be reusable without modification — it only depends on lobby data and lobby mutation callbacks.
- `status === 'finished'` can be handled by the `GameOver` component inside the Yaniv game component rather than as a separate top-level render.

## Acceptance Criteria

- [ ] Navigating to `/yaniv` creates a game and redirects to `/yaniv/[code]`.
- [ ] Invalid codes redirect appropriately.
- [ ] The subscription is established and routes message types to the correct state updates.
- [ ] The Lobby component renders during the lobby stage with working player management.
- [ ] The game component renders once `IN_PROGRESS`.
- [ ] TypeScript compiles without errors.
