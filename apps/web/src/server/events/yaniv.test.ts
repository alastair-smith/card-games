import { beforeEach, describe, expect, test, vi } from 'vitest';
import { yanivDiscard } from '~/server/data/discard';
import { Rank, Suit } from '~/types/cards';
import type { PlayerName, UserId } from '~/types/entities';
import type { GameCode } from '~/types/game';
import {
  GameStage,
  GameStep,
  type YanivPlayingCard,
} from '~/types/games/yaniv';

vi.mock('~/server/data/discard', () => ({
  yanivDiscard: {
    peekDiscard: vi.fn(),
  },
}));

const emitMock = vi.fn();
vi.mock('./emitter', () => ({
  default: { emit: emitMock },
}));

const { publishYanivState } = await import('./yaniv');

const CODE = 'ABCDEF' as GameCode;
const USER_1 = '00000000-0000-4000-8000-000000000001' as UserId;
const USER_2 = '00000000-0000-4000-8000-000000000002' as UserId;

const TOP_CARD: YanivPlayingCard = { suit: Suit.HEARTS, rank: Rank.ACE };

const makeInProgressState = () => ({
  gameStage: GameStage.IN_PROGRESS as const,
  gameStep: GameStep.PLAY_CARDS,
  currentPlayerId: USER_1,
  players: [
    {
      id: USER_1,
      cardCount: 2,
      name: 'Player 1' as PlayerName,
      score: 0,
      roundScore: { original: 0, adjusted: 0 },
      isFiftyScoreHalved: false,
      isHundredScoreHalved: false,
      isYanivCalled: false,
    },
    {
      id: USER_2,
      cardCount: 2,
      name: 'Player 2' as PlayerName,
      score: 0,
      roundScore: { original: 0, adjusted: 0 },
      isFiftyScoreHalved: false,
      isHundredScoreHalved: false,
      isYanivCalled: false,
    },
  ],
  playedCards: [],
  hands: {
    [USER_1]: [{ suit: Suit.CLUBS, rank: Rank.TWO }],
    [USER_2]: [{ suit: Suit.DIAMONDS, rank: Rank.THREE }],
  },
});

describe('publishYanivState', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('in-progress game', () => {
    test('includes top discard card in the emitted state', async () => {
      vi.mocked(yanivDiscard.peekDiscard).mockResolvedValue(TOP_CARD);

      await publishYanivState(CODE, makeInProgressState());

      expect(emitMock).toHaveBeenCalledOnce();
      expect(emitMock.mock.calls[0]?.[1]).toMatchObject({
        topDiscardCard: TOP_CARD,
      });
    });

    test('includes null top discard card when discard pile is empty', async () => {
      vi.mocked(yanivDiscard.peekDiscard).mockResolvedValue(null);

      await publishYanivState(CODE, makeInProgressState());

      expect(emitMock).toHaveBeenCalledOnce();
      expect(emitMock.mock.calls[0]?.[1]).toMatchObject({
        topDiscardCard: null,
      });
    });

    test('peeks the discard for the correct game code', async () => {
      vi.mocked(yanivDiscard.peekDiscard).mockResolvedValue(null);

      await publishYanivState(CODE, makeInProgressState());

      expect(vi.mocked(yanivDiscard.peekDiscard)).toHaveBeenCalledOnce();
      expect(vi.mocked(yanivDiscard.peekDiscard)).toHaveBeenCalledWith(CODE);
    });
  });

  describe('lobby game', () => {
    test('does not peek the discard pile', async () => {
      await publishYanivState(CODE, { gameStage: GameStage.LOBBY });

      expect(vi.mocked(yanivDiscard.peekDiscard)).not.toHaveBeenCalled();
    });

    test('emits the lobby state', async () => {
      await publishYanivState(CODE, { gameStage: GameStage.LOBBY });

      expect(emitMock).toHaveBeenCalledOnce();
      expect(emitMock.mock.calls[0]?.[1]).toEqual({
        gameStage: GameStage.LOBBY,
      });
    });
  });
});
