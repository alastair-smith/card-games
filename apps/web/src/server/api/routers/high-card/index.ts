import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { gameStateSchema } from "@/server/data/high-card";
import { subscriber } from "@/server/events/connections";
import { getHighCardChannel, subscribeToHighCard } from "@/server/events/high-card";
import { GameState } from "@/server/state/game/high-card";
import { Rank, Suit } from "@/types/cards";
import { UserId } from "@/types/entities";
import { gameCodeSchema, GameUpdate, HighCardGameState, Player } from "@/types/game";
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

  gameState: protectedProcedure.input(z.object({
    code: gameCodeSchema
  })).subscription(async function* ({ input: { code }, ctx: { userId } }): AsyncGenerator<{
    update: GameUpdate;
    players: Player[];
    state: HighCardGameState;
  }> {
    // get current game state data

    // deal with kicked/left/not available

    // if lobby state

    // join game if not in it

    // yield current lobby state

    // subscribe to lobby state

    // proceed to game state once game started

    // if game state

    // yield current game state

    // subscribe to game state

    // unsubscribe when game ends

    // below is old code but in the working pattern for a subscription

    const messageQueue: LobbySubscription[] = [];

    await subscribeToLobbyState();

    function handler(_pattern: string, channel: string, message: string) {
      if (channel === getLobbyChannel(code)) {
        const parsedMessage = JSON.parse(message);
        const messageData = lobbySchema.safeParse(parsedMessage);

        if (messageData.success) {
          const players = messageData.data.players.map((player) => ({
            ...player,
            isHost: player.id === messageData.data.host,
            isUser: player.id === userId
          }));
          messageQueue.push({ players });
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
  })
});
