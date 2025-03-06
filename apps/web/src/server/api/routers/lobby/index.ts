import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { z } from "zod";
import { GameType } from "@/types/game";
import { TRPCError } from "@trpc/server";
import { generateGameCode } from "./generateGameCode";
import { ee } from "@/server/events/emitter";
import { on } from "events";
import { lobbyChangelogPublisher } from "@/server/events/lobby/changelog/publish";

export const lobbyRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        gameType: z.nativeEnum(GameType),
      }),
    )
    .mutation(async (opts) => {
      return {};
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
