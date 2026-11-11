import type { StandardPlayingCard } from '~/types/cards';
import type { UserId } from '~/types/entities';
import {
  GameStage,
  type GameState,
  type TableCardSlot,
} from '~/types/games/shithead';
import { getVisibleDiscardCards } from './get-visible-discard-cards';

type ActiveGameState = Extract<
  GameState,
  { gameStage: GameStage.SWAPPING | GameStage.IN_PROGRESS | GameStage.FINISHED }
>;

type InProgressGameState = Extract<
  GameState,
  { gameStage: GameStage.IN_PROGRESS }
>;

type FinishedGameState = Extract<GameState, { gameStage: GameStage.FINISHED }>;

type Player = ActiveGameState['players'][number];

export type ClientPlayer = Pick<
  Player,
  'id' | 'name' | 'color' | 'isSwapConfirmed'
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
  isDeckEmpty: boolean;
} & (
  | { gameStage: GameStage.SWAPPING }
  | Pick<
      InProgressGameState,
      'gameStage' | 'currentPlayerId' | 'finishingOrder'
    >
  | Pick<FinishedGameState, 'gameStage' | 'finishingOrder'>
);

// Each field is listed rather than spread, so a new hidden field isn't sent by default
const toClientPlayer = (player: Player, userId: UserId): ClientPlayer => ({
  id: player.id,
  name: player.name,
  color: player.color,
  isSwapConfirmed: player.isSwapConfirmed,
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
    isDeckEmpty: deckSize === 0,
  };

  switch (rawState.gameStage) {
    case GameStage.SWAPPING:
      return { ...clientView, gameStage: rawState.gameStage };
    case GameStage.IN_PROGRESS:
      return {
        ...clientView,
        gameStage: rawState.gameStage,
        currentPlayerId: rawState.currentPlayerId,
        finishingOrder: rawState.finishingOrder,
      };
    case GameStage.FINISHED:
      return {
        ...clientView,
        gameStage: rawState.gameStage,
        finishingOrder: rawState.finishingOrder,
      };
  }
};
