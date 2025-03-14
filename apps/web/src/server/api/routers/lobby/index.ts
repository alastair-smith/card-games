import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { getLobbyPlayers, getLobbySummary, lobbySchema } from "@/server/service/data/lobby";
import { DataServiceError, DataServiceErrorCode } from "@/server/service/data/redis";
import { subscriber } from "@/server/service/events/server";
import { createGame, joinGame } from "@/server/service/state/game/high-card";
import { playerNameSchema } from "@/types/entities";
import { gameCodeSchema, GameType } from "@/types/game";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

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
    .input(z.object({
      name: playerNameSchema,
      ready: z.boolean()
    }))
    .mutation(({ input, ctx: { userId } }) => {

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

      const players = data.players.map((player) => ({ ...player, isHost: player.id === data.host, isCurrentUser: player.id === userId }));

      return players;
    }),

  subscribe: protectedProcedure
    .input(
      z.object({
        code: gameCodeSchema
      }),
    )
    .subscription(async function* ({ input, ctx: { userId } }) {
      const { code } = input;
      const streamKey = `game-updates:${code}`;

      try {
        while (true) {
          const messages = await subscriber.xread(
            'BLOCK',
            0,
            'STREAMS',
            `game:${code}`,
            '$'
          );


          const message = lobbySchema.safeParse(JSON.parse(messages?.[0]?.[1]?.[0]?.[1]?.[1] || ''));

          if (message.data) {
            const players = message.data.players.map((player) => ({ ...player, isHost: player.id === message.data.host, isCurrentUser: player.id === userId }));
            yield { ...message, players };
          } else {
            console.log('bad message?', message.error, JSON.stringify(messages, null, 2))
          }
        }
      } catch (error) {
        console.log('error', error)
      } finally {
        console.log(`Client unsubscribed from ${streamKey}`);
      }
    }),
});
