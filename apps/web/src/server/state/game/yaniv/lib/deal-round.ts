import { yanivDeck } from '~/server/data/deck';
import { yanivDiscard } from '~/server/data/discard';
import { deckWithJokers } from '~/types/cards';
import type { UserId } from '~/types/entities';
import type { GameCode } from '~/types/game';
import {
  type GameStage,
  type GameState,
  GameStep,
  type HandSize,
} from '~/types/games/yaniv';
import { shuffle } from '~/utils/cards/index';
import { getPlayerAfter } from './get-player-after';

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

export const getFirstTurnPlayerId = ({
  players,
  dealerId,
  settings,
}: Pick<InProgressState, 'players' | 'dealerId' | 'settings'>): UserId => {
  // The first round has no hand winner, so the player after the dealer starts
  const isFirstRound = players.every(
    (player) => player.roundScores.length === 0,
  );
  return settings.dealer === 'hand-winner' && !isFirstRound
    ? dealerId
    : getPlayerAfter(players, dealerId);
};

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
  currentPlayerId: getFirstTurnPlayerId(state),
  gameStep: GameStep.PLAY_CARDS,
});
