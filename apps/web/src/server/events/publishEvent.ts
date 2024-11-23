import { ee } from "@/server/events/emitter";
import type { z, ZodSchema } from "zod";

export const publisher = <T extends ZodSchema<object>>(eventName: string, schema: T) => (rawData: z.infer<T>) => {
  const data: z.infer<T> = schema.parse(rawData);

  const event =  {
    name: eventName,
    data: data,
  }

  return {
    publish: () => {
      ee.emit('add', event);
    },
    event: event,
  }
}