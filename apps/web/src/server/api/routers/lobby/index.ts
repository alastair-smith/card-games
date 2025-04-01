import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { getLobbyPlayers, getLobbySummary, lobbySchema } from "@/server/service/data/lobby";
import { DataServiceError, DataServiceErrorCode } from "@/server/service/data/redis";
import { createGame, joinGame, updatePlayer } from "@/server/service/state/game/high-card";
import { playerNameSchema, UserId } from "@/types/entities";
import { gameCodeSchema, GameType, GameCode } from "@/types/game";
import { TRPCError } from "@trpc/server";
import Redis from "ioredis";
import { z } from "zod";


const subscriber = new Redis();

type LobbySubscription = {
  players: {
    name: string;
    isReady: boolean;
    isHost: boolean;
    isUser: boolean;
    id: UserId;
  }[]
}

export const lobbyRouter = createTRPCRouter({
  create: protectedProcedure
    .input(z.object({
      gameType: z.nativeEnum(GameType),
    }))
    .mutation(async ({ ctx: { userId } }) => {
      const { code } = await createGame({ host: userId });

      return { code };
    }),

  getSummary: protectedProcedure
    .input(z.object({
      code: gameCodeSchema,
    }))
    .query(async ({ input }) => {
      try {
        const data = await getLobbySummary({ code: input.code });

        return {
          code: data.code,
          type: data.type,
        };
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
    }),

  join: protectedProcedure
    .input(z.object({
      code: gameCodeSchema
    }))
    .mutation(async ({ input, ctx: { userId } }) => {
      try {
        const { host, players } = await joinGame({ code: input.code, userId });

        return {
          host, players
        };
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
    }),

  updatePlayer: protectedProcedure
    .input(z.union([
      z.object({
        code: gameCodeSchema,
        field: z.literal('name'),
        value: playerNameSchema
      }),
      z.object({
        code: gameCodeSchema,
        field: z.literal('isReady'),
        value: z.boolean()
      })
    ]))
    .mutation(async ({ input, ctx: { userId } }) => {
      await updatePlayer({ userId, ...input });
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

  getPlayers: protectedProcedure
    .input(
      z.object({
        code: gameCodeSchema
      }),
    )
    .query(async ({ input, ctx: { userId } }) => {
      const { code } = input;

      const data = await getLobbyPlayers({ code });

      const players = data.players.map((player) => ({ ...player, isHost: player.id === data.host, isUser: player.id === userId }));

      return players;
    }),

  subscribe: protectedProcedure
    .input(
      z.object({
        code: gameCodeSchema
      }),
    )
    .subscription(async function* ({ input, ctx: { userId } }): AsyncGenerator<LobbySubscription> {
      try {
        const { code } = input;
        const streamKey = `game:${code}`;

        // TODO cleanup old subscriptions
        // TODO handle errors
        // TODO handle reconnections
        const subscription = subscriber.subscribe(streamKey, (err, count) => {
          if (err) {
            console.error('Error subscribing to stream:', err);
            throw new TRPCError({
              message: 'Error subscribing to stream',
              code: 'INTERNAL_SERVER_ERROR',
              cause: err
            });
          } else {
            console.log(`Subscribed to ${streamKey}, count: ${count}`);
          }
        });

        const messageQueue: LobbySubscription[] = [];

        function handler(channel: string, message: string) {
          if (channel === streamKey) {
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

        subscriber.on('message', handler)

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
    }),
});
