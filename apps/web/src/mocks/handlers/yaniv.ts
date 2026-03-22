import type { ServerSentEventResolverExtras } from 'msw';
import { HttpResponse, http, sse } from 'msw';
import SuperJSON from 'superjson';
import {
  gameOverScenario,
  highHandScenario,
  inProgressScenario,
  lobbyScenario,
  pickupScenario,
  pickupStepScenario,
  proceedScenario,
  roundSummaryScenario,
  type StateSubscription,
  waitingForOpponentScenario,
} from '../scenarios';

type SseEventMap = { message: unknown; connected: unknown };
type SseClient = ServerSentEventResolverExtras<
  SseEventMap,
  Record<string, string>
>['client'];

// Per-game-code SSE client references — mutation handlers push events here
export const activeClients = new Map<string, SseClient>();

function sendEvent(client: SseClient, data: StateSubscription): void {
  client.send({ data: JSON.stringify(SuperJSON.serialize(data)) });
}

function pushToCode(code: string, data: StateSubscription): void {
  const client = activeClients.get(code);
  if (client) sendEvent(client, data);
}

function getInitialState(code: string): StateSubscription {
  switch (code) {
    case 'LBBY11':
      return lobbyScenario();
    case 'GAME11':
      return inProgressScenario();
    case 'PRCD11':
      return proceedScenario();
    case 'HIHN11':
      return highHandScenario();
    case 'RNDS11':
      return roundSummaryScenario();
    case 'GVER11':
      return gameOverScenario();
    default:
      return { update: 'GAME_NOT_FOUND' } as StateSubscription;
  }
}

function mutationOk() {
  return HttpResponse.json([{ result: { data: { json: null } } }]);
}

export function getYanivHandlers() {
  return [
    // SSE subscription — MSW sse() intercepts EventSource connections in Chromium
    sse<SseEventMap>('/api/trpc/yaniv.state', ({ client, request }) => {
      const url = new URL(request.url);
      const inputParam = url.searchParams.get('input');
      // httpSubscriptionLink sends input as {"json":{"code":"..."}} directly (no batch wrapping)
      const input = inputParam
        ? (JSON.parse(inputParam) as { json: { code: string } })
        : null;
      const code = input?.json?.code ?? 'UNKNOWN';

      activeClients.set(code, client);

      // tRPC sseStreamConsumer waits for the 'connected' event before yielding data
      client.send({ event: 'connected', data: '{}' });
      sendEvent(client, getInitialState(code));
    }),

    http.post('/api/trpc/yaniv.startGame', async ({ request }) => {
      const body = (await request.json()) as Record<
        string,
        { json: { code: string } }
      >;
      const code = body['0']?.json?.code;
      if (code) pushToCode(code, inProgressScenario());
      return mutationOk();
    }),

    http.post('/api/trpc/yaniv.playCards', async ({ request }) => {
      const body = (await request.json()) as Record<
        string,
        { json: { code: string } }
      >;
      const code = body['0']?.json?.code;
      if (code) pushToCode(code, pickupStepScenario());
      return mutationOk();
    }),

    http.post('/api/trpc/yaniv.pickupCard', async ({ request }) => {
      const body = (await request.json()) as Record<
        string,
        { json: { code: string } }
      >;
      const code = body['0']?.json?.code;
      if (code) pushToCode(code, pickupScenario());
      return mutationOk();
    }),

    http.post('/api/trpc/yaniv.callYaniv', async ({ request }) => {
      const body = (await request.json()) as Record<
        string,
        { json: { code: string } }
      >;
      const code = body['0']?.json?.code;
      if (code) pushToCode(code, roundSummaryScenario());
      return mutationOk();
    }),

    http.post('/api/trpc/yaniv.startNewRound', async ({ request }) => {
      const body = (await request.json()) as Record<
        string,
        { json: { code: string } }
      >;
      const code = body['0']?.json?.code;
      if (code) pushToCode(code, inProgressScenario());
      return mutationOk();
    }),

    http.post('/api/trpc/yaniv.endTurn', async ({ request }) => {
      const body = (await request.json()) as Record<
        string,
        { json: { code: string } }
      >;
      const code = body['0']?.json?.code;
      if (code) pushToCode(code, waitingForOpponentScenario());
      return mutationOk();
    }),

    http.post('/api/trpc/yaniv.triggerEmoji', () => mutationOk()),
  ];
}
