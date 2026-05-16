import { logger } from './logger';

type CircuitBreakerOptions = {
  failureThreshold: number;
  resetTimeoutMs: number;
  name: string;
};

type CircuitState = 'closed' | 'open' | 'half-open';

export type CircuitBreaker = {
  isOpen: () => boolean;
  onSuccess: () => void;
  onFailure: () => void;
};

export function createCircuitBreaker({
  failureThreshold,
  resetTimeoutMs,
  name,
}: CircuitBreakerOptions): CircuitBreaker {
  let state: CircuitState = 'closed';
  let consecutiveFailures = 0;
  let openedAt = 0;

  return {
    isOpen() {
      if (state === 'closed') return false;

      if (state === 'open') {
        if (Date.now() - openedAt >= resetTimeoutMs) {
          state = 'half-open';
          return false;
        }
        return true;
      }

      return false; // half-open: allow one probe request through
    },

    onSuccess() {
      consecutiveFailures = 0;
      if (state !== 'closed') {
        logger.info(`${name} circuit breaker closed — service recovered`);
      }
      state = 'closed';
    },

    onFailure() {
      consecutiveFailures++;

      if (consecutiveFailures >= failureThreshold && state === 'closed') {
        state = 'open';
        openedAt = Date.now();
        logger.error(
          `${name} circuit breaker opened after ${consecutiveFailures} consecutive failures — pausing for ${resetTimeoutMs / 1000}s`,
        );
      } else if (state === 'half-open') {
        state = 'open';
        openedAt = Date.now();
        logger.error(
          `${name} circuit breaker re-opened — service still unhealthy`,
        );
      }
    },
  };
}
