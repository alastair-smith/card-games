import { gameCodeSchema } from "@/types/game";
import { protectedProcedure } from "@/server/api/trpc";
import { z } from "zod";
import { DataServiceError, DataServiceErrorCode } from "@/server/data/redis";
import { TRPCError } from "@trpc/server";

export const startGame = protectedProcedure
  .input(z.object({
    code: gameCodeSchema
  }))
  .mutation(async ({ input: { code }, ctx: { userId } }) => {
    try {
      // TODO implement start game logic
      // This should check if the user is the host, if the game is ready to start, etc.
      return;
    } catch (error: unknown) {
      if (error instanceof DataServiceError && error.code === DataServiceErrorCode.NOT_FOUND) {
        throw new TRPCError({
          message: 'Lobby not found',
          code: 'NOT_FOUND',
          cause: error
        });
      } else {
        throw error;
      }
    }
  })