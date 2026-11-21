type MutationKey = [path: string[]];

export type StubMutationOptions = {
  mutationKey: MutationKey;
  [option: string]: unknown;
};

/**
 * Stands in for `useTRPC()`: each procedure's `mutationOptions` returns the
 * options it's given with the procedure's mutation key added, so a mocked
 * `useMutation` can tell the procedures apart with `procedurePath`.
 */
export function createTRPCStub(path: string[] = []): unknown {
  return new Proxy(
    {},
    {
      get: (_target, property) => {
        if (property === 'mutationKey') {
          return (): MutationKey => [path];
        }
        if (property === 'mutationOptions') {
          return (options: object = {}): StubMutationOptions => ({
            ...options,
            mutationKey: [path],
          });
        }
        return createTRPCStub([...path, String(property)]);
      },
    },
  );
}

export const procedurePath = (options: StubMutationOptions) =>
  options.mutationKey[0].join('.');
