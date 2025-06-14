import { gameCodeSchema } from "@/types/game";
import { protectedProcedure } from "@/server/api/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { DataServiceError, DataServiceErrorCode } from "@/server/data/redis";
import { userIdSchema } from "@/types/entities";

export const kickPlayer = protectedProcedure
  .input(z.object({
    code: gameCodeSchema,
    playerId: userIdSchema
  }))
  .mutation(async ({ input, ctx: { userId } }) => {
    try {
      // TODO impleement kick player logic
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