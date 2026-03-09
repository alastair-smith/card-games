# Ticket: Proceed-step state changes

## Context

After playing cards, the current player must draw one card — from the deck or discard pile. This advances `gameStep` to `PROCEED`, where the player may optionally call Yaniv and the turn ultimately passes.

During `PROCEED`, the player may also play back the card they just drew (if it forms a valid play against the top of the discard pile). This is a free play — no further pickup is required.

## Changes

### 1. State schema — add `drawnCard` field

Add optional `drawnCard?: YanivPlayingCard` to the `IN_PROGRESS` state object in `apps/web/src/types/games/yaniv.ts`.

Set by `pickup-card`, cleared by `end-turn` (and by `play-cards` during `PROCEED`).

### 2. `pickup-card.ts` update — persist `drawnCard`

After drawing, persist the drawn card into `state.drawnCard`.

When `source === 'discard'`, also clear `playedCards: []` (no longer needed for display since the discard pickup itself replaces the display).

### 3. `play-cards.ts` update — instant-play during PROCEED

Allow `play-cards` to be called when `gameStep === PROCEED` (in addition to `PLAY_CARDS`).

When called during `PROCEED`:
- Validate `state.drawnCard` exists
- Validate the card being played matches `state.drawnCard` (not a duplicate from earlier hand)
- Validate the play is valid against the top of the discard pile (existing validation)
- Push card to discard pile
- Remove from hand, decrement `cardCount`
- Set `playedCards` to the played card(s)
- Keep `gameStep: PROCEED` (no pickup required — it's a free play)
- Clear `drawnCard: undefined`

### 4. New `end-turn.ts` function

Signature: `endTurn(code: GameCode, userId: UserId)`

- Validate `gameStage === IN_PROGRESS`, `gameStep === PROCEED`, `currentPlayerId === userId`
- Clear `playedCards: []`
- Clear `drawnCard: undefined`
- Advance `currentPlayerId` to next player (rotate through `players` array)
- Set `gameStep: PLAY_CARDS`
- Persist and publish
