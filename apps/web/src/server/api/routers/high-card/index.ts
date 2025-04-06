import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { gameCodeSchema } from "@/types/game";
import { z } from "zod";

export const highCardRouter = createTRPCRouter({
  pickupCard: protectedProcedure.input(z.object({
    code: gameCodeSchema
  })).mutation(({ input: { code }, ctx: { userId } }) => {
    // auth: check user is in game

    // state: check it is user's turn

    // state: draw a card from the deck

    // state:data assign the card to the player

    // state:event emit the update
  }),

  subscription: protectedProcedure.input(z.object({
    code: gameCodeSchema
  })).subscription(async function* () { })
});
