import { http, HttpResponse } from 'msw';

function mutationOk() {
  return HttpResponse.json([{ result: { data: { json: null } } }]);
}

export function getLobbyHandlers() {
  return [
    http.post('/api/trpc/lobby.updatePlayer', () => mutationOk()),
    http.post('/api/trpc/lobby.leaveGame', () => mutationOk()),
    http.post('/api/trpc/lobby.kickPlayer', () => mutationOk()),
    http.post('/api/trpc/lobby.makeHost', () => mutationOk()),
  ];
}
