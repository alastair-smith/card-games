import {
  type Context,
  context,
  SpanStatusCode,
  trace,
} from '@opentelemetry/api';
import type { TRPCLink } from '@trpc/client';
import type { AnyRouter } from '@trpc/server';
import { observable } from '@trpc/server/observable';

// Zone.js does not intercept native async/await microtasks (V8), so
// context.with() in the link's subscribe callback does not survive the
// `await opts.headers()` inside tRPC's fetchHTTPResponse before fetch()
// is called. We store pending mutation contexts here and apply them at the
// fetch call site via createMutationFetch, passed as httpLink's fetch option.
//
// A per-path FIFO queue is used rather than a single global so that mutations
// to different procedures never interfere. Concurrent mutations to the *same*
// procedure are handled in FIFO order, which is correct as long as their
// fetch() calls fire in dispatch order (guaranteed when opts.headers() is
// synchronous, which is the default).
const pendingMutationContexts = new Map<string, Context[]>();

// tRPC passes `signal: undefined` when there's no signal, which RequestInit
// doesn't allow.
type MutationRequestInit = Omit<RequestInit, 'signal'> & {
  signal?: AbortSignal | null | undefined;
};

export function createMutationFetch(
  trpcUrl: string,
): (input: RequestInfo | URL, init?: MutationRequestInit) => Promise<Response> {
  const trpcPathPrefix = `${new URL(trpcUrl).pathname}/`;
  return (input, mutationInit) => {
    const init = { ...mutationInit, signal: mutationInit?.signal ?? null };
    const href =
      input instanceof URL
        ? input.href
        : typeof input === 'string'
          ? input
          : input.url;
    const procedurePath = href.split(trpcPathPrefix)[1]?.split('?')[0];
    const queue = procedurePath
      ? pendingMutationContexts.get(procedurePath)
      : undefined;
    const ctx = queue?.shift();
    if (queue?.length === 0 && procedurePath)
      pendingMutationContexts.delete(procedurePath);

    if (ctx) {
      return context.with(ctx, () => fetch(input, init));
    }
    return fetch(input, init);
  };
}

export function otelLink<TRouter extends AnyRouter>(): TRPCLink<TRouter> {
  return () =>
    ({ next, op }) => {
      if (op.type === 'subscription') {
        return next(op);
      }

      return observable((observer) => {
        const span = trace
          .getTracer('card-games-web')
          .startSpan(`trpc.${op.type} ${op.path}`, {
            attributes: {
              'trpc.type': op.type,
              'trpc.path': op.path,
            },
          });

        let mutationCtx: Context | null = null;
        if (op.type === 'mutation') {
          mutationCtx = trace.setSpan(context.active(), span);
          const queue = pendingMutationContexts.get(op.path) ?? [];
          queue.push(mutationCtx);
          pendingMutationContexts.set(op.path, queue);
        }

        const cleanupMutationCtx = () => {
          if (!mutationCtx) return;
          // Remove this context if the custom fetch didn't consume it (e.g. the
          // request was aborted before fetch() fired).
          const queue = pendingMutationContexts.get(op.path);
          if (!queue) return;
          const idx = queue.indexOf(mutationCtx);
          if (idx !== -1) queue.splice(idx, 1);
          if (queue.length === 0) pendingMutationContexts.delete(op.path);
        };

        return context.with(trace.setSpan(context.active(), span), () =>
          next(op).subscribe({
            next(value) {
              observer.next(value);
            },
            error(err) {
              cleanupMutationCtx();
              const error = err instanceof Error ? err : new Error(String(err));
              span.recordException(error);
              span.setStatus({
                code: SpanStatusCode.ERROR,
                message: error.message,
              });
              span.end();
              observer.error(err);
            },
            complete() {
              cleanupMutationCtx();
              span.end();
              observer.complete();
            },
          }),
        );
      });
    };
}
