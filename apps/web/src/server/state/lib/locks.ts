import type { GameCode } from '~/types/game';
import { createKeyLock } from './key-lock';

export type LockNamespace = 'lobby' | 'yaniv';

const LOCK_TIMEOUT_MS = 10_000;

const keyLock = createKeyLock({ timeoutMs: LOCK_TIMEOUT_MS });

/**
 * Serialises operations on a game's stored state so concurrent changes are not lost.
 *
 * Nested locks are not supported.
 */
export const withLock = async <T>(
  namespace: LockNamespace,
  code: GameCode,
  task: () => Promise<T>,
): Promise<T> => keyLock(`${namespace}:${code}`, task);
