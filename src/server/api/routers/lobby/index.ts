import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { z } from "zod";
import { joinSchema } from "./schemas";

export const lobbyRouter = createTRPCRouter({
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
