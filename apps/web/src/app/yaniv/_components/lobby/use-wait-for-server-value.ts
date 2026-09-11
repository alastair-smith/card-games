import { useEffect, useRef } from 'react';

const SERVER_VALUE_TIMEOUT_MS = 5000;

/**
 * Returns a function that resolves once the server has broadcast the value
 * given to it, or after a timeout if it never does. Return that promise from a
 * mutation callback to hold the mutation pending until the change lands.
 *
 * @example
 * const waitForHandSize = useWaitForServerValue(handSize);
 *
 * api.yaniv.updateSettings.useMutation({
 *   onSuccess: (_data, variables) => waitForHandSize(variables.handSize),
 * });
 */
export function useWaitForServerValue<Value>(serverValue: Value) {
  const latestServerValue = useRef(serverValue);
  const waiting = useRef<{ value: Value; resolve: () => void }[]>([]);

  useEffect(() => {
    latestServerValue.current = serverValue;

    waiting.current = waiting.current.filter((waiter) => {
      if (waiter.value !== serverValue) {
        return true;
      }

      waiter.resolve();
      return false;
    });
  }, [serverValue]);

  return (value: Value) =>
    new Promise<void>((resolve) => {
      if (latestServerValue.current === value) {
        resolve();
        return;
      }

      const waiter = { value, resolve };
      waiting.current.push(waiter);

      setTimeout(() => {
        waiting.current = waiting.current.filter((other) => other !== waiter);
        resolve();
      }, SERVER_VALUE_TIMEOUT_MS);
    });
}
