import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { createCircuitBreaker } from './circuit-breaker';

vi.mock('~/utils/logger', () => ({
  logger: { info: vi.fn(), error: vi.fn() },
}));

import { logger } from '~/utils/logger';

const FAILURE_THRESHOLD = 3;
const RESET_TIMEOUT_MS = 10_000;

function makeBreaker() {
  return createCircuitBreaker({
    name: 'Test',
    failureThreshold: FAILURE_THRESHOLD,
    resetTimeoutMs: RESET_TIMEOUT_MS,
  });
}

beforeEach(() => {
  vi.useFakeTimers();
  vi.mocked(logger.info).mockClear();
  vi.mocked(logger.error).mockClear();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('initial state', () => {
  test('starts closed', () => {
    expect(makeBreaker().isOpen()).toBe(false);
  });
});

describe('opening the circuit', () => {
  test('stays closed below the failure threshold', () => {
    const breaker = makeBreaker();
    for (let i = 0; i < FAILURE_THRESHOLD - 1; i++) breaker.onFailure();
    expect(breaker.isOpen()).toBe(false);
  });

  test('opens after reaching the failure threshold', () => {
    const breaker = makeBreaker();
    for (let i = 0; i < FAILURE_THRESHOLD; i++) breaker.onFailure();
    expect(breaker.isOpen()).toBe(true);
  });

  test('logs an error when the circuit opens', () => {
    const breaker = makeBreaker();
    for (let i = 0; i < FAILURE_THRESHOLD; i++) breaker.onFailure();
    expect(logger.error).toHaveBeenCalledOnce();
  });

  test('does not log again for subsequent failures while open', () => {
    const breaker = makeBreaker();
    for (let i = 0; i < FAILURE_THRESHOLD + 2; i++) breaker.onFailure();
    expect(logger.error).toHaveBeenCalledOnce();
  });
});

describe('reset timeout', () => {
  test('remains open before the timeout elapses', () => {
    const breaker = makeBreaker();
    for (let i = 0; i < FAILURE_THRESHOLD; i++) breaker.onFailure();
    vi.advanceTimersByTime(RESET_TIMEOUT_MS - 1);
    expect(breaker.isOpen()).toBe(true);
  });

  test('allows a probe request after the timeout elapses', () => {
    const breaker = makeBreaker();
    for (let i = 0; i < FAILURE_THRESHOLD; i++) breaker.onFailure();
    vi.advanceTimersByTime(RESET_TIMEOUT_MS);
    expect(breaker.isOpen()).toBe(false);
  });
});

describe('recovery (half-open)', () => {
  function openThenWait() {
    const breaker = makeBreaker();
    for (let i = 0; i < FAILURE_THRESHOLD; i++) breaker.onFailure();
    vi.advanceTimersByTime(RESET_TIMEOUT_MS);
    breaker.isOpen(); // transitions to half-open
    return breaker;
  }

  test('closes the circuit when the probe succeeds', () => {
    const breaker = openThenWait();
    breaker.onSuccess();
    expect(breaker.isOpen()).toBe(false);
  });

  test('logs recovery when the circuit closes', () => {
    const breaker = openThenWait();
    breaker.onSuccess();
    expect(logger.info).toHaveBeenCalledOnce();
  });

  test('re-opens the circuit when the probe fails', () => {
    const breaker = openThenWait();
    breaker.onFailure();
    expect(breaker.isOpen()).toBe(true);
  });

  test('logs an error when re-opening after a failed probe', () => {
    const breaker = openThenWait();
    vi.mocked(logger.error).mockClear();
    breaker.onFailure();
    expect(logger.error).toHaveBeenCalledOnce();
  });
});

describe('success resets failure count', () => {
  test('does not open after failures followed by a success then more failures', () => {
    const breaker = makeBreaker();
    for (let i = 0; i < FAILURE_THRESHOLD - 1; i++) breaker.onFailure();
    breaker.onSuccess();
    for (let i = 0; i < FAILURE_THRESHOLD - 1; i++) breaker.onFailure();
    expect(breaker.isOpen()).toBe(false);
  });

  test('does not log recovery when success happens while already closed', () => {
    const breaker = makeBreaker();
    breaker.onSuccess();
    expect(logger.info).not.toHaveBeenCalled();
  });
});
