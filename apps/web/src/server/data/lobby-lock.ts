import type { GameCode } from '~/types/game';
import { createKeyLock } from './key-lock';

const withKeyLock = createKeyLock();

/** Serialises read-modify-write updates to a lobby so concurrent changes are not lost. */
export const withLobbyLock = <T>(code: GameCode, task: () => Promise<T>) =>
  withKeyLock(code, task);
