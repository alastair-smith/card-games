import type { StandardPlayingCard } from '~/types/cards';
import type { UserId } from '~/types/entities';
import type {
  GameStage,
  GameState,
  TableCardSlot,
} from '~/types/games/shithead';

type ActiveGameState = Extract<
  GameState,
  { gameStage: GameStage.SWAPPING | GameStage.IN_PROGRESS | GameStage.FINISHED }
>;

type Player = ActiveGameState['players'][number];

export type ClientPlayer = Omit<Player, 'hand' | 'tableCards'> & {
  cardCount: number;
  tableCards: TableCardSlot[];
  isUser: boolean;
};

type ToClientState<State extends ActiveGameState> = Omit<State, 'players'> & {
  hand: StandardPlayingCard[];
  players: ClientPlayer[];
};

export type ClientGameState =
  | ToClientState<Extract<ActiveGameState, { gameStage: GameStage.SWAPPING }>>
  | ToClientState<
      Extract<ActiveGameState, { gameStage: GameStage.IN_PROGRESS }>
    >
  | ToClientState<Extract<ActiveGameState, { gameStage: GameStage.FINISHED }>>;

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

  const players = rawState.players.map(({ hand, tableCards, ...player }) => ({
    ...player,
    cardCount: hand.length,
    tableCards: tableCards.map(({ faceUpCard, faceDownCard }) => ({
      faceUpCard,
      hasFaceDownCard: faceDownCard !== null,
    })),
    isUser: player.id === userId,
  }));

  return { ...rawState, hand: requestingPlayer.hand, players };
};
