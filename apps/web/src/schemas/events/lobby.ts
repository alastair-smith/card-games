import { z } from "zod";
import { joinCodeSchema, playerIdSchema, playerNameSchema } from "@/schemas/entities";

export const LOBBY_EVENT_NAME = {
  GAME_STARTED: "GAME_STARTED",
  PLAYER_HOST_CHANGE: "PLAYER_HOST_CHANGE",
  PLAYER_JOINED: "PLAYER_JOINED",
  PLAYER_LEFT: "PLAYER_LEFT",
  PLAYER_NAME_CHANGE: "PLAYER_NAME_CHANGE",
  PLAYER_READY_CHANGE: "PLAYER_READY_CHANGE",
} as const;

type LobbyEventName = (typeof LOBBY_EVENT_NAME)[keyof typeof LOBBY_EVENT_NAME];

const lobbyEvent = <T extends z.ZodSchema>(
  eventName: LobbyEventName,
  schema?: T,
) =>
  z.object({
    id: z
      .string()
      .uuid()
      .describe(
        "unique identifier for the event to prevent duplicate processing and to aid with debugging",
      ),
    joinCode: joinCodeSchema,
    eventName: z.literal(eventName),
    ...(schema ? { data: schema } : {}),
  });

/* LOBBY EVENTS */

export const gameStartedEventSchema = lobbyEvent(LOBBY_EVENT_NAME.GAME_STARTED);

export const playerHostChangeEventSchema = lobbyEvent(
  LOBBY_EVENT_NAME.PLAYER_HOST_CHANGE,
  z.object({
    playerId: playerIdSchema,
    isHost: z.boolean(),
  }),
);

export const playerJoinedEventSchema = lobbyEvent(
  LOBBY_EVENT_NAME.PLAYER_JOINED,
  z.object({
    playerId: playerIdSchema,
    name: playerNameSchema,
  }),
);

export const playerLeftEventSchema = lobbyEvent(
  LOBBY_EVENT_NAME.PLAYER_LEFT,
  z.object({
    playerId: playerIdSchema,
  }),
);

export const playerNameChangeEventSchema = lobbyEvent(
  LOBBY_EVENT_NAME.PLAYER_NAME_CHANGE,
  z.object({
    playerId: playerIdSchema,
    name: playerNameSchema,
  }),
);

export const playerReadyChangeEventSchema = lobbyEvent(
  LOBBY_EVENT_NAME.PLAYER_READY_CHANGE,
  z.object({
    playerId: playerIdSchema,
    isReady: z.boolean(),
  }),
);
