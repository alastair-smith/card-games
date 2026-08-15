import { metrics } from '@opentelemetry/api';
import {
  AggregationTemporality,
  InMemoryMetricExporter,
  MeterProvider,
  PeriodicExportingMetricReader,
} from '@opentelemetry/sdk-metrics';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { GameType } from '~/types/game';
import { sumListenersByEventType } from './metrics';

type RecordedPoint = { value: number; attributes: Record<string, unknown> };

/**
 * Instruments in the metrics module are created lazily, so the module must be
 * imported fresh once a meter provider is registered — importing it earlier
 * would bind it to a no-op meter that never emits.
 */
async function collectMetrics(
  record: (module: typeof import('./metrics')) => void,
): Promise<Map<string, RecordedPoint[]>> {
  const exporter = new InMemoryMetricExporter(AggregationTemporality.DELTA);
  const reader = new PeriodicExportingMetricReader({
    exporter,
    exportIntervalMillis: 60_000,
  });
  const provider = new MeterProvider({ readers: [reader] });
  metrics.setGlobalMeterProvider(provider);

  vi.resetModules();
  record(await import('./metrics'));

  await provider.forceFlush();

  const pointsByName = new Map<string, RecordedPoint[]>();
  for (const batch of exporter.getMetrics()) {
    for (const scope of batch.scopeMetrics) {
      for (const metric of scope.metrics) {
        const points = metric.dataPoints.map((point) => ({
          value: Number(point.value),
          attributes: point.attributes as Record<string, unknown>,
        }));
        pointsByName.set(metric.descriptor.name, points);
      }
    }
  }

  await provider.shutdown();
  return pointsByName;
}

afterEach(() => {
  metrics.disable();
});

describe('summing listeners by event type', () => {
  it('groups listeners for the same game type across game codes', () => {
    const counts = sumListenersByEventType({
      'yaniv:ABC123': 2,
      'yaniv:DEF456': 3,
    });

    expect(counts.get('yaniv')).toBe(5);
  });

  it('keeps different game types apart', () => {
    const counts = sumListenersByEventType({
      'yaniv:ABC123': 2,
      'lobby:ABC123': 1,
      'high-card:DEF456': 4,
    });

    expect(counts.get('yaniv')).toBe(2);
    expect(counts.get('lobby')).toBe(1);
    expect(counts.get('high-card')).toBe(4);
  });

  it('does not report a game code as its own series', () => {
    const counts = sumListenersByEventType({ 'yaniv:ABC123': 2 });

    expect([...counts.keys()]).toEqual(['yaniv']);
  });

  it('groups event names that have no game code', () => {
    const counts = sumListenersByEventType({ standalone: 3 });

    expect(counts.get('standalone')).toBe(3);
  });

  it('returns nothing when there are no listeners', () => {
    expect(sumListenersByEventType({}).size).toBe(0);
  });
});

describe('recording game metrics', () => {
  it('records a started game with its type and player count', async () => {
    const recorded = await collectMetrics(({ recordGameStarted }) => {
      recordGameStarted(GameType.YANIV, 4);
    });

    expect(recorded.get('game.started')).toEqual([
      { value: 1, attributes: { 'game.type': 'YANIV', 'player.count': 4 } },
    ]);
  });

  it('records a completed game with its type and player count', async () => {
    const recorded = await collectMetrics(({ recordGameCompleted }) => {
      recordGameCompleted(GameType.HIGH_CARD, 2);
    });

    expect(recorded.get('game.completed')).toEqual([
      { value: 1, attributes: { 'game.type': 'HIGH_CARD', 'player.count': 2 } },
    ]);
  });

  it('records each player join without any player identifier', async () => {
    const recorded = await collectMetrics(({ recordPlayerJoined }) => {
      recordPlayerJoined(GameType.YANIV);
      recordPlayerJoined(GameType.YANIV);
    });

    expect(recorded.get('game.player.joined')).toEqual([
      { value: 2, attributes: { 'game.type': 'YANIV' } },
    ]);
  });

  it('keeps games of different sizes as separate series', async () => {
    const recorded = await collectMetrics(({ recordGameStarted }) => {
      recordGameStarted(GameType.YANIV, 3);
      recordGameStarted(GameType.YANIV, 5);
    });

    expect(recorded.get('game.started')).toHaveLength(2);
  });

  it('observes listener counts grouped by event type', async () => {
    const recorded = await collectMetrics(({ registerEventListenerGauge }) => {
      registerEventListenerGauge(() => ({
        'yaniv:ABC123': 2,
        'yaniv:DEF456': 3,
        'lobby:ABC123': 1,
      }));
    });

    expect(recorded.get('game.event_listeners')).toEqual([
      { value: 5, attributes: { 'event.type': 'yaniv' } },
      { value: 1, attributes: { 'event.type': 'lobby' } },
    ]);
  });
});
