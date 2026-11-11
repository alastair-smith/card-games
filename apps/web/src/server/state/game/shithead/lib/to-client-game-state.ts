import type { StandardPlayingCard } from '~/types/cards';
import type { UserId } from '~/types/entities';
import {
  type ActiveGameState,
  type FinishedState,
  GameStage,
  type InProgressState,
  type Player,
  type TableCardSlot,
} from '~/types/games/shithead';
import { getVisibleDiscardCards } from './get-visible-discard-cards';

export type ClientPlayer = Pick<
  Player,
  'id' | 'name' | 'color' | 'isSwapConfirmed' | 'finishingPosition'
> & {
  cardCount: number;
  tableCards: TableCardSlot[];
  isUser: boolean;
};

export type ClientGameState = {
  hand: StandardPlayingCard[];
  players: ClientPlayer[];
  // Top-first
  visibleDiscardCards: StandardPlayingCard[];
  deckSize: number;
} & (
  | { gameStage: GameStage.SWAPPING }
  | Pick<InProgressState, 'gameStage' | 'currentPlayerId'>
  | Pick<FinishedState, 'gameStage'>
);

// Each field is listed rather than spread, so a new hidden field isn't sent by default
const toClientPlayer = (player: Player, userId: UserId): ClientPlayer => ({
  id: player.id,
  name: player.name,
  color: player.color,
  isSwapConfirmed: player.isSwapConfirmed,
  finishingPosition: player.finishingPosition,
  cardCount: player.hand.length,
  tableCards: player.tableCards.map(({ faceUpCard, faceDownCard }) => ({
    faceUpCard,
    hasFaceDownCard: faceDownCard !== null,
  })),
  isUser: player.id === userId,
});

/** Takes the discard pile top-first. */
export const toClientGameState = (
  rawState: ActiveGameState,
  userId: UserId,
  {
    discardCards,
    deckSize,
  }: { discardCards: StandardPlayingCard[]; deckSize: number },
): ClientGameState => {
  const requestingPlayer = rawState.players.find(
    (player) => player.id === userId,
  );

  if (!requestingPlayer) {
    throw new Error('Player not in game');
  }

  const clientView = {
    hand: requestingPlayer.hand,
    players: rawState.players.map((player) => toClientPlayer(player, userId)),
    visibleDiscardCards: getVisibleDiscardCards(discardCards),
    deckSize,
  };

  switch (rawState.gameStage) {
    case GameStage.SWAPPING:
      return { ...clientView, gameStage: rawState.gameStage };
    case GameStage.IN_PROGRESS:
      return {
        ...clientView,
        gameStage: rawState.gameStage,
        currentPlayerId: rawState.currentPlayerId,
      };
    case GameStage.FINISHED:
      return { ...clientView, gameStage: rawState.gameStage };
  }
};
