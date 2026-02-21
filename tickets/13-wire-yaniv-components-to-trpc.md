# Ticket 13 — Wire Yaniv components to tRPC mutations (game controller)

## Context

The Yaniv UI components (`Game`, `Hand`, `Controls`, `PlayArea`, `RoundSummary`, `GameOver`) are fully built but receive only static props. This ticket creates a thin controller layer that maps tRPC mutations and local UI state to the correct component props.

## Goal

Create a `YanivGameController` component that sits between the client page (Ticket 12) and the presentational components, wiring up all user interactions to the correct mutations.

## Dependencies

- Ticket 12 (client page provides subscription state and mutation objects)

## Reference

- `apps/web/src/app/high-card/_components/game-controller.tsx`
- `apps/web/src/app/yaniv/_components/game/index.tsx`
- `apps/web/src/app/yaniv/_components/controls/index.tsx`
- `apps/web/src/app/yaniv/_components/play-area/index.tsx`
- `apps/web/src/app/yaniv/_components/hand/index.tsx`

## New File

### `apps/web/src/app/yaniv/_components/game-controller.tsx`

**Props** (passed down from `client.tsx`):
```ts
type Props = {
  code: GameCode;
  gameState: ClientGameState;
  userId: UserId;
  emojiReactions: EmojiReaction[];
  mutations: {
    playCards: UseMutationResult<...>;
    pickupCard: UseMutationResult<...>;
    callYaniv: UseMutationResult<...>;
    startNewRound: UseMutationResult<...>;
    triggerEmoji: UseMutationResult<...>;
  };
};
```

**Card selection state** (if not owned by client.tsx):
```ts
const [selectedCards, setSelectedCards] = useState<YanivPlayingCard[]>([]);
```

**Derived state:**
- `isMyTurn = gameState.currentPlayerId === userId`
- `controlsContext`:
  - `'waiting-for-player'` — not my turn during `PLAY_CARDS` or `PICKUP_CARD`
  - `'picking-cards'` — my turn, `gameStep === PLAY_CARDS`, no card selected yet or cards selected but not played
  - `'end-turn'` — my turn, `gameStep === PICKUP_CARD` (after playing, before drawing — actually picking up a card can be automatic on click; "End Turn" may confirm the pickup)
  - `'end-of-round'` — `gameStep === PROCEED`
  - See existing `Controls` component for exact context values it accepts

**Handlers:**

- `handleCardToggle(card)` — add/remove card from `selectedCards`
- `handlePlayCards()` — call `mutations.playCards.mutate({ code, cards: selectedCards })`, then clear `selectedCards`
- `handlePickupFromDeck()` — call `mutations.pickupCard.mutate({ code, source: 'deck' })`
- `handlePickupFromDiscard()` — call `mutations.pickupCard.mutate({ code, source: 'discard' })`
- `handleCallYaniv()` — call `mutations.callYaniv.mutate({ code })`
- `handleStartNewRound()` — call `mutations.startNewRound.mutate({ code })`
- `handleTriggerEmoji(emoji)` — call `mutations.triggerEmoji.mutate({ code, emoji })`

**Render:**

```tsx
<YanivGame
  players={gameState.players}
  userId={userId}
  hand={gameState.hand}
  playedCards={gameState.playedCards}
  gameStep={gameState.gameStep}
  gameStage={gameState.gameStage}
  winners={gameState.winners}
  selectedCards={selectedCards}
  emojiReactions={emojiReactions}
  isMyTurn={isMyTurn}
  onCardToggle={handleCardToggle}
  onPlayCards={handlePlayCards}
  onPickupFromDeck={handlePickupFromDeck}
  onPickupFromDiscard={handlePickupFromDiscard}
  onCallYaniv={handleCallYaniv}
  onStartNewRound={handleStartNewRound}
  onTriggerEmoji={handleTriggerEmoji}
/>
```

## Notes

- **Component prop gaps:** The existing `Game` component props may not exactly match what's listed above. Audit `apps/web/src/app/yaniv/_components/game/index.tsx` and update props as needed — but prefer adjusting the controller to match the component rather than changing the component.
- **"End Turn" vs auto-advance:** Review the `Controls` component's `end-turn` context. If the design is that picking up a card (clicking deck/discard) automatically ends the turn (server advances to next player), then the "End Turn" button may not be needed. If it is needed, it may map to an explicit "end-turn" mutation — but currently no such mutation is defined. Resolve this during implementation based on the existing component design.
- **`canCallYaniv`:** Pass a derived boolean to the Controls component: `sumYanivHand(gameState.hand) <= 7 && isMyTurn && gameState.gameStep === GameStep.PLAY_CARDS`.
- **Discard top card:** The `PlayArea` component likely needs the top card of the discard pile displayed. This comes from `gameState.playedCards` (most recently played) or a dedicated `discardTopCard` field. Determine which during implementation and pass accordingly.

## Acceptance Criteria

- [ ] All game actions are wired to the correct tRPC mutations.
- [ ] Card selection state correctly tracks which cards are toggled.
- [ ] `handlePlayCards` sends the selected cards and clears selection on success.
- [ ] Pickup from deck and discard are separate handlers hitting the correct source.
- [ ] "Yaniv!" is only actionable when hand value ≤ 7 and it is the player's turn.
- [ ] Emoji reactions are triggered correctly.
- [ ] The `GameOver` component renders when `gameStage === FINISHED`.
- [ ] TypeScript compiles without errors.
