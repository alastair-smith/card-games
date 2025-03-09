import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { getLobbySummary } from "@/server/service/data/lobby";
import { DataServiceError, DataServiceErrorCode } from "@/server/service/data/redis";
import { createGame, joinGame } from "@/server/service/state/game/high-card";
import { gameCodeSchema, GameType } from "@/types/game";
import { TRPCBuilder, TRPCError } from "@trpc/server";
import { z } from "zod";

export const lobbyRouter = createTRPCRouter({
  create: protectedProcedure
    .input(z.object({
      gameType: z.nativeEnum(GameType),
    }))
    .mutation(async ({ ctx: { userId } }) => {
      const { code } = await createGame({ host: userId });

      return { code };
    }),

  getSummary: protectedProcedure
    .input(z.object({
      code: gameCodeSchema,
    }))
    .query(async ({ input }) => {
      try {
        const data = await getLobbySummary({ code: input.code });

        return {
          code: data.code,
          type: data.type,
        };
      } catch (error: unknown) {
        if (error instanceof DataServiceError && error.code === DataServiceErrorCode.NOT_FOUND) {
          throw new TRPCError({
            message: 'Lobby not found',
            code: 'NOT_FOUND',
            cause: error
          })
        } else {
          throw error;
        }
      }
    }),

  join: protectedProcedure
    .input(z.object({
      code: gameCodeSchema
    }))
    .mutation(async ({ input, ctx: { userId } }) => {
      try {
        const { host, players } = await joinGame({ code: input.code, userId });

        return {
          host, players
        };
      } catch (error: unknown) {
        if (error instanceof DataServiceError && error.code === DataServiceErrorCode.NOT_FOUND) {
          throw new TRPCError({
            message: 'Lobby not found',
            code: 'NOT_FOUND',
            cause: error
          })
        } else {
          throw error;
        }
      }
    }),

  setReadyStatus: protectedProcedure
    .input(
      z.object({
        ready: z.boolean(),
      }),
    )
    .mutation((opts) => {
      return {
        ready: opts.input.ready,
      };
    }),

  subscribe: protectedProcedure
    .input(
      z.object({
        code: z.string(),
      }),
    )
    .subscription(async function* (opts) {
      // if (
      //   !(await opts.ctx.db.gameInstancePlayer.findUnique({
      //     where: {
      //       gameInstanceJoinCode_playerUserId: {
      //         gameInstanceJoinCode: opts.input.code,
      //         playerUserId: opts.ctx.userId,
      //       },
      //     },
      //   }))
      // ) {
      //   // join game if not already in it
      //   const game = await opts.ctx.db.gameInstance.update({
      //     where: {
      //       joinCode: opts.input.code,
      //     },
      //     data: {
      //       gameInstancePlayers: {
      //         create: {
      //           playerUserId: opts.ctx.userId,
      //           ready: false,
      //         },
      //       },
      //     },
      //     select: {
      //       joinCode: true,
      //       hostUserId: true,
      //       gameInstancePlayers: {
      //         select: {
      //           ready: true,
      //           player: {
      //             select: {
      //               id: true,
      //               name: true,
      //             },
      //           },
      //         },
      //       },
      //     },
      //   });

      //   lobbyChangelogPublisher({
      //     id: game.joinCode,
      //     players: game.gameInstancePlayers.map((player) => ({
      //       id: player.player.id,
      //       name: player.player.name,
      //       isReady: player.ready,
      //       isHost: player.player.id === game.hostUserId,
      //     })),
      //   }).publish();
      // }

      // const game = await opts.ctx.db.gameInstance.findUniqueOrThrow({
      //   where: {
      //     joinCode: opts.input.code,
      //   },
      //   select: {
      //     joinCode: true,
      //     hostUserId: true,
      //     gameInstancePlayers: {
      //       select: {
      //         ready: true,
      //         player: {
      //           select: {
      //             id: true,
      //             name: true,
      //           },
      //         },
      //       },
      //     },
      //   },
      // });

      // // tell client about current state
      // yield lobbyChangelogPublisher({
      //   id: game.joinCode,
      //   players: game.gameInstancePlayers.map((player) => ({
      //     id: player.player.id,
      //     name: player.player.name,
      //     isReady: player.ready,
      //     isHost: player.player.id === game.hostUserId,
      //   })),
      // }).event;

      // // subscribe to future changes
      // for await (const [data] of on(ee, "add", {
      //   // Passing the AbortSignal from the request automatically cancels the event emitter when the request is aborted
      //   signal: opts.signal,
      // })) {
      //   yield data;
      // }
    }),
});
