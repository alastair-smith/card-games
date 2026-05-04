import { SpanStatusCode, trace } from '@opentelemetry/api';
import { yanivDeck } from '~/server/data/deck';
import { yanivDiscard } from '~/server/data/discard';
import type { GameCode } from '~/types/game';
import { shuffle } from '~/utils/cards';

const tracer = trace.getTracer('card-games');

export const reshuffleDeck = async (code: GameCode): Promise<void> => {
  await tracer.startActiveSpan('yaniv.deck-reshuffle', async (span) => {
    try {
      const [topCard, ...cardsToShuffle] =
        await yanivDiscard.drainDiscard(code);
      await yanivDeck.createDeck(code, shuffle(cardsToShuffle));
      if (topCard) await yanivDiscard.pushDiscard(code, topCard);
    } catch (error) {
      span.setStatus({ code: SpanStatusCode.ERROR });
      if (error instanceof Error) span.recordException(error);
      throw error;
    } finally {
      span.end();
    }
  });
};
