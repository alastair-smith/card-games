# Ticket: Implement `proceed` server state function

## Context

After picking up a card, `gameStep` is `PROCEED`. At this point the current player may optionally call Yaniv (handled separately in ticket 08). When the turn ends without calling Yaniv, the `proceed` function advances play to the next player's `PLAY_CARDS` step.

This step is also responsible for clearing `playedCards` (set by `play-cards`) and updating the discard pile display — both of which are deferred from the pickup step.

## Behaviour

- Validate `gameStage === IN_PROGRESS`, `gameStep === PROCEED`, `currentPlayerId === userId`
- Clear `playedCards: []`
- Advance `currentPlayerId` to the next player (rotate through `players` array)
- Set `gameStep: PLAY_CARDS`
- Persist and publish the new state

## Notes

- `playedCards` intentionally not cleared during `pickup-card` — it is cleared here so the UI can still show what was played until the turn fully ends.
- The discard pile top card is already correct after `pickup-card`; no discard changes needed here.
