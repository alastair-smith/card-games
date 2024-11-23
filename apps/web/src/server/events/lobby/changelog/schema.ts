import { z } from "zod";

export const EVENT_NAME = 'lobby.changelog';

export const schema = z.object({
  id: z.string(),
  players: z.array(z.object({
    id: z.string(),
    name: z.string(),
    isReady: z.boolean(),
    isHost: z.boolean()
  }))
});

export type EventData = z.infer<typeof schema>;
