import type { ClientPlayer } from '~/server/state/game/yaniv/to-client-game-state';
import type { PlayerName, UserId } from '~/types/entities';
import {
  DEFAULT_HAND_SIZE,
  GameStage,
  type GameState,
  GameStep,
} from '~/types/games/yaniv';

type InProgressState = Extract<GameState, { gameStage: GameStage.IN_PROGRESS }>;

type Player = InProgressState['players'][number];

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
    roundScore: { original: 0, adjusted: 0 },
    ...overrides,
  };
};

export const buildClientPlayer = (
  overrides: Partial<ClientPlayer> = {},
): ClientPlayer => {
  const { hand: _hand, ...player } = buildPlayer();
  return { ...player, isUser: false, ...overrides };
};

export const buildInProgressState = (
  overrides: Partial<InProgressState> &
    Pick<InProgressState, 'players' | 'currentPlayerId'>,
): InProgressState => ({
  gameStage: GameStage.IN_PROGRESS,
  gameStep: GameStep.PLAY_CARDS,
  handSize: DEFAULT_HAND_SIZE,
  playedCards: [],
  ...overrides,
});
