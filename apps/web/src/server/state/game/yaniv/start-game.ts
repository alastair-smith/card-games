import { getLobby, setLobby } from '~/server/data/lobby';
import { runTransaction } from '~/server/data/redis';
import { setYanivState } from '~/server/data/yaniv';
import { publishYanivState } from '~/server/events/yaniv';
import { withLock } from '~/server/state/lib/locks';
import type { UserId } from '~/types/entities';
import { type GameCode, GameType } from '~/types/game';
import {
  GameStage,
  GameStep,
  MAX_PLAYERS,
  MIN_PLAYERS,
  WINNER_CHOOSES_HAND_SIZE,
} from '~/types/games/yaniv';
import { dealRound } from './lib/deal-round';

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

    const { settings } = lobby;

    const firstPlayer = lobby.players[0];
    if (!firstPlayer) throw new Error('No players in lobby');

    const players = lobby.players.map((lobbyPlayer) => ({
      id: lobbyPlayer.id,
      name: lobbyPlayer.name,
      color: lobbyPlayer.color,
      cardCount: 0,
      hand: [],
      score: 0,
      roundScores: [],
      isFiftyScoreHalved: false,
      isHundredScoreHalved: false,
      isYanivCalled: false,
    }));

    const startingState = {
      gameStage: GameStage.IN_PROGRESS as const,
      settings,
      dealerId: firstPlayer.id,
      yanivCallerIds: [],
      currentPlayerId: firstPlayer.id,
      playedCards: [],
      drawnFrom: null,
    };

    // With no last hand to have won, the first player chooses the hand size
    const state =
      settings.handSize === WINNER_CHOOSES_HAND_SIZE
        ? {
            ...startingState,
            gameStep: GameStep.CHOOSE_HAND_SIZE,
            handSize: null,
            players,
          }
        : {
            ...startingState,
            gameStep: GameStep.PLAY_CARDS,
            handSize: settings.handSize,
            players: await dealRound(code, players, settings.handSize),
          };

    await runTransaction(async (transaction) => {
      await setLobby({ code }, { ...lobby, isGameStarted: true }, transaction);
      await setYanivState({ code }, state, transaction);
    });
    await publishYanivState(code, state);
  });
