'use client';

import { toast } from '~/components/ui/toast';
import type { ClientGameState } from '~/server/state/game/yaniv/get-game-state';
import { api } from '~/trpc/react';
import { JOKER_RANK } from '~/types/cards';
import type { EmojiReactionId, UserId } from '~/types/entities';
import type { GameCode, ReactionEmoji, SystemEmoji } from '~/types/game';
import {
  GameStage,
  type GameState,
  GameStep,
  GameViewStage,
  YANIV_CALL_THRESHOLD,
} from '~/types/games/yaniv';
import { sumYanivHand } from '~/utils/yaniv';
import { isRunShape, isValidYanivPlay } from '~/utils/yaniv/validation';
import Game from './game';
import GameOver from './game-over';
import { useCardSelection } from './use-card-selection';

type Props = {
  code: GameCode;
  gameState: ClientGameState;
  reactions: Record<
    UserId,
    { emoji: ReactionEmoji | SystemEmoji; id: EmojiReactionId }
  >;
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
  const { selectedCards, toggleCard, clearSelectedCards } = useCardSelection(
    gameState.hand,
  );

  const playCardsMutation = api.yaniv.playCards.useMutation({
    onSuccess: clearSelectedCards,
  });
  const pickupCardMutation = api.yaniv.pickupCard.useMutation();
  const callYanivMutation = api.yaniv.callYaniv.useMutation();
  const startNewRoundMutation = api.yaniv.startNewRound.useMutation();
  const endTurnMutation = api.yaniv.endTurn.useMutation({
    onError: (error) => toast.error(error.message),
  });
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

  const {
    gameStep,
    hand,
    playedCards,
    topDiscardCard,
    currentPlayerId,
    drawnCard,
    deckOnlyPickup,
  } = gameState as InProgressClientGameState;

  const isMyTurn = currentPlayerId === userId;

  const canCallYaniv = sumYanivHand(hand) <= YANIV_CALL_THRESHOLD;

  const lastPlayedCard = playedCards[playedCards.length - 1];
  const canAutoPlay = !!(
    drawnCard &&
    lastPlayedCard &&
    drawnCard.rank === lastPlayedCard.rank
  );

  const handleAutoPlayDrawnCard = () => {
    if (drawnCard) {
      playCardsMutation.mutate({ code, cards: [drawnCard] });
    }
  };

  const deriveStage = (): GameViewStage => {
    if (gameStep === GameStep.REDEAL)
      return isMyTurn
        ? GameViewStage.END_OF_ROUND
        : GameViewStage.WAITING_FOR_NEW_ROUND;
    if (!isMyTurn) return GameViewStage.WAITING_FOR_PLAYER;
    if (gameStep === GameStep.PLAY_CARDS) return GameViewStage.PICKING_CARDS;
    if (gameStep === GameStep.PICKUP_CARD) return GameViewStage.DRAWING_CARDS;
    return GameViewStage.END_TURN;
  };

  const stage = deriveStage();

  const isSelectedCardsRun = isRunShape(selectedCards);

  const handlePlayCards = (direction?: 'ascending' | 'descending') => {
    if (gameStep === GameStep.REDEAL) {
      startNewRoundMutation.mutate({ code });
      return;
    }
    if (selectedCards.length === 0) {
      toast.info('Select at least one card to play');
      return;
    }
    if (
      topDiscardCard &&
      !isValidYanivPlay(selectedCards, topDiscardCard, direction).isValid
    ) {
      if (direction !== undefined) {
        const otherDirection =
          direction === 'ascending' ? 'descending' : 'ascending';
        if (
          isValidYanivPlay(selectedCards, topDiscardCard, otherDirection)
            .isValid
        ) {
          toast.info(
            'Run is only valid in the other direction as it depends on the discard card.',
          );
          return;
        }
      }
      toast.info("You can't play that combination of cards");
      return;
    }
    playCardsMutation.mutate({
      code,
      cards: selectedCards,
      direction,
    });
  };

  const handleEndTurn = () => {
    if (hand.length === 0) {
      toast.info('You must call Yaniv when you have no cards');
      return;
    }
    endTurnMutation.mutate({ code });
  };

  const handleCallYaniv = () => {
    if (!canCallYaniv) {
      toast.info(
        `You need a hand total of ${YANIV_CALL_THRESHOLD} or less to call Yaniv`,
      );
      return;
    }
    callYanivMutation.mutate({ code });
  };

  const handlePickupFromDeck = () => {
    pickupCardMutation.mutate({ code, source: 'deck' });
  };

  const handlePickupFromDiscard = () => {
    if (deckOnlyPickup) {
      toast.info(
        'The discard card is part of your run, you can only pick up from the deck',
      );
      return;
    }
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

  const discardCard = topDiscardCard ?? null;

  return (
    <Game
      stage={stage}
      cards={hand}
      selectedCards={selectedCards}
      onCardToggle={toggleCard}
      onPickupFromDeck={handlePickupFromDeck}
      onPickupFromDiscard={handlePickupFromDiscard}
      onEmojiClick={handleTriggerEmoji}
      onEndTurnClick={handleEndTurn}
      onYanivClick={handleCallYaniv}
      onPlayCards={handlePlayCards}
      isRunSelected={isSelectedCardsRun}
      players={players}
      userId={userId}
      playedCards={playedCards}
      discardCard={discardCard}
      drawnCard={drawnCard}
      canAutoPlay={canAutoPlay}
      onAutoPlayDrawnCard={handleAutoPlayDrawnCard}
    />
  );
}
