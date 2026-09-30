/** Runs tasks sharing a key one at a time, in the order they were requested. */
export const createKeyLock = () => {
  const queueTails = new Map<string, Promise<void>>();

  return async <T>(key: string, task: () => Promise<T>): Promise<T> => {
    const previousTail = queueTails.get(key) ?? Promise.resolve();
    const result = previousTail.then(task);
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
