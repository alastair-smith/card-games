import { TRPCError } from '@trpc/server';
import { getLobby, setLobby } from '~/server/data/lobby';
import { withLobbyLock } from '~/server/data/lobby-lock';
import emitter from '~/server/events/emitter';
import { getLobbyChannel } from '~/server/events/lobby';
import type { UserId } from '~/types/entities';
import type { GameCode } from '~/types/game';
import { logger } from '~/utils/logger';

export function makeHost({
  gameCode,
  target,
  actor,
}: {
  gameCode: GameCode;
  target: UserId;
  actor: UserId;
}) {
  return withLobbyLock(gameCode, async () => {
    // check game exists
    const lobby = await getLobby({ code: gameCode });
    if (!lobby) {
      logger.warn(`Lobby with code ${gameCode} not found.`);
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Game not found.',
      });
    }

    // check actor is host in game
    if (lobby.host !== actor) {
      logger.warn(`Actor ${actor} is not the host of lobby ${gameCode}.`);
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'Only the host can transfer host privileges.',
      });
    }

    // check target is in game
    const targetPlayer = lobby.players.find((player) => player.id === target);
    if (!targetPlayer) {
      logger.warn(`Target player ${target} not found in lobby ${gameCode}.`);
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Target player not found in game.',
      });
    }

    // set target as host
    const updatedLobby = { ...lobby, host: target };

    // store updated game state
    await setLobby({ code: gameCode }, updatedLobby);

    // publish lobby state update
    emitter.emit(getLobbyChannel(gameCode), updatedLobby);

    logger.info(
      `Player ${target} is now the host of lobby ${gameCode}, transferred by ${actor}.`,
    );
  });
}
