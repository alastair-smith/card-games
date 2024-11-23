import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { z } from "zod";
import { joinSchema } from "./schemas";
import { GameType } from "@repo/database";
import { TRPCError } from "@trpc/server";
import { generateGameCode } from "./generateGameCode";
import { ee } from "@/server/events/emitter";
import { on } from "events";

export const lobbyRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        gameType: z.nativeEnum(GameType),
      }),
    )
    .mutation(async (opts) => {
      try {
        const game = await opts.ctx.db.gameInstance.create({
          data: {
            joinCode: generateGameCode(),
            gameType: opts.input.gameType,
            hostUserId: opts.ctx.userId,
            gameInstancePlayers: {
              create: {
                playerUserId: opts.ctx.userId,
                ready: false,
              },
            },
          },
          select: {
            joinCode: true,
          },
        });

        return {
          code: game.joinCode,
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Something went wrong creating the game. Please try again.",
          cause: error,
        });
      }
    }),

  join: protectedProcedure.input(joinSchema).mutation((opts) => {
    return {
      code: opts.input.code,
    };
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

  subscribe: protectedProcedure.input(z.object({
    code: z.string(),
  })).subscription(async function*(opts) {
    for await (const [data] of on(ee, 'add', {
      // Passing the AbortSignal from the request automatically cancels the event emitter when the request is aborted
      signal: opts.signal,
    })) {
      const post = `from server: ${data}`
      yield post;
    }
  })
});
