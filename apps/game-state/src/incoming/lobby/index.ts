import { z } from "zod";
import { procedure } from "../procedure.js";
import { pong } from "../../outgoing/lobby/index.js";

export const lobbyRoutes = {
  changeName: procedure()
    .input(
      z.object({
        name: z.string(),
      }),
    )
    .handle(({ input, user, lobby }) => {
      console.log(`[Procedure] Changing name to:`, input.name);

      pong(lobby, "from server: " + input.name);

      return;
    }),
};
