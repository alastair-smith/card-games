import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { z } from "zod";
import { joinSchema } from "./schemas";
import { GameType } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { generateGameCode } from "./generateGameCode";

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
});
