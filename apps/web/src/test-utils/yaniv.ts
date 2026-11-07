import type { YanivLobby } from '~/server/data/lobby';
import type { ClientPlayer } from '~/server/state/game/yaniv/lib/to-client-game-state';
import type { PlayerName, UserId } from '~/types/entities';
import { type GameCode, GameType } from '~/types/game';
import {
  DEFAULT_HAND_SIZE,
  DEFAULT_SETTINGS,
  GameStage,
  type GameState,
  GameStep,
  type RoundScore,
} from '~/types/games/yaniv';

type InProgressState = Extract<GameState, { gameStage: GameStage.IN_PROGRESS }>;

type Player = InProgressState['players'][number];

export const buildRoundScore = (
  overrides: Partial<RoundScore> = {},
): RoundScore => {
  const original = overrides.original ?? 0;
  return {
    original,
    adjusted: original,
    halvedBy: 0,
    ...overrides,
  };
};

export const buildPlayer = (overrides: Partial<Player> = {}): Player => {
  const hand = overrides.hand ?? [];
  return {
    id: 'user-1' as UserId,
    name: 'Player 1' as PlayerName,
    color: 'cyan',
    hand,
    cardCount: hand.length,
    score: 0,
    isFiftyScoreHalved: false,
    isHundredScoreHalved: false,
    isYanivCalled: false,
    roundScores: [],
    ...overrides,
  };
};

export const buildClientPlayer = (
  overrides: Partial<ClientPlayer> = {},
): ClientPlayer => {
  const { hand: _hand, ...player } = buildPlayer();
  return { ...player, isUser: false, ...overrides };
};

export const buildLobbyPlayer = (
  overrides: Partial<YanivLobby['players'][number]> = {},
): YanivLobby['players'][number] => ({
  id: 'user-1' as UserId,
  name: 'Player 1' as PlayerName,
  color: 'cyan',
  isReady: false,
  ...overrides,
});

export const buildYanivLobby = (
  overrides: Partial<YanivLobby> & Pick<YanivLobby, 'players'>,
): YanivLobby => ({
  code: 'ABCDEF' as GameCode,
  type: GameType.YANIV,
  host: overrides.players[0]?.id ?? ('user-1' as UserId),
  settings: DEFAULT_SETTINGS,
  isGameStarted: false,
  ...overrides,
});

/** Narrows a state a test saved, failing the test if it isn't in progress. */
export const expectInProgressState = (
  state: GameState | undefined,
): InProgressState => {
  if (state?.gameStage !== GameStage.IN_PROGRESS) {
    throw new Error('Expected an in-progress Yaniv state');
  }
  return state;
};

export const buildInProgressState = (
  overrides: Partial<InProgressState> &
    Pick<InProgressState, 'players' | 'currentPlayerId'>,
): InProgressState => ({
  gameStage: GameStage.IN_PROGRESS,
  gameStep: GameStep.PLAY_CARDS,
  settings: DEFAULT_SETTINGS,
  handSize: DEFAULT_HAND_SIZE,
  dealerId: overrides.currentPlayerId,
  yanivCallerIds: overrides.players
    .filter((player) => player.isYanivCalled)
    .map((player) => player.id),
  playedCards: [],
  drawnFrom: null,
  ...overrides,
});
