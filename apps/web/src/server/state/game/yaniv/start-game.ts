import { yanivDeck } from '~/server/data/deck';
import { yanivDiscard } from '~/server/data/discard';
import { getLobby, queueSetLobby } from '~/server/data/lobby';
import { runTransaction } from '~/server/data/redis';
import { queueSetYanivState } from '~/server/data/yaniv';
import { publishYanivState } from '~/server/events/yaniv';
import { withLock } from '~/server/state/lib/locks';
import { deckWithJokers } from '~/types/cards';
import type { UserId } from '~/types/entities';
import { type GameCode, GameType } from '~/types/game';
import {
  GameStage,
  GameStep,
  MAX_PLAYERS,
  MIN_PLAYERS,
} from '~/types/games/yaniv';
import { shuffle } from '~/utils/cards/index';

export const startGame = async (code: GameCode, userId: UserId) =>
  withLock('lobby', code, async () => {
    const lobby = await getLobby({ code });
    if (!lobby) throw new Error('Lobby not found');
    if (lobby.type !== GameType.YANIV) throw new Error('Not a Yaniv lobby');
    if (lobby.isGameStarted) throw new Error('Game has already started');
    if (lobby.host !== userId)
      throw new Error('Only the host can start the game');
    if (lobby.players.length < MIN_PLAYERS)
      throw new Error('Not enough players to start the game');
    if (lobby.players.length > MAX_PLAYERS)
      throw new Error('Too many players to start the game');

    const { handSize } = lobby.settings;

    await yanivDeck.createDeck(code, shuffle(deckWithJokers));

    const players = [];
    for (const lobbyPlayer of lobby.players) {
      const cards = await yanivDeck.drawCards(code, handSize);
      players.push({
        id: lobbyPlayer.id,
        name: lobbyPlayer.name,
        color: lobbyPlayer.color,
        cardCount: cards.length,
        hand: cards,
        score: 0,
        roundScores: [],
        isFiftyScoreHalved: false,
        isHundredScoreHalved: false,
        isYanivCalled: false,
      });
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
      handSize,
      currentPlayerId: firstPlayer.id,
      players,
      playedCards: [],
    };

    await runTransaction((transaction) => {
      queueSetLobby(transaction, { code }, { ...lobby, isGameStarted: true });
      queueSetYanivState(transaction, { code }, state);
    });
    await publishYanivState(code, state);
  });
