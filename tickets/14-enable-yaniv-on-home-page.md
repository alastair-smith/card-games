# Ticket 14 — Enable Yaniv on the home page

## Context

The home page (`apps/web/src/app/page.tsx`) lists available games. Yaniv is currently disabled (likely hidden or shown as "coming soon"). Once the backend and frontend are wired up, Yaniv should be enabled as a playable game.

## Goal

Enable the Yaniv game entry on the home page so players can create or join a Yaniv game.

## Dependencies

- Ticket 12 (Yaniv pages exist at `/yaniv` and `/yaniv/[code]`)
- Ticket 11 (Yaniv router registered)

## Reference

- `apps/web/src/app/page.tsx` — find the Yaniv entry and remove any disabled/coming-soon flag

## Changes

### `apps/web/src/app/page.tsx`

- Find the Yaniv game card/entry.
- Remove any `disabled`, `comingSoon`, or equivalent prop/condition that hides or disables it.
- Ensure the "Create" link points to `/yaniv` and the "Join" flow accepts a Yaniv game code.

## Notes

- The join flow is likely already generic (enter a code → redirect to `/{gameType}/[code]`). Verify that `GameType.YANIV` is handled in whatever routing logic maps a code to a URL.
- If the home page fetches a list of game types and filters by enabled status, update that filter/config.
- No new UI is needed — just remove the gate.

## Acceptance Criteria

- [ ] Yaniv appears as a fully clickable game option on the home page.
- [ ] Clicking "Create" navigates to `/yaniv` and creates a new game.
- [ ] Joining with a Yaniv game code routes to `/yaniv/[code]`.
- [ ] No "coming soon" or disabled state is shown for Yaniv.
