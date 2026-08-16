import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import type { PlayerName, UserId } from '~/types/entities';
import useYanivScoreboard, {
  type RoundId,
  SCOREBOARD_STORAGE_KEY,
  type ScoreboardState,
} from './useYanivScoreboard';

const ADA_ID = crypto.randomUUID() as UserId;
const GRACE_ID = crypto.randomUUID() as UserId;
const ALAN_ID = crypto.randomUUID() as UserId;
const FIRST_ROUND_ID = crypto.randomUUID() as RoundId;
const SECOND_ROUND_ID = crypto.randomUUID() as RoundId;

const savedGame: ScoreboardState = {
  players: [
    { id: ADA_ID, name: 'Ada' as PlayerName },
    { id: GRACE_ID, name: 'Grace' as PlayerName },
    { id: ALAN_ID, name: 'Alan' as PlayerName },
  ],
  rounds: [
    {
      id: FIRST_ROUND_ID,
      isComplete: true,
      handTotals: { [ADA_ID]: 3, [GRACE_ID]: 21, [ALAN_ID]: 14 },
    },
    {
      id: SECOND_ROUND_ID,
      isComplete: true,
      handTotals: { [ADA_ID]: 18, [GRACE_ID]: 5, [ALAN_ID]: 9 },
    },
  ],
};

const saveGame = (state: ScoreboardState) => {
  localStorage.setItem(SCOREBOARD_STORAGE_KEY, JSON.stringify(state));
};

const readSavedGame = () => {
  const stored = localStorage.getItem(SCOREBOARD_STORAGE_KEY);
  return stored === null ? null : JSON.parse(stored);
};

describe('useYanivScoreboard', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  describe('players', () => {
    test('starts a new game with no players', () => {
      const { result } = renderHook(() => useYanivScoreboard());

      expect(result.current.scoreboardState.players).toEqual([]);
    });

    test('adds a player', () => {
      const { result } = renderHook(() => useYanivScoreboard());

      act(() => result.current.addPlayer('Ada' as PlayerName));

      expect(result.current.scoreboardState.players).toHaveLength(1);
      expect(result.current.scoreboardState.players[0]?.name).toBe('Ada');
    });

    test('gives each player their own id', () => {
      const { result } = renderHook(() => useYanivScoreboard());

      act(() => result.current.addPlayer('Ada' as PlayerName));
      act(() => result.current.addPlayer('Grace' as PlayerName));

      const [firstPlayer, secondPlayer] =
        result.current.scoreboardState.players;
      expect(firstPlayer?.id).not.toBe(secondPlayer?.id);
    });

    test('adds players in the order they were entered', () => {
      const { result } = renderHook(() => useYanivScoreboard());

      act(() => result.current.addPlayer('Ada' as PlayerName));
      act(() => result.current.addPlayer('Grace' as PlayerName));

      expect(
        result.current.scoreboardState.players.map((player) => player.name),
      ).toEqual(['Ada', 'Grace']);
    });

    test('scores zero for a player who joins part way through a game', () => {
      saveGame(savedGame);
      const { result } = renderHook(() => useYanivScoreboard());

      act(() => result.current.addPlayer('Katherine' as PlayerName));

      const newPlayerId = result.current.scoreboardState.players.at(-1)?.id;
      for (const round of result.current.scoreboardState.rounds) {
        expect(round.handTotals[newPlayerId as UserId]).toBe(0);
      }
    });

    test('keeps the scores already played when a player joins part way through', () => {
      saveGame(savedGame);
      const { result } = renderHook(() => useYanivScoreboard());

      act(() => result.current.addPlayer('Katherine' as PlayerName));

      expect(
        result.current.scoreboardState.rounds[0]?.handTotals,
      ).toMatchObject({
        [ADA_ID]: 3,
        [GRACE_ID]: 21,
        [ALAN_ID]: 14,
      });
    });

    test('renames a player', () => {
      saveGame(savedGame);
      const { result } = renderHook(() => useYanivScoreboard());

      act(() =>
        result.current.updatePlayerName(GRACE_ID, 'Hopper' as PlayerName),
      );

      expect(
        result.current.scoreboardState.players.map((player) => player.name),
      ).toEqual(['Ada', 'Hopper', 'Alan']);
    });

    test('removes a player', () => {
      saveGame(savedGame);
      const { result } = renderHook(() => useYanivScoreboard());

      act(() => result.current.removePlayer(GRACE_ID));

      expect(
        result.current.scoreboardState.players.map((player) => player.name),
      ).toEqual(['Ada', 'Alan']);
    });

    test('removes the scores of a player who has left the game', () => {
      saveGame(savedGame);
      const { result } = renderHook(() => useYanivScoreboard());

      act(() => result.current.removePlayer(GRACE_ID));

      for (const round of result.current.scoreboardState.rounds) {
        expect(round.handTotals).not.toHaveProperty(GRACE_ID);
      }
    });

    test('keeps the scores of the remaining players when one leaves', () => {
      saveGame(savedGame);
      const { result } = renderHook(() => useYanivScoreboard());

      act(() => result.current.removePlayer(GRACE_ID));

      expect(result.current.scoreboardState.rounds[0]?.handTotals).toEqual({
        [ADA_ID]: 3,
        [ALAN_ID]: 14,
      });
    });

    test('reorders the players', () => {
      saveGame(savedGame);
      const { result } = renderHook(() => useYanivScoreboard());

      act(() => result.current.reorderPlayers([ALAN_ID, ADA_ID, GRACE_ID]));

      expect(
        result.current.scoreboardState.players.map((player) => player.name),
      ).toEqual(['Alan', 'Ada', 'Grace']);
    });

    test('ignores an ordering that does not account for every player', () => {
      saveGame(savedGame);
      const { result } = renderHook(() => useYanivScoreboard());

      act(() => result.current.reorderPlayers([ALAN_ID, ADA_ID]));

      expect(
        result.current.scoreboardState.players.map((player) => player.name),
      ).toEqual(['Ada', 'Grace', 'Alan']);
    });

    test('ignores an ordering containing someone who is not playing', () => {
      saveGame(savedGame);
      const { result } = renderHook(() => useYanivScoreboard());

      act(() =>
        result.current.reorderPlayers([
          ALAN_ID,
          ADA_ID,
          crypto.randomUUID() as UserId,
        ]),
      );

      expect(
        result.current.scoreboardState.players.map((player) => player.name),
      ).toEqual(['Ada', 'Grace', 'Alan']);
    });
  });

  describe('scores', () => {
    test('updates a score for a player in a round', () => {
      saveGame(savedGame);
      const { result } = renderHook(() => useYanivScoreboard());

      act(() => result.current.updateRoundScore(FIRST_ROUND_ID, GRACE_ID, 12));

      expect(
        result.current.scoreboardState.rounds[0]?.handTotals[GRACE_ID],
      ).toBe(12);
    });

    test('leaves the other players in the round untouched', () => {
      saveGame(savedGame);
      const { result } = renderHook(() => useYanivScoreboard());

      act(() => result.current.updateRoundScore(FIRST_ROUND_ID, GRACE_ID, 12));

      expect(result.current.scoreboardState.rounds[0]?.handTotals).toEqual({
        [ADA_ID]: 3,
        [GRACE_ID]: 12,
        [ALAN_ID]: 14,
      });
    });

    test('leaves the other rounds untouched', () => {
      saveGame(savedGame);
      const { result } = renderHook(() => useYanivScoreboard());

      act(() => result.current.updateRoundScore(FIRST_ROUND_ID, GRACE_ID, 12));

      expect(result.current.scoreboardState.rounds[1]?.handTotals).toEqual(
        savedGame.rounds[1]?.handTotals,
      );
    });

    test('records a score for a player who had none in that round', () => {
      saveGame({
        ...savedGame,
        rounds: [{ id: FIRST_ROUND_ID, isComplete: true, handTotals: {} }],
      });
      const { result } = renderHook(() => useYanivScoreboard());

      act(() => result.current.updateRoundScore(FIRST_ROUND_ID, ADA_ID, 7));

      expect(result.current.scoreboardState.rounds[0]?.handTotals).toEqual({
        [ADA_ID]: 7,
      });
    });
  });

  describe('playing a round', () => {
    const gameInProgress: ScoreboardState = {
      players: savedGame.players,
      rounds: [
        {
          id: FIRST_ROUND_ID,
          isComplete: false,
          handTotals: { [ADA_ID]: 3, [GRACE_ID]: 21, [ALAN_ID]: 14 },
        },
      ],
    };

    test('opens the first round when the game starts', () => {
      const { result } = renderHook(() => useYanivScoreboard());

      act(() => result.current.addPlayer('Ada' as PlayerName));
      act(() => result.current.startGame());

      expect(result.current.scoreboardState.rounds).toHaveLength(1);
      expect(result.current.scoreboardState.rounds[0]?.isComplete).toBe(false);
    });

    test('leaves a game that has already started alone', () => {
      saveGame(gameInProgress);
      const { result } = renderHook(() => useYanivScoreboard());

      act(() => result.current.startGame());

      expect(result.current.scoreboardState.rounds).toEqual(
        gameInProgress.rounds,
      );
    });

    test('finishes the round being entered', () => {
      saveGame(gameInProgress);
      const { result } = renderHook(() => useYanivScoreboard());

      act(() => result.current.endRound());

      expect(result.current.scoreboardState.rounds[0]?.isComplete).toBe(true);
    });

    test('opens the next round once one ends', () => {
      saveGame(gameInProgress);
      const { result } = renderHook(() => useYanivScoreboard());

      act(() => result.current.endRound());

      expect(result.current.scoreboardState.rounds).toHaveLength(2);
      expect(result.current.scoreboardState.rounds[1]?.isComplete).toBe(false);
    });

    test('will not end a round while a player is missing a score', () => {
      saveGame({
        ...gameInProgress,
        rounds: [
          {
            id: FIRST_ROUND_ID,
            isComplete: false,
            handTotals: { [ADA_ID]: 3, [GRACE_ID]: 21 },
          },
        ],
      });
      const { result } = renderHook(() => useYanivScoreboard());

      act(() => result.current.endRound());

      expect(result.current.scoreboardState.rounds).toHaveLength(1);
      expect(result.current.scoreboardState.rounds[0]?.isComplete).toBe(false);
    });

    test('stops opening rounds once a player goes over a hundred', () => {
      saveGame({
        ...gameInProgress,
        rounds: [
          {
            id: FIRST_ROUND_ID,
            isComplete: false,
            handTotals: { [ADA_ID]: 3, [GRACE_ID]: 101, [ALAN_ID]: 14 },
          },
        ],
      });
      const { result } = renderHook(() => useYanivScoreboard());

      act(() => result.current.endRound());

      expect(result.current.scoreboardState.rounds).toHaveLength(1);
      expect(result.current.standings.isGameOver).toBe(true);
    });

    test('reports the running totals as rounds are played', () => {
      saveGame(gameInProgress);
      const { result } = renderHook(() => useYanivScoreboard());

      act(() => result.current.endRound());

      expect(result.current.standings.totals[GRACE_ID]?.total).toBe(21);
      expect(result.current.standings.totals[ADA_ID]?.total).toBe(3);
    });
  });

  describe('starting a new game', () => {
    test('clears the players and the rounds', () => {
      saveGame(savedGame);
      const { result } = renderHook(() => useYanivScoreboard());

      act(() => result.current.resetGame());

      expect(result.current.scoreboardState).toEqual({
        players: [],
        rounds: [],
      });
    });

    test('clears the saved game', () => {
      saveGame(savedGame);
      const { result } = renderHook(() => useYanivScoreboard());

      act(() => result.current.resetGame());

      expect(readSavedGame()).toEqual({ players: [], rounds: [] });
    });
  });

  describe('saved games', () => {
    test('picks up a game that was saved earlier', () => {
      saveGame(savedGame);

      const { result } = renderHook(() => useYanivScoreboard());

      expect(result.current.scoreboardState).toEqual(savedGame);
    });

    test('starts a new game when there is nothing saved', () => {
      const { result } = renderHook(() => useYanivScoreboard());

      expect(result.current.scoreboardState).toEqual({
        players: [],
        rounds: [],
      });
    });

    test('starts a new game when the saved game cannot be read', () => {
      localStorage.setItem(SCOREBOARD_STORAGE_KEY, 'not a saved game');

      const { result } = renderHook(() => useYanivScoreboard());

      expect(result.current.scoreboardState).toEqual({
        players: [],
        rounds: [],
      });
    });

    test('starts a new game when the saved game is no longer a shape we recognise', () => {
      localStorage.setItem(
        SCOREBOARD_STORAGE_KEY,
        JSON.stringify({ players: [{ id: ADA_ID }], rounds: [] }),
      );

      const { result } = renderHook(() => useYanivScoreboard());

      expect(result.current.scoreboardState).toEqual({
        players: [],
        rounds: [],
      });
    });

    test('saves the game as it is played', () => {
      saveGame(savedGame);
      const { result } = renderHook(() => useYanivScoreboard());

      act(() => result.current.updateRoundScore(FIRST_ROUND_ID, GRACE_ID, 12));

      expect(readSavedGame().rounds[0].handTotals[GRACE_ID]).toBe(12);
    });

    test('does not save an empty game while picking up the saved one', () => {
      saveGame(savedGame);
      const setItem = vi.spyOn(Storage.prototype, 'setItem');

      renderHook(() => useYanivScoreboard());

      expect(setItem.mock.calls.map(([, value]) => value)).not.toContain(
        JSON.stringify({ players: [], rounds: [] }),
      );
    });
  });
});
