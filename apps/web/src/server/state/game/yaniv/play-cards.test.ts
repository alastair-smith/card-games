import { beforeEach, describe, expect, test, vi } from 'vitest';
import { yanivDiscard } from '~/server/data/discard';
import { getYanivState, setYanivState } from '~/server/data/yaniv';
import { publishEmoji } from '~/server/events/emoji';
import { publishYanivState } from '~/server/events/yaniv';
import { buildInProgressState, buildPlayer } from '~/test-utils/yaniv';
import { Rank, Suit } from '~/types/cards';
import type { UserId } from '~/types/entities';
import type { GameCode } from '~/types/game';
import {
  GameStage,
  type GameState,
  GameStep,
  type YanivPlayingCard,
} from '~/types/games/yaniv';
import { isValidYanivPlay } from '~/utils/yaniv/validation';

type State = Extract<GameState, { gameStage: GameStage.IN_PROGRESS }>;

vi.mock('~/server/data/yaniv', () => ({
  getYanivState: vi.fn(),
  setYanivState: vi.fn(),
}));
vi.mock('~/server/events/yaniv', () => ({
  publishYanivState: vi.fn(),
}));
vi.mock('~/server/events/emoji', () => ({
  publishEmoji: vi.fn(),
}));
vi.mock('~/server/data/discard', () => ({
  yanivDiscard: {
    peekDiscard: vi.fn(),
    pushDiscard: vi.fn(),
  },
}));
vi.mock('~/utils/yaniv/validation', () => ({
  isValidYanivPlay: vi.fn(),
}));

const { playCards } = await import('./play-cards');

const CODE = 'ABCDEF' as GameCode;
const USER_1 = 'user-1' as UserId;
const USER_2 = 'user-2' as UserId;

const CARD_1: YanivPlayingCard = { suit: Suit.HEARTS, rank: Rank.FIVE };
const CARD_2: YanivPlayingCard = { suit: Suit.SPADES, rank: Rank.SEVEN };
const TOP_DISCARD: YanivPlayingCard = { suit: Suit.CLUBS, rank: Rank.THREE };

const makeState = (overrides: Partial<State> = {}): State =>
  buildInProgressState({
    currentPlayerId: USER_1,
    players: [
      buildPlayer({ id: USER_1, hand: [CARD_1, CARD_2] }),
      buildPlayer({
        id: USER_2,
        hand: [
          { suit: Suit.DIAMONDS, rank: Rank.FOUR },
          { suit: Suit.CLUBS, rank: Rank.SIX },
        ],
      }),
    ],
    ...overrides,
  });

const makeValidPlay = (
  orderedCards: YanivPlayingCard[],
  isPickupRequired = true,
  isPickupDeckOnly?: boolean,
) => ({
  isValid: true,
  isPickupRequired,
  isPickupDeckOnly,
  orderedCards,
});

describe('playCards', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(getYanivState).mockResolvedValue(makeState());
    vi.mocked(setYanivState).mockResolvedValue(makeState());
    vi.mocked(publishYanivState).mockResolvedValue(undefined);
    vi.mocked(publishEmoji).mockReturnValue(undefined);
    vi.mocked(yanivDiscard.peekDiscard).mockResolvedValue(TOP_DISCARD);
    vi.mocked(yanivDiscard.pushDiscard).mockResolvedValue(undefined);
    vi.mocked(isValidYanivPlay).mockReturnValue(makeValidPlay([CARD_1]));
  });

  test('throws when game not found', async () => {
    vi.mocked(getYanivState).mockResolvedValue(null);

    await expect(playCards(CODE, USER_1, [CARD_1])).rejects.toThrow(
      'Game not found',
    );
  });

  test('throws when game is not in progress', async () => {
    vi.mocked(getYanivState).mockResolvedValue({ gameStage: GameStage.LOBBY });

    await expect(playCards(CODE, USER_1, [CARD_1])).rejects.toThrow(
      'Game is not in progress',
    );
  });

  test('throws when not the play cards step', async () => {
    vi.mocked(getYanivState).mockResolvedValue(
      makeState({ gameStep: GameStep.PICKUP_CARD }),
    );

    await expect(playCards(CODE, USER_1, [CARD_1])).rejects.toThrow(
      'Cannot play cards in this game step',
    );
  });

  test('throws when not the current player', async () => {
    await expect(playCards(CODE, USER_2, [CARD_1])).rejects.toThrow(
      'Not your turn',
    );
  });

  test('throws when player not found', async () => {
    vi.mocked(getYanivState).mockResolvedValue(
      makeState({
        currentPlayerId: 'unknown' as UserId,
        players: [],
      }),
    );

    await expect(
      playCards(CODE, 'unknown' as UserId, [CARD_1]),
    ).rejects.toThrow('Player not found');
  });

  test('throws when a card is not in the player hand', async () => {
    const notInHand: YanivPlayingCard = { suit: Suit.CLUBS, rank: Rank.KING };

    await expect(playCards(CODE, USER_1, [notInHand])).rejects.toThrow(
      'Card not in hand',
    );
  });

  test('throws when the combination is invalid', async () => {
    vi.mocked(isValidYanivPlay).mockReturnValue({ isValid: false });

    await expect(playCards(CODE, USER_1, [CARD_1])).rejects.toThrow(
      'Invalid card combination',
    );
  });

  test('removes played cards from the player hand', async () => {
    await playCards(CODE, USER_1, [CARD_1]);

    const savedState = vi.mocked(setYanivState).mock.calls[0]?.[1] as State;
    expect(savedState.players.find(({ id }) => id === USER_1)?.hand).toEqual([
      CARD_2,
    ]);
  });

  test('decrements the player card count', async () => {
    await playCards(CODE, USER_1, [CARD_1]);

    expect(vi.mocked(setYanivState).mock.calls[0]?.[1]).toMatchObject({
      players: expect.arrayContaining([
        expect.objectContaining({
          id: USER_1,
          color: 'cyan',
          cardCount: 1,
        }),
      ]),
    });
  });

  test('sets played cards using the ordered cards from validation', async () => {
    const orderedCards = [CARD_2, CARD_1];
    vi.mocked(isValidYanivPlay).mockReturnValue(makeValidPlay(orderedCards));

    await playCards(CODE, USER_1, [CARD_1, CARD_2]);

    expect(vi.mocked(setYanivState).mock.calls[0]?.[1]).toMatchObject({
      playedCards: orderedCards,
    });
  });

  test('does not push to the discard pile', async () => {
    await playCards(CODE, USER_1, [CARD_1]);

    expect(vi.mocked(yanivDiscard.pushDiscard)).not.toHaveBeenCalled();
  });

  test('advances to PICKUP_CARD when pickup is required', async () => {
    vi.mocked(isValidYanivPlay).mockReturnValue(makeValidPlay([CARD_1], true));

    await playCards(CODE, USER_1, [CARD_1]);

    expect(vi.mocked(setYanivState).mock.calls[0]?.[1]).toMatchObject({
      gameStep: GameStep.PICKUP_CARD,
    });
  });

  test('advances to PROCEED when no pickup is required', async () => {
    vi.mocked(isValidYanivPlay).mockReturnValue(makeValidPlay([CARD_1], false));

    await playCards(CODE, USER_1, [CARD_1]);

    expect(vi.mocked(setYanivState).mock.calls[0]?.[1]).toMatchObject({
      gameStep: GameStep.PROCEED,
    });
  });

  test('sets deck-only pickup restriction when validation signals it', async () => {
    vi.mocked(isValidYanivPlay).mockReturnValue(
      makeValidPlay([CARD_1], true, true),
    );

    await playCards(CODE, USER_1, [CARD_1]);

    expect(vi.mocked(setYanivState).mock.calls[0]?.[1]).toMatchObject({
      deckOnlyPickup: true,
    });
  });

  test('does not set deck-only pickup restriction for normal plays', async () => {
    vi.mocked(isValidYanivPlay).mockReturnValue(makeValidPlay([CARD_1], true));

    await playCards(CODE, USER_1, [CARD_1]);

    expect(vi.mocked(setYanivState).mock.calls[0]?.[1]).toHaveProperty(
      'deckOnlyPickup',
      undefined,
    );
  });

  test('passes direction to validation', async () => {
    await playCards(CODE, USER_1, [CARD_1], 'descending');

    expect(vi.mocked(isValidYanivPlay)).toHaveBeenCalledWith(
      [CARD_1],
      TOP_DISCARD,
      'descending',
    );
  });

  test('persists and publishes the updated state', async () => {
    await playCards(CODE, USER_1, [CARD_1]);

    expect(vi.mocked(setYanivState)).toHaveBeenCalledOnce();
    expect(vi.mocked(setYanivState)).toHaveBeenCalledWith(
      { code: CODE },
      expect.objectContaining({ gameStage: GameStage.IN_PROGRESS }),
    );
    expect(vi.mocked(publishYanivState)).toHaveBeenCalledOnce();
    expect(vi.mocked(publishYanivState)).toHaveBeenCalledWith(
      CODE,
      expect.objectContaining({ gameStage: GameStage.IN_PROGRESS }),
    );
  });

  test('does not publish an emoji on a normal card play', async () => {
    await playCards(CODE, USER_1, [CARD_1]);

    expect(vi.mocked(publishEmoji)).not.toHaveBeenCalled();
  });

  describe('playing back drawn card during PROCEED step', () => {
    const PREVIOUSLY_PLAYED: YanivPlayingCard = {
      suit: Suit.DIAMONDS,
      rank: Rank.NINE,
    };

    beforeEach(() => {
      vi.mocked(getYanivState).mockResolvedValue(
        makeState({
          gameStep: GameStep.PROCEED,
          drawnCard: CARD_1,
          playedCards: [PREVIOUSLY_PLAYED],
        }),
      );
      vi.mocked(isValidYanivPlay).mockReturnValue(makeValidPlay([CARD_1]));
    });

    test('throws when no drawn card in state', async () => {
      vi.mocked(getYanivState).mockResolvedValue(
        makeState({
          gameStep: GameStep.PROCEED,
          drawnCard: undefined,
          playedCards: [PREVIOUSLY_PLAYED],
        }),
      );

      await expect(playCards(CODE, USER_1, [CARD_1])).rejects.toThrow(
        'No drawn card to play back',
      );
    });

    test('throws when played card does not match drawn card', async () => {
      await expect(playCards(CODE, USER_1, [CARD_2])).rejects.toThrow(
        'Can only play back the drawn card',
      );
    });

    test('throws when there are no previously played cards to validate against', async () => {
      vi.mocked(getYanivState).mockResolvedValue(
        makeState({ gameStep: GameStep.PROCEED, drawnCard: CARD_1 }),
      );

      await expect(playCards(CODE, USER_1, [CARD_1])).rejects.toThrow(
        'No played cards to validate against',
      );
    });

    test('validates against the last card in the played pile', async () => {
      await playCards(CODE, USER_1, [CARD_1]);

      expect(vi.mocked(isValidYanivPlay)).toHaveBeenCalledWith(
        [CARD_1],
        PREVIOUSLY_PLAYED,
      );
    });

    test('does not peek the discard pile', async () => {
      await playCards(CODE, USER_1, [CARD_1]);

      expect(vi.mocked(yanivDiscard.peekDiscard)).not.toHaveBeenCalled();
    });

    test('removes the played card from hand', async () => {
      await playCards(CODE, USER_1, [CARD_1]);

      const savedState = vi.mocked(setYanivState).mock.calls[0]?.[1] as State;
      expect(savedState.players.find(({ id }) => id === USER_1)?.hand).toEqual([
        CARD_2,
      ]);
    });

    test('decrements the player card count', async () => {
      await playCards(CODE, USER_1, [CARD_1]);

      expect(vi.mocked(setYanivState).mock.calls[0]?.[1]).toMatchObject({
        players: expect.arrayContaining([
          expect.objectContaining({
            id: USER_1,
            color: 'cyan',
            cardCount: 1,
          }),
        ]),
      });
    });

    test('appends the played card to the existing played pile', async () => {
      await playCards(CODE, USER_1, [CARD_1]);

      expect(vi.mocked(setYanivState).mock.calls[0]?.[1]).toMatchObject({
        playedCards: [PREVIOUSLY_PLAYED, CARD_1],
      });
    });

    test('keeps PROCEED step', async () => {
      await playCards(CODE, USER_1, [CARD_1]);

      expect(vi.mocked(setYanivState).mock.calls[0]?.[1]).toMatchObject({
        gameStep: GameStep.PROCEED,
      });
    });

    test('clears drawn card', async () => {
      await playCards(CODE, USER_1, [CARD_1]);

      expect(vi.mocked(setYanivState).mock.calls[0]?.[1]).toHaveProperty(
        'drawnCard',
        undefined,
      );
    });

    test('persists and publishes the updated state', async () => {
      await playCards(CODE, USER_1, [CARD_1]);

      expect(vi.mocked(setYanivState)).toHaveBeenCalledOnce();
      expect(vi.mocked(publishYanivState)).toHaveBeenCalledOnce();
    });

    test('publishes an emoji reaction targeting the player who played the free card', async () => {
      await playCards(CODE, USER_1, [CARD_1]);

      expect(vi.mocked(publishEmoji)).toHaveBeenCalledOnce();
      expect(vi.mocked(publishEmoji)).toHaveBeenCalledWith(CODE, {
        emoji: '🍀',
        targetPlayerId: USER_1,
        id: expect.any(String),
      });
    });

    describe('with a straight flush of three cards on the pile', () => {
      const FIRST_CARD: YanivPlayingCard = {
        suit: Suit.HEARTS,
        rank: Rank.THREE,
      };
      const MIDDLE_CARD: YanivPlayingCard = {
        suit: Suit.HEARTS,
        rank: Rank.FOUR,
      };
      const LAST_CARD: YanivPlayingCard = {
        suit: Suit.HEARTS,
        rank: Rank.FIVE,
      };
      // extends from the end (matches rank of LAST_CARD's neighbour)
      const CARD_EXTENDING_END: YanivPlayingCard = {
        suit: Suit.HEARTS,
        rank: Rank.SIX,
      };
      // extends from the start (matches rank of FIRST_CARD's neighbour)
      const CARD_EXTENDING_START: YanivPlayingCard = {
        suit: Suit.HEARTS,
        rank: Rank.TWO,
      };

      test('allows playing a card that matches the rank of the last card in the run', async () => {
        vi.mocked(getYanivState).mockResolvedValue(
          makeState({
            gameStep: GameStep.PROCEED,
            drawnCard: CARD_EXTENDING_END,
            playedCards: [FIRST_CARD, MIDDLE_CARD, LAST_CARD],
            players: [
              buildPlayer({ id: USER_1, hand: [CARD_EXTENDING_END, CARD_2] }),
            ],
          }),
        );
        vi.mocked(isValidYanivPlay).mockReturnValue(
          makeValidPlay([CARD_EXTENDING_END], false),
        );

        await playCards(CODE, USER_1, [CARD_EXTENDING_END]);

        expect(vi.mocked(isValidYanivPlay)).toHaveBeenCalledWith(
          [CARD_EXTENDING_END],
          LAST_CARD,
        );
        expect(vi.mocked(setYanivState).mock.calls[0]?.[1]).toMatchObject({
          playedCards: [FIRST_CARD, MIDDLE_CARD, LAST_CARD, CARD_EXTENDING_END],
        });
      });

      test('rejects playing a card that only matches the rank of the first card in the run', async () => {
        vi.mocked(getYanivState).mockResolvedValue(
          makeState({
            gameStep: GameStep.PROCEED,
            drawnCard: CARD_EXTENDING_START,
            playedCards: [FIRST_CARD, MIDDLE_CARD, LAST_CARD],
            players: [
              buildPlayer({ id: USER_1, hand: [CARD_EXTENDING_START, CARD_2] }),
            ],
          }),
        );
        vi.mocked(isValidYanivPlay).mockReturnValue({ isValid: false });

        await expect(
          playCards(CODE, USER_1, [CARD_EXTENDING_START]),
        ).rejects.toThrow('Invalid card combination');
        expect(vi.mocked(isValidYanivPlay)).toHaveBeenCalledWith(
          [CARD_EXTENDING_START],
          LAST_CARD,
        );
      });
    });
  });
});
