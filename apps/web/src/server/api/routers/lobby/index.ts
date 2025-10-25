import { createTRPCRouter } from '~/server/api/trpc';
import { create } from './create';
import { getSummary } from './get-summary';
import { kickPlayer } from './kick-player';
import { leaveGame } from './leave-game';
import { makeHost } from './make-host';
import { updatePlayer } from './update-player';

export const lobbyRouter = createTRPCRouter({
  create,
  getSummary,
  kickPlayer,
  leaveGame,
  makeHost,
  updatePlayer,
});
