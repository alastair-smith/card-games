import { yanivDeck } from '~/server/data/deck';
import { yanivDiscard } from '~/server/data/discard';
import { getLobby } from '~/server/data/lobby';
import { setYanivState } from '~/server/data/yaniv';
import { publishYanivState } from '~/server/events/yaniv';
import { deckWithJokers } from '~/types/cards';
import type { UserId } from '~/types/entities';
import type { GameCode } from '~/types/game';
import {
  GameStage,
  GameStep,
  HAND_SIZE,
  MAX_PLAYERS,
  MIN_PLAYERS,
  type YanivPlayingCard,
} from '~/types/games/yaniv';
import { shuffle } from '~/utils/cards/index';

export const startGame = async (code: GameCode, userId: UserId) => {
  const lobby = await getLobby({ code });
  if (!lobby) throw new Error('Lobby not found');
  if (lobby.host !== userId)
    throw new Error('Only the host can start the game');
  if (lobby.players.length < MIN_PLAYERS)
    throw new Error('Not enough players to start the game');
  if (lobby.players.length > MAX_PLAYERS)
    throw new Error('Too many players to start the game');

  const players = lobby.players.map((player) => ({
    id: player.id,
    name: player.name,
    cardCount: 0,
    score: 0,
    roundScore: { original: 0, adjusted: 0 },
    isFiftyScoreHalved: false,
    isHundredScoreHalved: false,
    isYanivCalled: false,
  }));

  await yanivDeck.createDeck(code, shuffle(deckWithJokers));

  const hands: Record<UserId, YanivPlayingCard[]> = {} as Record<
    UserId,
    YanivPlayingCard[]
  >;
  for (const player of players) {
    const cards = await yanivDeck.drawCards(code, HAND_SIZE);
    hands[player.id] = cards;
    player.cardCount = cards.length;
  }

  await yanivDiscard.createDiscard(code);
  const firstDiscard = await yanivDeck.drawCard(code);
  if (!firstDiscard) throw new Error('Deck ran out of cards seeding discard');
  await yanivDiscard.pushDiscard(code, firstDiscard);

  const firstPlayer = lobby.players[0];
  if (!firstPlayer) throw new Error('No players in lobby');

  const state = {
    gameStage: GameStage.IN_PROGRESS as const,
    gameStep: GameStep.PLAY_CARDS,
    currentPlayerId: firstPlayer.id,
    players,
    hands,
    playedCards: [] as YanivPlayingCard[],
  };

  await setYanivState({ code }, state);
  await publishYanivState(code, state);
};
