import { TRPCError } from '@trpc/server';
import { getLobby, setLobby } from '~/server/data/lobby';
import emitter from '~/server/events/emitter';
import { getLobbyChannel } from '~/server/events/lobby';
import { withLock } from '~/server/state/lib/locks';
import type { UserId } from '~/types/entities';
import { type GameCode, GameUpdate } from '~/types/game';
import { logger } from '~/utils/logger';

export async function removePlayer({
  gameCode,
  actor,
  target,
}: {
  gameCode: GameCode;
  actor: UserId;
  target: UserId;
}) {
  return withLock('lobby', gameCode, async () => {
    const lobby = await getLobby({ code: gameCode });

    if (!lobby) {
      logger.error(`Lobby with code ${gameCode} not found.`);
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Game not found.',
      });
    }

    const targetPlayer = lobby.players.find((player) => player.id === target);
    if (!targetPlayer) {
      logger.warn(`Target player ${target} not found in lobby ${gameCode}.`);
      return; // Target not in game, nothing to do
    }

    const actorInLobby = lobby.players.some((player) => player.id === actor);
    if (!actorInLobby) {
      logger.error(`Actor ${actor} not found in lobby ${gameCode}.`);
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'Actor not in game.',
      });
    }

    const isHost = lobby.host === actor;
    const isTarget = actor === target;

    if (!isHost && !isTarget) {
      logger.error(
        `Actor ${actor} is neither host nor target in lobby ${gameCode}.`,
      );
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'Only the host can kick other players.',
      });
    }

    const updatedPlayers = lobby.players.filter(
      (player) => player.id !== target,
    );
    const updatedLobby = { ...lobby, players: updatedPlayers };

    await setLobby({ code: gameCode }, updatedLobby);

    const updateType =
      isHost && !isTarget ? GameUpdate.KICKED : GameUpdate.LEFT_GAME;

    emitter.emit(getLobbyChannel(gameCode), updatedLobby);

    logger.info(
      `Player ${target} ${updateType === GameUpdate.KICKED ? 'kicked from' : 'left'} lobby ${gameCode} by actor ${actor}.`,
    );
  });
}
