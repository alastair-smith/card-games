import { type Counter, metrics } from '@opentelemetry/api';
import type { GameType } from '~/types/game';
import { readListenerCounts } from './listener-counts';

const METER_NAME = 'card-games-metrics';

export const GAME_TYPE_ATTR = 'game.type';
export const PLAYER_COUNT_ATTR = 'player.count';
export const EVENT_TYPE_ATTR = 'event.type';

type GameCounters = {
  gamesStarted: Counter;
  gamesCompleted: Counter;
  playersJoined: Counter;
};

let gameCounters: GameCounters | undefined;

/**
 * Instruments are created on first use rather than at module load. The global
 * meter provider is only registered once the SDK starts, and a meter obtained
 * before then is a no-op that never becomes live.
 */
function getGameCounters(): GameCounters {
  if (!gameCounters) {
    const meter = metrics.getMeter(METER_NAME);

    gameCounters = {
      gamesStarted: meter.createCounter('game.started', {
        description: 'Games moved from lobby into play',
      }),
      gamesCompleted: meter.createCounter('game.completed', {
        description: 'Games played through to a result',
      }),
      playersJoined: meter.createCounter('game.player.joined', {
        description: 'Players joining a lobby, counted once per join',
      }),
    };
  }

  return gameCounters;
}

export function recordGameStarted(gameType: GameType, playerCount: number) {
  getGameCounters().gamesStarted.add(1, {
    [GAME_TYPE_ATTR]: gameType,
    [PLAYER_COUNT_ATTR]: playerCount,
  });
}

export function recordGameCompleted(gameType: GameType, playerCount: number) {
  getGameCounters().gamesCompleted.add(1, {
    [GAME_TYPE_ATTR]: gameType,
    [PLAYER_COUNT_ATTR]: playerCount,
  });
}

export function recordPlayerJoined(gameType: GameType) {
  getGameCounters().playersJoined.add(1, { [GAME_TYPE_ATTR]: gameType });
}

/**
 * Event names are `${type}:${gameCode}`, so counts are grouped by type before
 * being observed — reporting per game code would make the series unbounded.
 */
export function sumListenersByEventType(
  listenerCounts: Record<string, number>,
): Map<string, number> {
  const countsByType = new Map<string, number>();

  for (const [eventName, count] of Object.entries(listenerCounts)) {
    const [prefix] = eventName.split(':');
    // `split` always yields at least one element, but it can be empty.
    const eventType = prefix || 'unknown';
    countsByType.set(eventType, (countsByType.get(eventType) ?? 0) + count);
  }

  return countsByType;
}

let isEventListenerGaugeRegistered = false;

/**
 * Counts are read through the global registry rather than from an emitter
 * imported here — see `listener-counts.ts` for why the layers cannot share a
 * module instance.
 */
export function registerEventListenerGauge() {
  // Registering twice would observe every event type twice per collection,
  // which dev-server restarts of the instrumentation hook would otherwise do.
  if (isEventListenerGaugeRegistered) return;
  isEventListenerGaugeRegistered = true;

  const gauge = metrics
    .getMeter(METER_NAME)
    .createObservableGauge('game.event_listeners', {
      description: 'Active game event listeners on this instance',
    });

  gauge.addCallback((observableResult) => {
    for (const [eventType, count] of sumListenersByEventType(
      readListenerCounts(),
    )) {
      observableResult.observe(count, { [EVENT_TYPE_ATTR]: eventType });
    }
  });
}
