import { z } from "zod";
import { procedure } from "../procedure.js";

export const lobbyRoutes = {
  changeName: procedure()
    .input(z.object({
      name: z.string(),
    }))
    .handle(({ name }) => {
      console.log(`[Procedure] Changing name to:`, name);
      return;
    }),
}