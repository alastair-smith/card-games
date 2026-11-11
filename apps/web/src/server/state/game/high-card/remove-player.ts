import { TRPCError } from '@trpc/server';
import { deleteLobby, getLobby, setLobby } from '~/server/data/lobby';
import { runTransaction } from '~/server/data/redis';
import { deleteShitheadState } from '~/server/data/shithead';
import { deleteYanivState } from '~/server/data/yaniv';
import emitter from '~/server/events/emitter';
import { getLobbyChannel } from '~/server/events/lobby';
import { withLock } from '~/server/state/lib/locks';
import type { UserId } from '~/types/entities';
import { type GameCode, GameType, GameUpdate } from '~/types/game';
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

    if (lobby.type !== GameType.HIGH_CARD && lobby.isGameStarted) {
      logger.warn(`Lobby ${gameCode} has already started.`);
      throw new TRPCError({
        code: 'CONFLICT',
        message: 'The game has already started.',
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
    const [nextHost] = updatedPlayers;
    const updatedLobby = {
      ...lobby,
      players: updatedPlayers,
      host: lobby.host === target && nextHost ? nextHost.id : lobby.host,
    };

    if (nextHost) {
      await setLobby({ code: gameCode }, updatedLobby);
    } else {
      await runTransaction(async (transaction) => {
        await deleteLobby({ code: gameCode }, transaction);
        if (lobby.type === GameType.YANIV) {
          await deleteYanivState({ code: gameCode }, transaction);
        }
        if (lobby.type === GameType.SHITHEAD) {
          await deleteShitheadState({ code: gameCode }, transaction);
        }
      });
    }

    const updateType =
      isHost && !isTarget ? GameUpdate.KICKED : GameUpdate.LEFT_GAME;

    emitter.emit(getLobbyChannel(gameCode), updatedLobby);

    logger.info(
      `Player ${target} ${updateType === GameUpdate.KICKED ? 'kicked from' : 'left'} lobby ${gameCode} by actor ${actor}.`,
    );
  });
}
