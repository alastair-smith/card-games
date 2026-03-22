import { http, HttpResponse } from 'msw';
import SuperJSON from 'superjson';
import {
  gameOverScenario,
  inProgressScenario,
  lobbyScenario,
  pickupScenario,
  pickupStepScenario,
  roundSummaryScenario,
  type StateSubscription,
  waitingForOpponentScenario,
} from '../scenarios';

type StreamState = {
  controller: ReadableStreamDefaultController<Uint8Array>;
  eventId: number;
};

export const activeStreams = new Map<string, StreamState>();

function sseEvent(streamState: StreamState, data: unknown): string {
  const payload = SuperJSON.serialize(data);
  const envelope = { id: null, result: { type: 'data', data: payload } };
  const line = `id: ${streamState.eventId}\ndata: ${JSON.stringify(envelope)}\n\n`;
  streamState.eventId += 1;
  return line;
}

function pushEvent(code: string, data: StateSubscription): void {
  const streamState = activeStreams.get(code);
  if (!streamState) return;
  const encoder = new TextEncoder();
  streamState.controller.enqueue(
    encoder.encode(sseEvent(streamState, data)),
  );
}

function getInitialState(code: string): StateSubscription {
  switch (code) {
    case 'LOBBY1':
      return lobbyScenario();
    case 'GAME01':
      return inProgressScenario();
    case 'ROUND1':
      return roundSummaryScenario();
    case 'GOVER1':
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
    http.get('/api/trpc/yaniv.state', ({ request }) => {
      const url = new URL(request.url);
      const inputParam = url.searchParams.get('input');
      const input = inputParam ? (JSON.parse(inputParam) as Record<string, { json: { code: string } }>) : {};
      const code = input['0']?.json?.code ?? 'UNKNOWN';

      const encoder = new TextEncoder();

      const stream = new ReadableStream<Uint8Array>({
        start(controller) {
          const streamState: StreamState = { controller, eventId: 0 };
          activeStreams.set(code, streamState);
          controller.enqueue(
            encoder.encode(sseEvent(streamState, getInitialState(code))),
          );
        },
        cancel() {
          activeStreams.delete(code);
        },
      });

      return new HttpResponse(stream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          Connection: 'keep-alive',
        },
      });
    }),

    http.post('/api/trpc/yaniv.startGame', async ({ request }) => {
      const body = (await request.json()) as Record<string, { json: { code: string } }>;
      const code = body['0']?.json?.code;
      if (code) pushEvent(code, inProgressScenario());
      return mutationOk();
    }),

    http.post('/api/trpc/yaniv.playCards', async ({ request }) => {
      const body = (await request.json()) as Record<string, { json: { code: string } }>;
      const code = body['0']?.json?.code;
      if (code) pushEvent(code, pickupStepScenario());
      return mutationOk();
    }),

    http.post('/api/trpc/yaniv.pickupCard', async ({ request }) => {
      const body = (await request.json()) as Record<string, { json: { code: string } }>;
      const code = body['0']?.json?.code;
      if (code) pushEvent(code, pickupScenario());
      return mutationOk();
    }),

    http.post('/api/trpc/yaniv.callYaniv', async ({ request }) => {
      const body = (await request.json()) as Record<string, { json: { code: string } }>;
      const code = body['0']?.json?.code;
      if (code) pushEvent(code, roundSummaryScenario());
      return mutationOk();
    }),

    http.post('/api/trpc/yaniv.startNewRound', async ({ request }) => {
      const body = (await request.json()) as Record<string, { json: { code: string } }>;
      const code = body['0']?.json?.code;
      if (code) pushEvent(code, inProgressScenario());
      return mutationOk();
    }),

    http.post('/api/trpc/yaniv.endTurn', async ({ request }) => {
      const body = (await request.json()) as Record<string, { json: { code: string } }>;
      const code = body['0']?.json?.code;
      if (code) pushEvent(code, waitingForOpponentScenario());
      return mutationOk();
    }),

    http.post('/api/trpc/yaniv.triggerEmoji', () => mutationOk()),
  ];
}
