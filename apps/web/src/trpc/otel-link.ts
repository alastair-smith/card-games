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
// is called. We store the mutation context here and apply it explicitly at
// the fetch call site via mutationFetch, which is passed as httpLink's fetch
// option. This is safe because JS is single-threaded and mutations are
// unbatched (one fetch per mutation).
let pendingMutationContext: Context | null = null;

export function mutationFetch(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<Response> {
  if (pendingMutationContext) {
    return context.with(pendingMutationContext, () => fetch(input, init));
  }
  return fetch(input, init);
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

        if (op.type === 'mutation') {
          pendingMutationContext = trace.setSpan(context.active(), span);
        }

        return context.with(trace.setSpan(context.active(), span), () =>
          next(op).subscribe({
            next(value) {
              observer.next(value);
            },
            error(err) {
              if (op.type === 'mutation') pendingMutationContext = null;
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
              if (op.type === 'mutation') pendingMutationContext = null;
              span.end();
              observer.complete();
            },
          }),
        );
      });
    };
}
