# Ticket 02 — Add Yaniv event publishers

## Context

The event system uses a shared `MonitoredEventEmitter` in `apps/web/src/server/events/emitter.ts`. Game-specific publishers live in separate files (e.g. `apps/web/src/server/events/high-card.ts`). Yaniv needs its own publisher so server state functions can notify SSE subscribers of state changes.

## Goal

Create a Yaniv event publisher file that emits game state updates on a `yaniv:${code}` channel.

## Reference

Follow the pattern in `apps/web/src/server/events/high-card.ts`.

## Changes

### `apps/web/src/server/events/yaniv.ts` (new file)

```ts
import type { GameCode } from '~/types/game';
import type { GameState } from '~/types/games/yaniv'; // or whatever the inferred type is named
import { emitter } from './emitter';

export const publishYanivState = (code: GameCode, state: GameState) => {
  emitter.emit(`yaniv:${code}`, state);
};
```

The channel name `yaniv:${code}` will be listened to in the SSE subscription (Ticket 11).

## Acceptance Criteria

- [ ] `apps/web/src/server/events/yaniv.ts` exists and exports `publishYanivState`.
- [ ] The function emits on the correct channel using the shared `emitter` instance.
- [ ] TypeScript compiles without errors.
