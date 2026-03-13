'use client';

import { useState } from 'react';
import type { ClientGameState } from '~/server/state/game/yaniv/get-game-state';
import { api } from '~/trpc/react';
import type { UserId } from '~/types/entities';
import type { GameCode, ReactionEmoji } from '~/types/game';
import {
  GameStage,
  type GameState,
  GameStep,
  type YanivPlayingCard,
} from '~/types/games/yaniv';
import { sumYanivHand } from '~/utils/cards';
import Game from './game';
import GameOver from './game-over';

type Props = {
  code: GameCode;
  gameState: ClientGameState;
  reactions: Record<UserId, { emoji: ReactionEmoji; id: number }>;
};

// ClientGameState uses Omit<GameState, 'hands'> which flattens the discriminated
// union. These helpers restore per-variant shapes after a runtime gameStage check.
type InProgressFields = Omit<
  Extract<GameState, { gameStage: GameStage.IN_PROGRESS }>,
  'hands'
>;
type FinishedFields = Omit<
  Extract<GameState, { gameStage: GameStage.FINISHED }>,
  'hands'
>;

type InProgressClientGameState = ClientGameState & InProgressFields;
type FinishedClientGameState = ClientGameState & FinishedFields;

export default function YanivGameController({
  code,
  gameState,
  reactions,
}: Props) {
  const [selectedCards, setSelectedCards] = useState<YanivPlayingCard[]>([]);

  const playCardsMutation = api.yaniv.playCards.useMutation({
    onSuccess: () => setSelectedCards([]),
  });
  const pickupCardMutation = api.yaniv.pickupCard.useMutation();
  const callYanivMutation = api.yaniv.callYaniv.useMutation();
  const startNewRoundMutation = api.yaniv.startNewRound.useMutation();
  const endTurnMutation = api.yaniv.endTurn.useMutation();
  const triggerEmojiMutation = api.yaniv.triggerEmoji.useMutation();

  const userId = gameState.players.find((player) => player.isUser)?.id;

  if (!userId) return null;

  if (gameState.gameStage === GameStage.FINISHED) {
    const { players, winners } = gameState as FinishedClientGameState;
    const gamePlayers = players.map((player) => ({
      ...player,
      isWinner: winners.includes(player.id),
    }));
    return <GameOver players={gamePlayers} userId={userId} />;
  }

  const { gameStep, hand, playedCards, currentPlayerId } =
    gameState as InProgressClientGameState;

  const isMyTurn = currentPlayerId === userId;

  const canCallYaniv =
    isMyTurn && gameStep === GameStep.PLAY_CARDS && sumYanivHand(hand) <= 7;

  const deriveStage = ():
    | 'waiting-for-player'
    | 'picking-cards'
    | 'drawing-cards'
    | 'end-turn'
    | 'end-of-round' => {
    if (gameStep === GameStep.REDEAL) return 'end-of-round';
    if (!isMyTurn || gameStep === GameStep.INITIAL_DEAL)
      return 'waiting-for-player';
    if (gameStep === GameStep.PLAY_CARDS && canCallYaniv) return 'end-turn';
    if (gameStep === GameStep.PLAY_CARDS) return 'picking-cards';
    if (gameStep === GameStep.PICKUP_CARD) return 'drawing-cards';
    return 'end-turn'; // PROCEED
  };

  const stage = deriveStage();

  const handleCardToggle = (card: YanivPlayingCard) => {
    setSelectedCards((prev) => {
      const alreadySelected = prev.some(
        (selected) =>
          selected.rank === card.rank && selected.suit === card.suit,
      );
      if (alreadySelected) {
        return prev.filter(
          (selected) =>
            selected.rank !== card.rank || selected.suit !== card.suit,
        );
      }
      return [...prev, card];
    });
  };

  const handlePlayCards = () => {
    if (gameStep === GameStep.REDEAL) {
      startNewRoundMutation.mutate({ code });
    } else {
      playCardsMutation.mutate({ code, cards: selectedCards });
    }
  };

  const handleEndTurn = () => {
    if (gameStep === GameStep.PROCEED) {
      endTurnMutation.mutate({ code });
    } else {
      // PLAY_CARDS with canCallYaniv — play selected cards
      playCardsMutation.mutate({ code, cards: selectedCards });
    }
  };

  const handleCallYaniv = () => {
    callYanivMutation.mutate({ code });
  };

  const handlePickupFromDeck = () => {
    pickupCardMutation.mutate({ code, source: 'deck' });
  };

  const handlePickupFromDiscard = () => {
    pickupCardMutation.mutate({ code, source: 'discard' });
  };

  const handleTriggerEmoji = (emoji: ReactionEmoji) => {
    triggerEmojiMutation.mutate({ code, emoji });
  };

  const players = gameState.players.map((player) => ({
    ...player,
    isPlayersTurn: player.id === currentPlayerId,
    emojiReaction: reactions[player.id],
  }));

  const discardCard = playedCards.at(-1) ?? null;

  if (stage === 'end-of-round') {
    const roundSummary = players.map(({ id, name, score }) => ({
      id,
      name,
      score,
    }));

    return (
      <Game
        stage='end-of-round'
        roundSummary={roundSummary}
        cards={hand}
        selectedCards={selectedCards}
        onCardToggle={handleCardToggle}
        onPickupFromDeck={handlePickupFromDeck}
        onPickupFromDiscard={handlePickupFromDiscard}
        onEmojiClick={handleTriggerEmoji}
        onEndTurnClick={handleEndTurn}
        onYanivClick={handleCallYaniv}
        onPlayCards={handlePlayCards}
        players={players}
        userId={userId}
        playedCards={playedCards}
        discardCard={discardCard}
      />
    );
  }

  return (
    <Game
      stage={stage}
      roundSummary={null}
      cards={hand}
      selectedCards={selectedCards}
      onCardToggle={handleCardToggle}
      onPickupFromDeck={handlePickupFromDeck}
      onPickupFromDiscard={handlePickupFromDiscard}
      onEmojiClick={handleTriggerEmoji}
      onEndTurnClick={handleEndTurn}
      onYanivClick={handleCallYaniv}
      onPlayCards={handlePlayCards}
      players={players}
      userId={userId}
      playedCards={playedCards}
      discardCard={discardCard}
    />
  );
}
