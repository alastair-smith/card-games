# Ticket 08 — Implement `call-yaniv` server state function

## Context

When a player's hand value is 7 or less, they may call "Yaniv" at the end of their turn. This signals the ends the round. All other players get one more go (and can call yaniv as usual if they meet the conditions) and then we move to the 'REDEAL' game step where the scores of the round are displayed and the player that successfully called yaniv starts the new round.

## Goal

Create the `call-yaniv` server state function for Yaniv.


## Reference

- `apps/web/src/utils/cards/index.ts` — `sumYanivHand()`
- `apps/web/src/types/games/yaniv.ts` — player fields, `GameStage`, `GameStep`

## Changes

### `apps/web/src/server/state/game/yaniv/call-yaniv.ts` (new file)

Input: `{ code: GameCode, userId: UserId }`

Steps:

1. **Fetch state** — `getYanivState(code)`.
2. **Validate turn** — confirm `currentPlayerId === userId` and `gameStep === GameStep.PROCEED`. Throw if not.
3. **Validate hand value** — `sumYanivHand(hands[userId])` must be ≤ 7. Throw if not.
4. **Mark Yaniv caller** — set `players[caller].isYanivCalled = true`.
5. **End round** - when ending the turn of the final player in the round, calculate the scores for everyone and if the game is not over advance to the REDEAL game step, if over then go to the game finished game state
6. **Persist** — `setYanivState(code, state)`.
7. **Publish** — `publishYanivState(code, state)`.

## Notes

- **Asaf rule (screw):** If another player beats the caller's hand value (lower score), the *caller* is penalised to score 25 points. There can be multiple players who beat/tie the caller; the penalty is only applied to the caller once regardless.
- **Player starts turn** If 2 players tied for yaniv then the first player that called it gets to go first in the next round
- **Score halving:** Only exact scores of 50 and 100 trigger halving. Each threshold can only be used once per player (tracked by `isFiftyScoreHalved` / `isHundredScoreHalved`). If a player passes 50 without landing on it (e.g. jumps from 45 to 58), no halving occurs.
- **Elimination at 200:** The game ends when any player exceeds 200 points.

## Acceptance Criteria

- [ ] Only the current player may call Yaniv; wrong turn throws.
- [ ] Hand value > 7 is rejected.
- [ ] Caller scores 0 in a clean Yaniv; all others add their hand value.
- [ ] Asaf/screw correctly adds 25 to the caller when another player has lower hand value.
- [ ] Score halving is applied correctly at exactly 50 and 100 (once per threshold).
- [ ] Game ends when a player exceeds 200 points
- [ ] `gameStep` becomes `REDEAL` for a continuing game, or `gameStage` becomes `FINISHED` if game is over.
- [ ] State is persisted and published.
