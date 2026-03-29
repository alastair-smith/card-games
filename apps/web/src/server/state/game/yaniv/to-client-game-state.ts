import type { UserId } from '~/types/entities';
import {
  GameStage,
  type GameState,
  type GameStep,
  type YanivPlayingCard,
} from '~/types/games/yaniv';

type Player = Extract<
  GameState,
  { gameStage: GameStage.IN_PROGRESS }
>['players'][number];

type ClientPlayer = Omit<Player, 'hand'> & { isUser: boolean };

type ClientInProgressGameState = {
  gameStage: GameStage.IN_PROGRESS;
  gameStep: GameStep;
  playedCards: YanivPlayingCard[];
  topDiscardCard?: YanivPlayingCard | null;
  currentPlayerId: UserId;
  drawnCard?: YanivPlayingCard;
  hand: YanivPlayingCard[];
  players: ClientPlayer[];
};

type ClientFinishedGameState = {
  gameStage: GameStage.FINISHED;
  winners: UserId[];
  hand: YanivPlayingCard[];
  players: ClientPlayer[];
};

type ClientLobbyGameState = {
  gameStage: GameStage.LOBBY;
  hand: YanivPlayingCard[];
  players: ClientPlayer[];
};

export type ClientGameState =
  | ClientInProgressGameState
  | ClientFinishedGameState
  | ClientLobbyGameState;

type ActiveGameState = Extract<
  GameState,
  { gameStage: GameStage.IN_PROGRESS | GameStage.FINISHED }
>;

export const toClientGameState = (
  rawState: ActiveGameState,
  userId: UserId,
): ClientGameState => {
  const requestingPlayer = rawState.players.find(
    (player) => player.id === userId,
  );

  if (!requestingPlayer) {
    throw new Error('Player not in game');
  }

  const players = rawState.players.map(({ hand: _hand, ...player }) => ({
    ...player,
    isUser: player.id === userId,
  }));

  if (rawState.gameStage === GameStage.IN_PROGRESS) {
    const { drawnCard, ...rest } = rawState;
    const visibleDrawnCard =
      rawState.currentPlayerId === userId ? drawnCard : undefined;
    return {
      ...rest,
      drawnCard: visibleDrawnCard,
      hand: requestingPlayer.hand,
      players,
    };
  }

  return { ...rawState, hand: requestingPlayer.hand, players };
};
