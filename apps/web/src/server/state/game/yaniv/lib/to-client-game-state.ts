import type { UserId } from '~/types/entities';
import {
  GameStage,
  type GameState,
  type YanivPlayingCard,
} from '~/types/games/yaniv';

type InProgressGameState = Extract<
  GameState,
  { gameStage: GameStage.IN_PROGRESS }
>;

type Player = InProgressGameState['players'][number];

export type ClientPlayer = Omit<Player, 'hand'> & { isUser: boolean };

type ClientInProgressGameState = Omit<InProgressGameState, 'players'> & {
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
    const { drawnCard, deckOnlyPickup, ...rest } = rawState;
    const isCurrentPlayer = rawState.currentPlayerId === userId;
    return {
      ...rest,
      drawnCard: isCurrentPlayer ? drawnCard : undefined,
      deckOnlyPickup: isCurrentPlayer ? deckOnlyPickup : undefined,
      hand: requestingPlayer.hand,
      players,
    };
  }

  return { ...rawState, hand: requestingPlayer.hand, players };
};
