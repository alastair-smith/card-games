import { ee } from "@/server/events/emitter";
import type { z, ZodSchema } from "zod";

export const publishEvent = <T extends ZodSchema<object>>(eventName: string, schema: T) => (rawData: z.infer<T>) => {
  const data: z.infer<T> = schema.parse(rawData);

  const wrappedEvent = {
    name: eventName,
    data: data,
  }
  ee.emit(eventName, wrappedEvent);
}