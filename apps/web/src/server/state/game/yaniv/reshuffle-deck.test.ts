import { SpanStatusCode } from '@opentelemetry/api';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { yanivDeck } from '~/server/data/deck';
import { yanivDiscard } from '~/server/data/discard';
import { Rank, Suit } from '~/types/cards';
import type { GameCode } from '~/types/game';
import type { YanivPlayingCard } from '~/types/games/yaniv';

const mockSpan = {
  setStatus: vi.fn(),
  recordException: vi.fn(),
  end: vi.fn(),
};

vi.mock('@opentelemetry/api', () => ({
  SpanStatusCode: { ERROR: 2 },
  trace: {
    getTracer: () => ({
      startActiveSpan: (_name: string, fn: (span: typeof mockSpan) => Promise<void>) =>
        fn(mockSpan),
    }),
  },
}));

vi.mock('~/server/data/deck', () => ({
  yanivDeck: {
    createDeck: vi.fn(),
  },
}));

vi.mock('~/server/data/discard', () => ({
  yanivDiscard: {
    drainDiscard: vi.fn(),
    pushDiscard: vi.fn(),
  },
}));

vi.mock('~/utils/cards', () => ({
  shuffle: vi.fn((cards) => cards),
}));

const { reshuffleDeck } = await import('./reshuffle-deck');

const CODE = 'ABCDEF' as GameCode;

const TOP_CARD: YanivPlayingCard = { suit: Suit.HEARTS, rank: Rank.ACE };
const CARD_A: YanivPlayingCard = { suit: Suit.CLUBS, rank: Rank.TWO };
const CARD_B: YanivPlayingCard = { suit: Suit.DIAMONDS, rank: Rank.THREE };

describe('reshuffleDeck', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(yanivDiscard.drainDiscard).mockResolvedValue([TOP_CARD, CARD_A, CARD_B]);
    vi.mocked(yanivDeck.createDeck).mockResolvedValue(undefined);
    vi.mocked(yanivDiscard.pushDiscard).mockResolvedValue(undefined);
  });

  test('drains the discard pile', async () => {
    await reshuffleDeck(CODE);

    expect(vi.mocked(yanivDiscard.drainDiscard)).toHaveBeenCalledOnce();
    expect(vi.mocked(yanivDiscard.drainDiscard)).toHaveBeenCalledWith(CODE);
  });

  test('creates a new deck with shuffled cards excluding the top card', async () => {
    await reshuffleDeck(CODE);

    expect(vi.mocked(yanivDeck.createDeck)).toHaveBeenCalledOnce();
    expect(vi.mocked(yanivDeck.createDeck)).toHaveBeenCalledWith(CODE, [CARD_A, CARD_B]);
  });

  test('restores the top card to the discard pile', async () => {
    await reshuffleDeck(CODE);

    expect(vi.mocked(yanivDiscard.pushDiscard)).toHaveBeenCalledOnce();
    expect(vi.mocked(yanivDiscard.pushDiscard)).toHaveBeenCalledWith(CODE, TOP_CARD);
  });

  test('does not restore to discard pile when discard was empty', async () => {
    vi.mocked(yanivDiscard.drainDiscard).mockResolvedValue([]);

    await reshuffleDeck(CODE);

    expect(vi.mocked(yanivDiscard.pushDiscard)).not.toHaveBeenCalled();
  });

  describe('span', () => {
    test('ends the span on success', async () => {
      await reshuffleDeck(CODE);

      expect(mockSpan.end).toHaveBeenCalledOnce();
    });

    test('ends the span when an error is thrown', async () => {
      vi.mocked(yanivDiscard.drainDiscard).mockRejectedValue(new Error('Redis error'));

      await expect(reshuffleDeck(CODE)).rejects.toThrow();

      expect(mockSpan.end).toHaveBeenCalledOnce();
    });

    test('marks the span as an error when an error is thrown', async () => {
      vi.mocked(yanivDiscard.drainDiscard).mockRejectedValue(new Error('Redis error'));

      await expect(reshuffleDeck(CODE)).rejects.toThrow();

      expect(mockSpan.setStatus).toHaveBeenCalledWith({ code: SpanStatusCode.ERROR });
    });

    test('records the exception on the span when an error is thrown', async () => {
      const error = new Error('Redis error');
      vi.mocked(yanivDiscard.drainDiscard).mockRejectedValue(error);

      await expect(reshuffleDeck(CODE)).rejects.toThrow();

      expect(mockSpan.recordException).toHaveBeenCalledWith(error);
    });
  });
});
