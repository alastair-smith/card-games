import { yanivDeck } from '~/server/data/deck';
import { yanivDiscard } from '~/server/data/discard';
import { deckWithJokers } from '~/types/cards';
import type { GameCode } from '~/types/game';
import {
  type GameStage,
  type GameState,
  GameStep,
  type HandSize,
} from '~/types/games/yaniv';
import { shuffle } from '~/utils/cards/index';

type InProgressState = Extract<GameState, { gameStage: GameStage.IN_PROGRESS }>;

type Player = InProgressState['players'][number];

/** Deals every player a new hand from a fresh deck and turns over the first discard. */
export const dealRound = async (
  code: GameCode,
  players: Player[],
  handSize: HandSize,
): Promise<Player[]> => {
  await yanivDeck.createDeck(code, shuffle([...deckWithJokers]));

  const dealtPlayers: Player[] = [];
  for (const player of players) {
    const cards = await yanivDeck.drawCards(code, handSize);
    dealtPlayers.push({
      ...player,
      isYanivCalled: false,
      cardCount: cards.length,
      hand: cards,
    });
  }

  await yanivDiscard.createDiscard(code);
  const firstDiscard = await yanivDeck.drawCard(code);
  if (!firstDiscard) throw new Error('Deck ran out of cards seeding discard');
  await yanivDiscard.pushDiscard(code, firstDiscard);

  return dealtPlayers;
};

/** Deals the next round, starting with the player whose turn it already is. */
export const dealNextRound = async (
  code: GameCode,
  state: InProgressState,
  handSize: HandSize,
): Promise<InProgressState> => ({
  ...state,
  handSize,
  players: await dealRound(code, state.players, handSize),
  yanivCallerIds: [],
  playedCards: [],
  drawnCard: undefined,
  drawnFrom: null,
  gameStep: GameStep.PLAY_CARDS,
});
