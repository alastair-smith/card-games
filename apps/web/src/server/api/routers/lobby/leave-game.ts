import { gameCodeSchema } from "@/types/game";
import { protectedProcedure } from "@/server/api/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { DataServiceError, DataServiceErrorCode } from "@/server/data/redis";

export const leaveGame = protectedProcedure
  .input(z.object({
    code: gameCodeSchema
  }))
  .mutation(async ({ input, ctx: { userId } }) => {
    try {
      // TODO impleement leave game logic
      return;
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
  })