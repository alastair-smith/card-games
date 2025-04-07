import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { GameState } from "@/server/state/game/high-card";
import { Rank, Suit } from "@/types/cards";
import { UserId } from "@/types/entities";
import { gameCodeSchema } from "@/types/game";
import { z } from "zod";

export const highCardRouter = createTRPCRouter({
  pickupCard: protectedProcedure.input(z.object({
    code: gameCodeSchema
  })).mutation(({ input: { code }, ctx: { userId } }) => {
    // state: check user is in game

    // state: check it is user's turn

    // state: draw a card from the deck

    // state:data assign the card to the player

    // state:event emit the update
  }),

  subscription: protectedProcedure.input(z.object({
    code: gameCodeSchema
  })).subscription(async function* (): AsyncGenerator<GameState> {
    // state: check user is in game

    // subscribe to the game state

    yield {
      players: [{
        userId: "1" as UserId,
        name: "Player 1",
        card: null,
        isUser: false,
      }, {
        userId: "2" as UserId,
        name: "Player 2",
        card: null,
        isUser: true,
      }],
      winner: null,
    };


    await new Promise((resolve) => setTimeout(resolve, 5000));

    yield {
      players: [{
        userId: "1" as UserId,
        name: "Player 1",
        card: {
          suit: Suit.HEARTS,
          rank: Rank.FOUR
        },
        isUser: false,
      }, {
        userId: "2" as UserId,
        name: "Player 2",
        card: null,
        isUser: true,
      }],
      winner: null,
    };

    await new Promise((resolve) => setTimeout(resolve, 5000));

    yield {
      players: [{
        userId: "1" as UserId,
        name: "Player 1",
        card: {
          suit: Suit.HEARTS,
          rank: Rank.FOUR
        },
        isUser: false,
      }, {
        userId: "2" as UserId,
        name: "Player 2",
        card: {
          suit: Suit.DIAMONDS,
          rank: Rank.SIX
        },
        isUser: true,
      }],
      winner: "2" as UserId,
    };

    return;
  })
});
