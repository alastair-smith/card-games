# Ticket 08 — Implement `call-yaniv` server state function

## Context

When a player's hand value is 7 or less, they may call "Yaniv" at the start of their turn (instead of playing cards). This ends the round. All other players reveal their hands; scores are calculated; and the game either continues to the next round or ends if a player has reached 200+ points.

## Goal

Create the `call-yaniv` server state function for Yaniv.

## Dependencies

- Ticket 01 (schema includes `hands`)
- Ticket 04 (game is `IN_PROGRESS`, `gameStep === PLAY_CARDS`)

## Reference

- `apps/web/src/utils/cards/index.ts` — `sumYanivHand()`
- `apps/web/src/types/games/yaniv.ts` — player fields, `GameStage`, `GameStep`

## Changes

### `apps/web/src/server/state/game/yaniv/call-yaniv.ts` (new file)

Input: `{ code: GameCode, userId: UserId }`

Steps:

1. **Fetch state** — `getYanivState(code)`.
2. **Validate turn** — confirm `currentPlayerId === userId` and `gameStep === GameStep.PLAY_CARDS`. Throw if not.
3. **Validate hand value** — `sumYanivHand(hands[userId])` must be ≤ 7. Throw if not.
4. **Mark Yaniv caller** — set `players[caller].isYanivCalled = true`.
5. **Calculate hand values** — for each player, compute `sumYanivHand(hands[player.id])`.
6. **Check for Asaf (screw):**
   - If any *other* player has a hand value **≤** the caller's hand value, the caller is screwed.
   - Screwed caller: add **25** to their score. All other players add their own hand value to their score. The lowest-hand player(s) score 0 for this round.
   - Normal Yaniv: caller adds 0 to their score. All other players add their own hand value to their score.
7. **Apply score halving:**
   - For each player, after adding round score:
     - If new score is exactly 50 and `isFiftyScoreHalved === false`: set score to 25, set `isFiftyScoreHalved = true`.
     - If new score is exactly 100 and `isHundredScoreHalved === false`: set score to 50, set `isHundredScoreHalved = true`.
8. **Check for game over:**
   - Any player with score ≥ 200 is eliminated.
   - If only one player remains below 200, they are the winner.
   - If game is over: set `gameStage = GameStage.FINISHED`, set `winners` to the winning player id(s).
   - If game continues: set `gameStep = GameStep.PROCEED` (show round summary screen).
9. **Persist** — `setYanivState(code, state)`.
10. **Publish** — `publishYanivState(code, state)`.

## Notes

- **Asaf rule (screw):** If another player ties or beats the caller's hand value, the *caller* is penalised +30. The other player does not receive the +30 — they still just add their hand value. There can be multiple players who beat/tie the caller; the penalty is only applied to the caller once regardless.
- **Score halving:** Only exact scores of 50 and 100 trigger halving. Each threshold can only be used once per player (tracked by `isFiftyScoreHalved` / `isHundredScoreHalved`). If a player passes 50 without landing on it (e.g. jumps from 45 to 58), no halving occurs.
- **Elimination at 200:** The game ends when only one player is below 200. If multiple players cross 200 in the same round, the one with the lowest score is the winner; ties share the win.
- **`playedCards`** can be cleared at this point since the round is over.
- The `PROCEED` step is the signal to the frontend to show the round summary component before allowing `start-new-round`.

## Acceptance Criteria

- [ ] Only the current player may call Yaniv; wrong turn throws.
- [ ] Hand value > 7 is rejected.
- [ ] Caller scores 0 in a clean Yaniv; all others add their hand value.
- [ ] Asaf/screw correctly adds 30 to the caller when another player has equal or lower hand value.
- [ ] Score halving is applied correctly at exactly 50 and 100 (once per threshold).
- [ ] Players at or above 200 are eliminated; game ends when one remains.
- [ ] `gameStep` becomes `PROCEED` for a continuing game, or `gameStage` becomes `FINISHED` if game is over.
- [ ] State is persisted and published.
