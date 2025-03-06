import { z } from "zod";

export const authBodySchema = z.object({
  callbackUrl: z.string().url(),
})