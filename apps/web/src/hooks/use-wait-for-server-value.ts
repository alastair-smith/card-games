import { useEffect, useRef } from 'react';

const SERVER_VALUE_TIMEOUT_MS = 5000;

/**
 * Returns a function that resolves once the server has broadcast the value
 * given to it, or after a timeout if it never does. Return that promise from a
 * mutation callback to hold the mutation pending until the change lands.
 *
 * Pass `isMatch` to wait for something other than an identical value, such as
 * a change to one field of an object.
 *
 * @example
 * const waitForIsReady = useWaitForServerValue(isReady);
 *
 * api.lobby.updatePlayer.useMutation({
 *   onSuccess: (_data, variables) =>
 *     variables.field === 'isReady'
 *       ? waitForIsReady(variables.isReady)
 *       : undefined,
 * });
 */
export function useWaitForServerValue<ServerValue, Value = ServerValue>(
  serverValue: ServerValue,
  isMatch: (serverValue: ServerValue, value: Value) => boolean = Object.is,
) {
  const latestServerValue = useRef(serverValue);
  const waiting = useRef<{ value: Value; resolve: () => void }[]>([]);

  useEffect(() => {
    latestServerValue.current = serverValue;

    waiting.current = waiting.current.filter((waiter) => {
      if (!isMatch(serverValue, waiter.value)) {
        return true;
      }

      waiter.resolve();
      return false;
    });
  }, [serverValue, isMatch]);

  return (value: Value) =>
    new Promise<void>((resolve) => {
      if (isMatch(latestServerValue.current, value)) {
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
