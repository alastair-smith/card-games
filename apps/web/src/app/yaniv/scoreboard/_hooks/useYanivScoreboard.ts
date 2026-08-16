import { useCallback, useEffect, useMemo, useState } from 'react';
import { z } from 'zod';
import type { Branded } from '~/types/brand';
import {
  type PlayerName,
  playerNameSchema,
  type UserId,
  userIdSchema,
} from '~/types/entities';
import { deriveGameSummary } from '../_libs/derive-game-summary';

export type RoundId = Branded<string, 'RoundId'>;

export const roundIdSchema = z.uuid().transform((value) => value as RoundId);

export const scoreboardPlayerSchema = z.object({
  id: userIdSchema,
  name: playerNameSchema,
});

export type ScoreboardPlayer = z.infer<typeof scoreboardPlayerSchema>;

export const scoreboardRoundSchema = z.object({
  id: roundIdSchema,
  /** False while the round is still being entered. */
  isComplete: z.boolean(),
  handTotals: z.record(userIdSchema, z.number()),
});

export type ScoreboardRound = z.infer<typeof scoreboardRoundSchema>;

export const scoreboardStateSchema = z.object({
  players: z.array(scoreboardPlayerSchema),
  rounds: z.array(scoreboardRoundSchema),
});

export type ScoreboardState = z.infer<typeof scoreboardStateSchema>;

export const SCOREBOARD_STORAGE_KEY = 'yaniv-scoreboard-v1';

const initialState: ScoreboardState = {
  players: [],
  rounds: [],
};

const openRound = (): ScoreboardRound => ({
  id: crypto.randomUUID() as RoundId,
  isComplete: false,
  handTotals: {},
});

const loadScoreboardState = (): ScoreboardState | null => {
  if (typeof window === 'undefined') return null;

  const stored = window.localStorage.getItem(SCOREBOARD_STORAGE_KEY);
  if (!stored) return null;

  try {
    const parsed = scoreboardStateSchema.safeParse(JSON.parse(stored));

    // A game saved by an older version of the app is discarded rather than crashing the page.
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
};

const saveScoreboardState = (state: ScoreboardState): void => {
  if (typeof window === 'undefined') return;

  try {
    window.localStorage.setItem(SCOREBOARD_STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Storage can be unavailable or full — the game carries on without a backup.
  }
};

export default function useYanivScoreboard() {
  const [scoreboardState, setScoreboardState] =
    useState<ScoreboardState>(initialState);
  const [isRestored, setIsRestored] = useState(false);

  useEffect(() => {
    const stored = loadScoreboardState();
    if (stored) setScoreboardState(stored);
    setIsRestored(true);
  }, []);

  useEffect(() => {
    // On mount this runs alongside the restore above, while the state is still
    // the empty new game. Saving that would wipe the game we are about to load,
    // so nothing is written until the restore has had its turn.
    if (!isRestored) return;

    saveScoreboardState(scoreboardState);
  }, [isRestored, scoreboardState]);

  const addPlayer = useCallback((name: PlayerName) => {
    setScoreboardState((current) => {
      const playerId = crypto.randomUUID() as UserId;

      return {
        ...current,
        players: [...current.players, { id: playerId, name }],
        // Someone joining mid-game starts level with everyone else, so the
        // rounds played before they sat down score zero rather than nothing.
        rounds: current.rounds.map((round) => ({
          ...round,
          handTotals: { ...round.handTotals, [playerId]: 0 },
        })),
      };
    });
  }, []);

  const updatePlayerName = useCallback((playerId: UserId, name: PlayerName) => {
    setScoreboardState((current) => ({
      ...current,
      players: current.players.map((player) =>
        player.id === playerId ? { ...player, name } : player,
      ),
    }));
  }, []);

  const removePlayer = useCallback((playerId: UserId) => {
    setScoreboardState((current) => ({
      ...current,
      players: current.players.filter((player) => player.id !== playerId),
      rounds: current.rounds.map((round) => {
        const { [playerId]: removedHandTotal, ...handTotals } =
          round.handTotals;
        return { ...round, handTotals };
      }),
    }));
  }, []);

  const reorderPlayers = useCallback((newPlayerIds: string[]) => {
    setScoreboardState((current) => {
      const reorderedPlayers = newPlayerIds
        .map((playerId) =>
          current.players.find((player) => player.id === playerId),
        )
        .filter((player) => player !== undefined);

      // Guards against an ordering that no longer matches the players, which
      // would otherwise silently drop someone from the game.
      if (reorderedPlayers.length !== current.players.length) return current;

      return { ...current, players: reorderedPlayers };
    });
  }, []);

  const updateRoundScore = useCallback(
    (roundId: RoundId, playerId: UserId, handTotal: number) => {
      setScoreboardState((current) => ({
        ...current,
        rounds: current.rounds.map((round) =>
          round.id === roundId
            ? {
                ...round,
                handTotals: { ...round.handTotals, [playerId]: handTotal },
              }
            : round,
        ),
      }));
    },
    [],
  );

  const startGame = useCallback(() => {
    setScoreboardState((current) =>
      current.rounds.length > 0
        ? current
        : { ...current, rounds: [openRound()] },
    );
  }, []);

  const endRound = useCallback(() => {
    setScoreboardState((current) => {
      const roundInProgress = current.rounds.at(-1);

      if (!roundInProgress || roundInProgress.isComplete) return current;

      const isEveryScoreEntered = current.players.every(
        (player) => roundInProgress.handTotals[player.id] !== undefined,
      );

      if (!isEveryScoreEntered) return current;

      const rounds = [
        ...current.rounds.slice(0, -1),
        { ...roundInProgress, isComplete: true },
      ];

      // A new round is only opened while the game is still live; whether it is
      // live comes from replaying the scores, never from a stored flag, so
      // correcting an earlier round can bring the game back.
      const { isGameOver } = deriveGameSummary({ ...current, rounds });

      return {
        ...current,
        rounds: isGameOver ? rounds : [...rounds, openRound()],
      };
    });
  }, []);

  const resetGame = useCallback(() => {
    setScoreboardState(initialState);
  }, []);

  const gameSummary = useMemo(
    () => deriveGameSummary(scoreboardState),
    [scoreboardState],
  );

  return {
    scoreboardState,
    gameSummary,
    startGame,
    endRound,
    addPlayer,
    updatePlayerName,
    removePlayer,
    reorderPlayers,
    updateRoundScore,
    resetGame,
  };
}
