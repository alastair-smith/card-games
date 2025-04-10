import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { gameStateSchema } from "@/server/data/high-card";
import { subscriber } from "@/server/events/connections";
import { getHighCardChannel, subscribeToHighCard } from "@/server/events/high-card";
import { GameState } from "@/server/state/game/high-card";
import { Rank, Suit } from "@/types/cards";
import { UserId } from "@/types/entities";
import { gameCodeSchema } from "@/types/game";
import { TRPCError } from "@trpc/server";
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
  })).subscription(async function* ({ input: { code }, ctx: { userId } }): AsyncGenerator<GameState> {
    // TODO check user is in game

    const messageQueue: GameState[] = [];

    await subscribeToHighCard();

    function handler(_pattern: string, channel: string, message: string) {
      if (channel === getHighCardChannel(code)) {
        const parsedMessage = JSON.parse(message);
        const messageData = gameStateSchema.safeParse(parsedMessage);

        if (messageData.success) {
          const players = messageData.data.players.map((player) => ({
            ...player,
            isUser: player.id === userId
          }));
          messageQueue.push({ ...messageData.data, players });
        } else {
          console.error('Invalid message format:', messageData.error);
        }
      }
    }

    subscriber.on('pmessage', handler)

    try {
      while (true) {
        if (messageQueue.length > 0) {
          const message = messageQueue.shift();
          if (message) {
            yield message;
          }
        } else {
          await new Promise((resolve) => setTimeout(resolve, 100)); // Wait for new messages
        }
      }
    } catch (error) {
      console.error('Error in subscription:', error);
      throw new TRPCError({
        message: 'Error in subscription',
        code: 'INTERNAL_SERVER_ERROR',
        cause: error
      });
    }
    finally {
      subscriber.off('pmessage', handler);
      console.log('unsubscribed')
    }
    // state: check user is in game

    // subscribe to the game state

    // yield {
    //   players: [{
    //     userId: "1" as UserId,
    //     name: "Player 1",
    //     card: null,
    //     isUser: false,
    //   }, {
    //     userId: "2" as UserId,
    //     name: "Player 2",
    //     card: null,
    //     isUser: true,
    //   }],
    //   winner: null,
    // };


    // await new Promise((resolve) => setTimeout(resolve, 5000));

    // yield {
    //   players: [{
    //     userId: "1" as UserId,
    //     name: "Player 1",
    //     card: {
    //       suit: Suit.HEARTS,
    //       rank: Rank.FOUR
    //     },
    //     isUser: false,
    //   }, {
    //     userId: "2" as UserId,
    //     name: "Player 2",
    //     card: null,
    //     isUser: true,
    //   }],
    //   winner: null,
    // };

    // await new Promise((resolve) => setTimeout(resolve, 5000));

    // yield {
    //   players: [{
    //     userId: "1" as UserId,
    //     name: "Player 1",
    //     card: {
    //       suit: Suit.HEARTS,
    //       rank: Rank.FOUR
    //     },
    //     isUser: false,
    //   }, {
    //     userId: "2" as UserId,
    //     name: "Player 2",
    //     card: {
    //       suit: Suit.DIAMONDS,
    //       rank: Rank.SIX
    //     },
    //     isUser: true,
    //   }],
    //   winner: "2" as UserId,
    // };

    // return;
  })
});
