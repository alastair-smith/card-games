import type { ShitheadLobby } from '~/server/data/lobby';
import type { ClientFinishedPlayer } from '~/server/state/game/shithead/lib/to-client-game-state';
import { Rank, Suit } from '~/types/cards';
import type { PlayerName, UserId } from '~/types/entities';
import { type GameCode, GameType } from '~/types/game';
import {
  type FinishedState,
  GameStage,
  type InProgressState,
  type Player,
  type SwappingState,
  type TableCardSlot,
} from '~/types/games/shithead';

export function buildTableCards(): TableCardSlot[] {
  return [
    {
      faceUpCard: { suit: Suit.HEARTS, rank: Rank.SEVEN },
      hasFaceDownCard: true,
    },
    {
      faceUpCard: { suit: Suit.SPADES, rank: Rank.KING },
      hasFaceDownCard: true,
    },
    {
      faceUpCard: { suit: Suit.DIAMONDS, rank: Rank.TEN },
      hasFaceDownCard: true,
    },
  ];
}

export const buildPlayer = (overrides: Partial<Player> = {}): Player => ({
  id: 'user-1' as UserId,
  name: 'Player 1' as PlayerName,
  color: 'cyan',
  hand: [],
  tableCards: [],
  isSwapConfirmed: false,
  finishingPosition: null,
  ...overrides,
});

export const buildClientFinishedPlayer = (
  overrides: Partial<ClientFinishedPlayer> = {},
): ClientFinishedPlayer => ({
  id: 'user-1' as UserId,
  name: 'Player 1' as PlayerName,
  color: 'cyan',
  isSwapConfirmed: true,
  finishingPosition: 1,
  cardCount: 0,
  tableCards: [],
  isUser: false,
  ...overrides,
});

export const buildSwappingState = (
  overrides: Partial<SwappingState> & Pick<SwappingState, 'players'>,
): SwappingState => ({
  gameStage: GameStage.SWAPPING,
  ...overrides,
});

export const buildInProgressState = (
  overrides: Partial<InProgressState> &
    Pick<InProgressState, 'players' | 'currentPlayerId'>,
): InProgressState => ({
  gameStage: GameStage.IN_PROGRESS,
  ...overrides,
});

export const buildFinishedState = (
  overrides: Partial<FinishedState> & Pick<FinishedState, 'players'>,
): FinishedState => ({
  gameStage: GameStage.FINISHED,
  ...overrides,
});

export const buildShitheadLobby = (
  overrides: Partial<ShitheadLobby> & Pick<ShitheadLobby, 'players'>,
): ShitheadLobby => ({
  code: 'ABCDEF' as GameCode,
  type: GameType.SHITHEAD,
  host: overrides.players[0]?.id ?? ('user-1' as UserId),
  isGameStarted: false,
  ...overrides,
});
