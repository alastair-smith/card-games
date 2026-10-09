const withTimeout = async <T>(
  task: () => Promise<T>,
  key: string,
  timeoutMs: number,
): Promise<T> => {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(
      () => reject(new Error(`Lock on ${key} timed out after ${timeoutMs}ms`)),
      timeoutMs,
    );
  });

  try {
    return await Promise.race([task(), timeout]);
  } finally {
    clearTimeout(timer);
  }
};

/**
 * Runs tasks sharing a key one at a time, in the order they were requested.
 *
 * A task still running after the timeout is rejected and releases the key, so
 * one hung task can't block every later task for that key.
 */
export const createKeyLock = ({ timeoutMs }: { timeoutMs: number }) => {
  const queueTails = new Map<string, Promise<void>>();

  return async <T>(key: string, task: () => Promise<T>): Promise<T> => {
    const previousTail = queueTails.get(key) ?? Promise.resolve();
    const result = previousTail.then(() => withTimeout(task, key, timeoutMs));
    const tail = result.then(
      () => undefined,
      () => undefined,
    );
    queueTails.set(key, tail);

    try {
      return await result;
    } finally {
      if (queueTails.get(key) === tail) queueTails.delete(key);
    }
  };
};
