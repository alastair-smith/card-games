import { gameCodeSchema } from "@/types/game";
import { protectedProcedure } from "@/server/api/trpc";
import { z } from "zod";

export const pickupCard = protectedProcedure
  .input(z.object({
    code: gameCodeSchema,
  }))
  .mutation(async ({ input: { code }, ctx: { userId } }) => {
    return;
  })